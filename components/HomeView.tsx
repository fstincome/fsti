import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppView } from '../types.ts';
import { supabase } from '../src/supabaseClient';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Building2, 
  ArrowRight, 
  MapPin, 
  Wallet, 
  X, 
  AlertTriangle,
  Lock,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

interface HomeViewProps {
  setView: (view: AppView) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setView }) => {
  const { t } = useTranslation();
  const [latestJobs, setLatestJobs] = useState<any[]>([]);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  
  // État pour la modale de feedback
  const [feedback, setFeedback] = useState<{
    show: boolean;
    type: 'auth' | 'category' | 'success';
    message: string;
  }>({ show: false, type: 'auth', message: '' });

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(3);
      if (data) setLatestJobs(data);
    };
    fetchJobs();
  }, []);

  const handleApply = async (job: any) => {
    const rawUser = localStorage.getItem('fsti_user');
    const storedUser = JSON.parse(rawUser || '{}');
  
    if (!storedUser.id) {
      setFeedback({ show: true, type: 'auth', message: "Connectez-vous pour postuler." });
      return;
    }
  
    setApplyingId(job.id);
  
    try {
      // 1. On récupère le vrai ID du profil talent (le UUID de la table public.talents)
      // On le cherche via le user_id qui fait le lien avec auth.users
      const { data: talentProfile, error: talentError } = await supabase
        .from('talents')
        .select('id, category')
        .eq('id', storedUser.id)
        .single();
  
      if (talentError || !talentProfile) {
        throw new Error("Profil talent introuvable. Veuillez compléter votre profil.");
      }
  
      // 2. Vérification de catégorie (optionnel mais recommandé)
      if (talentProfile.category?.trim().toLowerCase() !== job.category?.trim().toLowerCase()) {
        setFeedback({
          show: true,
          type: 'category',
          message: `Incompatibilité : Votre profil (${talentProfile.category}) ne correspond pas à ce job (${job.category}).`
        });
        setApplyingId(null);
        return;
      }
  
      // 3. Insertion propre (Maintenant que la contrainte SQL est corrigée)
      const { error: insertError } = await supabase
        .from('job_applications')
        .insert([
          { 
            job_id: job.id, 
            talent_id: talentProfile.id, // C'est l'ID de public.talents !
            status: 'pending' 
          }
        ]);
  
      if (insertError) throw insertError;
  
      setFeedback({
        show: true,
        type: 'success',
        message: "Candidature enregistrée avec succès !"
      });
  
    } catch (err: any) {
      console.error("Erreur candidature:", err);
      alert(`Erreur : ${err.message || 'Impossible de postuler'}`);
    } finally {
      setApplyingId(null);
    }
  };
  return (
    <div className="animate-fadeIn space-y-24 pb-20 bg-white dark:bg-slate-950 transition-colors duration-500">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[700px] w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] overflow-hidden group">
        <img 
          src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-105" 
          alt="FSTI Hero"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent">
          <div className="max-w-[1440px] mx-auto h-full flex flex-col justify-center px-8 lg:px-20 text-white space-y-8">
            <span className="bg-blue-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] w-fit shadow-2xl animate-pulse">
              {t('hero_badge')}
            </span>
            <h1 className="text-7xl lg:text-[120px] font-black tracking-tighter leading-[0.8] italic uppercase">
              {t('hero_title_1')}<br/>
              <span className="text-blue-400 drop-shadow-2xl">{t('hero_title_2')}</span>
            </h1>
            <p className="text-xl lg:text-2xl max-w-2xl opacity-90 font-medium leading-relaxed italic border-l-4 border-blue-400 pl-6">
              {t('hero_subtitle')}
            </p>
            <div className="flex gap-6 pt-8">
              <button 
                onClick={() => setView('marketplace')} 
                className="bg-white text-slate-900 px-14 py-6 rounded-full font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 shadow-2xl"
              >
                {t('view_talents')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION IMPACT */}
      <section className="relative w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800">
          {[
            { label: t('impact_trained'), val: '50', icon: '👥' },
            { label: t('impact_inclusion'), val: '20%', icon: '♿' },
            { label: t('impact_services'), val: '30', icon: '🛠️' },
            { label: t('impact_weeks'), val: '10', icon: '⏱️' }
          ].map((stat, i) => (
            <div key={i} className="p-16 flex flex-col items-center text-center space-y-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
              <span className="text-4xl group-hover:scale-110 transition-transform">{stat.icon}</span>
              <div>
                <h3 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white">{stat.val}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SECTION ÉCOSYSTÈME */}
      <section className="px-8 lg:px-20 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase dark:text-white italic">
            L'Écosystème <span className="text-blue-600">FSTI</span>
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Connecter les compétences au marché</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-50 dark:bg-slate-900 p-10 rounded-[40px] border-b-8 border-emerald-500 space-y-6 hover:-translate-y-2 transition-transform">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
              <User size={32} />
            </div>
            <h3 className="text-3xl font-black dark:text-white uppercase italic">Talents</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Développeurs, designers et marketeurs certifiés FSTI.</p>
            <button onClick={() => setView('marketplace')} className="flex items-center gap-2 font-black uppercase text-xs text-emerald-600 tracking-widest group">Explorer les profils <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" /></button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-10 rounded-[40px] border-b-8 border-blue-600 space-y-6 hover:-translate-y-2 transition-transform">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
              <GraduationCap size={32} />
            </div>
            <h3 className="text-3xl font-black dark:text-white uppercase italic">Coaches</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Experts seniors qui accompagnent nos talents.</p>
            <button onClick={() => setView('coaches')} className="flex items-center gap-2 font-black uppercase text-xs text-blue-600 tracking-widest group">Rencontrer les mentors <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" /></button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-10 rounded-[40px] border-b-8 border-slate-900 dark:border-white space-y-6 hover:-translate-y-2 transition-transform">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white">
              <Building2 size={32} />
            </div>
            <h3 className="text-3xl font-black dark:text-white uppercase italic">Recruteurs</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Entreprises sourçant leurs futurs leaders technologiques.</p>
            <button onClick={() => setView('recruiters')} className="flex items-center gap-2 font-black uppercase text-xs text-slate-900 dark:text-white tracking-widest group">Voir les entreprises <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" /></button>
          </div>
        </div>
      </section>

      {/* 4. DERNIÈRES OPPORTUNITÉS */}
      <section className="px-8 lg:px-20 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4">
            <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px]">Work & Income</span>
            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase dark:text-white">Jobs <span className="italic text-slate-300 dark:text-slate-700">Recent</span></h2>
          </div>
          <button onClick={() => setView('marketplace')} className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/10">Toutes les offres</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {latestJobs.map((job) => (
            <div key={job.id} className="group bg-white dark:bg-slate-900 p-8 rounded-[35px] border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Briefcase size={24} /></div>
                <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase dark:text-slate-400">{job.category}</span>
              </div>
              <h4 className="text-2xl font-black dark:text-white mb-4 group-hover:text-blue-600 transition-colors uppercase leading-tight">{job.title}</h4>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm font-bold"><MapPin size={16} /> {job.location || 'Remote'}</div>
                <div className="flex items-center gap-3 text-emerald-600 text-sm font-black italic"><Wallet size={16} /> {job.salary_range ? `${job.salary_range} (BIF)` : 'A discuter'}</div>
              </div>
              <button 
                onClick={() => handleApply(job)}
                disabled={applyingId === job.id}
                className="w-full py-4 rounded-xl border-2 border-slate-900 dark:border-white font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all flex items-center justify-center gap-2"
              >
                {applyingId === job.id ? <div className="animate-spin h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full" /> : "Postuler maintenant"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PROBLÈME & CTA FINAUX */}
      <section className="px-8 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1">
          <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000" className="rounded-[40px] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500" alt="FSTI" />
        </div>
        <div className="space-y-8 order-1 lg:order-2">
          <span className="text-blue-600 font-black uppercase tracking-widest text-xs">{t('analysis_tag')}</span>
          <h2 className="text-5xl lg:text-6xl font-black tracking-tighter dark:text-white">{t('problem_title')}</h2>
          <p className="border-l-4 border-red-500 pl-6 text-xl text-slate-600 dark:text-slate-400 font-medium">{t('problem_text')}</p>
        </div>
      </section>

      <section className="text-center py-20 px-8">
        <h2 className="text-7xl lg:text-9xl font-black tracking-tighter italic mb-10 dark:text-white uppercase leading-none">{t('cta_title')}</h2>
        <button onClick={() => setView('register')} className="bg-slate-900 dark:bg-blue-600 text-white px-16 py-8 rounded-full font-black text-xl uppercase tracking-tighter hover:scale-105 transition-all shadow-2xl active:scale-95">{t('cta_button')}</button>
      </section>

      {/* --- MODALE DE FEEDBACK --- */}
      {feedback.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 relative animate-slideUp">
            <button onClick={() => setFeedback({ ...feedback, show: false })} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
            
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 ${feedback.type === 'auth' ? 'bg-amber-100 text-amber-600' : feedback.type === 'category' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {feedback.type === 'auth' ? <Lock size={40} /> : feedback.type === 'category' ? <AlertTriangle size={40} /> : <CheckCircle size={40} />}
            </div>

            <h3 className="text-3xl font-black italic uppercase tracking-tighter dark:text-white mb-4 leading-tight">
              {feedback.type === 'auth' ? 'Accès Restreint' : feedback.type === 'category' ? 'Incompatibilité' : 'C\'est parti !'}
            </h3>
            
            <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 leading-relaxed italic">
              {feedback.message}
            </p>

            {feedback.type === 'auth' ? (
              <button 
                onClick={() => setView('register')}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition-all"
              >
                Rejoindre comme Participant <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                onClick={() => setFeedback({ ...feedback, show: false })}
                className="w-full py-5 bg-slate-100 dark:bg-slate-800 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
              >
                Compris
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};