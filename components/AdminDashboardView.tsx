import React, { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';
import { 
  Users, LogOut, CheckCircle, XCircle, TrendingUp, 
  BarChart3, PieChart as PieIcon, Activity, Filter, Eye, X, 
  Star, Briefcase, GraduationCap, Phone, FileText, MapPin
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export const AdminDashboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'participants' | 'coaches'>('stats');
  const [talents, setTalents] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [catFilter, setCatFilter] = useState('all');

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: talentData } = await supabase.from('talents').select('*').order('created_at', { ascending: false });
    const { data: coachData } = await supabase.from('coaches').select('*').order('created_at', { ascending: false });
    
    if (talentData) setTalents(talentData);
    if (coachData) setCoaches(coachData);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // --- LOGIQUE FILTRAGE ---
  const filteredParticipants = catFilter === 'all' ? talents : talents.filter(t => t.category === catFilter);

  // --- DATA POUR LES GRAPHIQUES ---
  const chartData = talents.reduce((acc: any[], curr) => {
    const date = new Date(curr.created_at).toLocaleDateString('fr-FR', { month: 'short' });
    const existing = acc.find(item => item.name === date);
    if (existing) existing.total += 1; else acc.push({ name: date, total: 1 });
    return acc;
  }, []);

  const categoryData = talents.reduce((acc: any[], curr) => {
    const cat = curr.category || 'Autre';
    const existing = acc.find(item => item.name === cat);
    if (existing) existing.value += 1; else acc.push({ name: cat, value: 1 });
    return acc;
  }, []);

  return (
    <div className="animate-fadeIn pb-32 max-w-7xl mx-auto px-4">
      
      {/* MODALE DE DÉTAILS (Adaptée au rôle) */}
      {selectedItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[40px] p-8 md:p-12 shadow-2xl animate-slideUp border border-slate-100 dark:border-slate-800 relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setSelectedItem(null)} className="absolute top-8 right-8 p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:rotate-90 transition-all">
              <X size={20} className="dark:text-white" />
            </button>

            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-10">
              <div className="w-32 h-32 rounded-[40px] bg-blue-600 overflow-hidden shadow-xl shrink-0 border-4 border-white dark:border-slate-800">
                <img src={selectedItem.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedItem.full_name}`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-black uppercase italic dark:text-white leading-tight">{selectedItem.full_name}</h2>
                <p className="text-blue-600 font-bold uppercase text-xs tracking-[0.3em] mt-2">{selectedItem.category || selectedItem.specialty}</p>
                <div className="flex gap-3 mt-4 justify-center md:justify-start">
                   <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase dark:text-slate-300 flex items-center gap-2">
                     <MapPin size={12}/> {selectedItem.province || 'Burundi'}
                   </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <DetailItem label="WhatsApp" value={selectedItem.whatsapp_number} icon={<Phone size={14}/>} />
              <DetailItem label="Niveau / XP" value={selectedItem.education_level || `${selectedItem.experience_years} Ans XP`} icon={<GraduationCap size={14}/>} />
              {selectedItem.cv_url && (
                <a href={selectedItem.cv_url} target="_blank" className="col-span-2 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800 flex justify-between items-center group transition-all">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest dark:text-white">Consulter le CV Officiel</span>
                  </div>
                  <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:scale-110 transition-transform">→</div>
                </a>
              )}
            </div>

            <div className="space-y-4">
               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Parcours & Motivation</h4>
               <p className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl text-sm font-medium italic leading-relaxed dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                 "{selectedItem.bio || selectedItem.motivation || "Aucune description fournie."}"
               </p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-6xl font-black italic tracking-tighter dark:text-white uppercase leading-none">
            Elite <span className="text-blue-600">Ops</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Monitoring Centralisé Hub FSTI</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-[20px] font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl">
          <LogOut size={16} /> Fermer Session
        </button>
      </header>

      {/* TABS NAVIGATION */}
      <div className="flex gap-3 mb-12 overflow-x-auto no-scrollbar pb-2">
        <TabBtn active={activeTab === 'stats'} label="Dashboard" icon={<BarChart3 size={16}/>} onClick={() => setActiveTab('stats')} />
        <TabBtn active={activeTab === 'participants'} label="Les 50 Jeunes" icon={<Users size={16}/>} onClick={() => setActiveTab('participants')} />
        <TabBtn active={activeTab === 'coaches'} label="Corps Enseignant" icon={<Star size={16}/>} onClick={() => setActiveTab('coaches')} />
      </div>

      {/* --- VUE STATS --- */}
      {activeTab === 'stats' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard label="Total Participants" value={talents.length} trend="Elite" icon={<Users className="text-blue-600"/>} />
            <StatCard label="Coaches Actifs" value={coaches.length} trend="Mentors" icon={<Star className="text-amber-500"/>} />
            <StatCard label="Taux d'intégration" value="100%" trend="Live" icon={<Activity className="text-emerald-500"/>} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[50px] border border-slate-100 dark:border-slate-800 shadow-2xl">
              <h3 className="text-xs font-black uppercase tracking-widest mb-8 flex items-center gap-2 dark:text-white">
                <TrendingUp size={16} className="text-blue-600"/> Flux des Inscriptions
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none'}} />
                    <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={5} fill="url(#colorBlue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-10 rounded-[50px] border border-slate-100 dark:border-slate-800 shadow-2xl text-center flex flex-col items-center justify-center">
               <PieIcon size={48} className="text-slate-200 mb-4" />
               <h3 className="text-xl font-black italic dark:text-white uppercase mb-2">Répartition Secteurs</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[200px]">Visualisation globale des talents par catégorie métier</p>
               <div className="h-[250px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {categoryData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- VUE PARTICIPANTS --- */}
      {activeTab === 'participants' && (
        <div className="space-y-6 animate-slideUp">
          <div className="flex bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 items-center gap-4">
            <Filter className="text-blue-600 ml-4" size={20} />
            <select onChange={(e) => setCatFilter(e.target.value)} className="bg-transparent text-[11px] font-black uppercase outline-none dark:text-white flex-1">
              <option value="all">Tous les secteurs</option>
              <option>Informatique & Digital</option>
              <option>Artisanat & Textile</option>
              <option>Énergie & Solaire</option>
              <option>Mécanique & Électronique</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredParticipants.map((t) => (
              <ProfileCard key={t.id} item={t} onDetail={() => setSelectedItem(t)} badge={t.role_title} />
            ))}
          </div>
        </div>
      )}

      {/* --- VUE COACHES --- */}
      {activeTab === 'coaches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideUp">
          {coaches.map((c) => (
            <ProfileCard key={c.id} item={c} onDetail={() => setSelectedItem(c)} badge={c.specialty} icon={<Star size={14}/>} />
          ))}
        </div>
      )}
    </div>
  );
};

// --- COMPOSANTS INTERNES ---

const ProfileCard = ({ item, onDetail, badge, icon }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-6 group hover:border-blue-500/50 transition-all">
    <div className="w-20 h-20 rounded-[28px] bg-slate-50 dark:bg-slate-800 overflow-hidden shrink-0 border-2 border-white dark:border-slate-700 shadow-lg">
      <img src={item.profile_image_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.full_name}`} alt="" className="w-full h-full object-cover" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-lg font-black italic uppercase dark:text-white truncate tracking-tighter">{item.full_name}</h4>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
          {icon || <Briefcase size={12}/>} {badge}
        </span>
      </div>
      <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-2">
        <Phone size={10}/> {item.whatsapp_number}
      </p>
    </div>
    <button onClick={onDetail} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">
      <Eye size={18} />
    </button>
  </div>
);

const TabBtn = ({ active, label, icon, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-8 py-5 rounded-[25px] font-black uppercase text-[10px] tracking-[0.2em] transition-all shrink-0 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
    {icon} {label}
  </button>
);

const StatCard = ({ label, value, trend, icon }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[45px] border border-slate-100 dark:border-slate-800 shadow-xl">
    <div className="flex justify-between items-center mb-6">
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl">{icon}</div>
      <span className="text-[10px] font-black bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 px-3 py-1 rounded-full italic">{trend}</span>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-5xl font-black italic tracking-tighter dark:text-white leading-none">{value}</h3>
  </div>
);

const DetailItem = ({ label, value, icon }: any) => (
  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">
      {icon} {label}
    </div>
    <div className="text-[11px] font-black uppercase dark:text-white italic truncate">{value || 'N/A'}</div>
  </div>
);