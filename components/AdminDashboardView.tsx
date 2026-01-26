import React, { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';

export const AdminDashboardView: React.FC = () => {
  const [stats, setStats] = useState({ talents: 0, coaches: 0, categories: {} as any });
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Récupérer les Talents
    const { data: talentsData } = await supabase.from('talents').select('*');
    // 2. Récupérer les Coachs
    const { data: coachesData } = await supabase.from('coaches').select('*');

    if (talentsData && coachesData) {
      setTalents(talentsData);
      
      // Calcul des stats par catégorie
      const catCount = talentsData.reduce((acc: any, t: any) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {});

      setStats({
        talents: talentsData.length,
        coaches: coachesData.length,
        categories: catCount
      });
    }
    setLoading(false);
  };

  const toggleCertification = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('talents')
      .update({ is_certified: !currentStatus })
      .eq('id', id);
    
    if (!error) fetchData(); // Rafraîchir
  };

  const deleteTalent = async (id: string) => {
    if (window.confirm("Supprimer définitivement ce profil ?")) {
      const { error } = await supabase.from('talents').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  if (loading) return <div className="p-20 text-center font-black italic opacity-50">ACCÈS AU TERMINAL ADMIN...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-fadeIn">
      
      {/* --- HEADER --- */}
      <header>
        <h2 className="text-6xl font-black italic tracking-tighter uppercase dark:text-white">Admin <span className="text-blue-600">Control</span></h2>
        <p className="text-slate-500 font-bold italic uppercase text-[10px] tracking-[0.3em]">Gestion des flux et des certifications</p>
      </header>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Talents" value={stats.talents} color="text-blue-600" />
        <StatCard label="Coachs Experts" value={stats.coaches} color="text-emerald-500" />
        <StatCard label="Catégories Actives" value={Object.keys(stats.categories).length} color="text-purple-500" />
      </div>

      {/* --- GESTION DES TALENTS --- */}
      <div className="bg-white dark:bg-[#111] rounded-[40px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-black uppercase italic tracking-widest text-sm dark:text-white">Base de données Talents</h3>
            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full dark:text-slate-400 italic">Mise à jour en temps réel</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Nom & Métier</th>
                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Catégorie</th>
                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {talents.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="p-6">
                    <p className="font-black italic dark:text-white uppercase text-sm">{t.full_name}</p>
                    <p className="text-[10px] text-blue-600 font-bold uppercase">{t.role_title}</p>
                  </td>
                  <td className="p-6">
                    <span className="text-[10px] font-bold dark:text-slate-400 italic">{t.category}</span>
                  </td>
                  <td className="p-6">
                    <button 
                        onClick={() => toggleCertification(t.id, t.is_certified)}
                        className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${t.is_certified ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
                    >
                      {t.is_certified ? '✓ Certifié' : 'En attente'}
                    </button>
                  </td>
                  <td className="p-6 flex gap-3">
                    <button onClick={() => deleteTalent(t.id)} className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all text-sm">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }: any) => (
  <div className="bg-white dark:bg-[#111] p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl">
    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">{label}</p>
    <p className={`text-5xl font-black italic tracking-tighter ${color}`}>{value}</p>
  </div>
);