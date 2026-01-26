import React, { useState, useEffect } from 'react';
import { 
  User, LogOut, Award, MapPin, Briefcase, Eye, EyeOff, 
  QrCode, ShieldCheck, Globe, Users, BookOpen, Calendar, 
  ChevronRight, Star
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('fsti_user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  if (!user) return null;

  const isCoach = user.role === 'coach';

  return (
    <div className="animate-fadeIn space-y-8 pb-24">
      {/* HEADER UNIFIÉ (Mais badges différents) */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[50px] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
          <div className="w-32 h-32 rounded-[35px] bg-gradient-to-br from-slate-800 to-black flex items-center justify-center shadow-2xl border-4 border-white dark:border-slate-800">
            {isCoach ? <ShieldCheck size={60} className="text-blue-500" /> : <User size={60} className="text-white" />}
          </div>
          
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase italic mb-2">
              {user.full_name}
            </h1>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isCoach ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'}`}>
                {isCoach ? 'OFFICIAL COACH' : 'ELITE TALENT'}
              </span>
              <span className="px-4 py-1 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                <MapPin size={12} /> {user.province || 'HUB NATIONAL'}
              </span>
            </div>
          </div>

          <button onClick={() => { localStorage.removeItem('fsti_user'); window.location.href='/'; }} className="px-8 py-5 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all">
            Déconnexion
          </button>
        </div>
      </div>

      {/* CONTENU CONDITIONNEL : COACH vs PARTICIPANT */}
      {isCoach ? (
        /* --- DASHBOARD DU COACH --- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Coach */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatBox icon={<Users className="text-blue-500" />} label="Élèves suivis" value="12" />
              <StatBox icon={<Star className="text-yellow-500" />} label="Note Expert" value="4.9/5" />
            </div>

            {/* Liste des Talents assignés (Simulation) */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-6 dark:text-white flex items-center justify-between">
                Talents à Encadrer
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500">VOIR TOUT</span>
              </h3>
              <div className="space-y-4">
                <TalentRow name="Alain Mugisha" specialty="React Native" status="En progression" />
                <TalentRow name="Bella Inamahoro" specialty="UI/UX Design" status="À évaluer" />
                <TalentRow name="Clément Nduwimana" specialty="CyberSec" status="Certifié" />
              </div>
            </div>
          </div>

          {/* Sidebar Coach */}
          <div className="space-y-8">
            <div className="bg-blue-600 rounded-[40px] p-8 text-white">
              <Calendar className="mb-4" size={32} />
              <h4 className="text-lg font-black uppercase tracking-tighter italic">Prochaine Session</h4>
              <p className="text-white/80 text-xs font-bold mt-2">Webinaire : Architecture Cloud</p>
              <p className="text-[10px] font-black mt-4 bg-white/20 inline-block px-3 py-1 rounded-lg">DEMAIN • 14:00 CAT</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-black uppercase dark:text-white mb-4">Spécialité</h4>
              <p className="text-2xl font-black text-blue-600 italic uppercase">{user.specialty}</p>
            </div>
          </div>
        </div>
      ) : (
        /* --- DASHBOARD DU PARTICIPANT (Déjà fait, résumé ici) --- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800">
             <h3 className="text-xl font-black uppercase tracking-tighter mb-6 dark:text-white flex items-center gap-3">
               <BookOpen className="text-emerald-500" /> Mon Parcours Talent
             </h3>
             <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border-l-4 border-emerald-500">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Titre Actuel</p>
                <p className="text-xl font-black dark:text-white italic uppercase">{user.role_title}</p>
             </div>
             <div className="mt-8">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Compétences déclarées</p>
               <div className="flex flex-wrap gap-2">
                 {user.skills?.map((s: string, i: number) => (
                   <span key={i} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 dark:text-white rounded-xl text-[9px] font-bold">{s}</span>
                 ))}
               </div>
             </div>
          </div>
          
          <div className="bg-slate-900 rounded-[40px] p-8 text-center text-white">
            <QrCode size={120} className="mx-auto mb-6 bg-white p-2 rounded-2xl text-black" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Code FSTI</p>
            <p className="text-2xl font-black italic">{user.access_key}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Petits composants pour le Coach
const StatBox = ({ icon, label, value }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[35px] border border-slate-100 dark:border-slate-800 shadow-lg flex items-center gap-6">
    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-black dark:text-white">{value}</p>
    </div>
  </div>
);

const TalentRow = ({ name, specialty, status }: any) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-xs">{name[0]}</div>
      <div>
        <h4 className="text-sm font-black dark:text-white">{name}</h4>
        <p className="text-[9px] font-bold text-slate-500 uppercase">{specialty}</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-[8px] font-black px-3 py-1 bg-white dark:bg-slate-900 rounded-full shadow-sm dark:text-slate-300 uppercase tracking-tighter">{status}</span>
      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
    </div>
  </div>
);