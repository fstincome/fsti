import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../src/supabaseClient';
import { 
  Users, LogOut, Activity, Eye, FileText, Send, PlusCircle, 
  Image as ImageIcon, Loader2, Trash2, EyeOff, Edit3, ArrowLeft, 
  Star, Search, Calendar, CheckCircle2, AlertCircle, X, Link as LinkIcon, 
  UserPlus, Briefcase, ClipboardList, Video, MapPin, Phone, Mail, Clock, Download
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

// --- TYPE POUR LES NOTIFICATIONS ---
type Toast = { id: string; message: string; type: 'success' | 'error' };

export const AdminDashboardView: React.FC = () => {
  const { t } = useTranslation();
  
  // État des onglets
  const [activeTab, setActiveTab] = useState<'stats' | 'participants' | 'coaches' | 'news' | 'assignments' | 'jobs' | 'appointments'>('stats');
  const [loading, setLoading] = useState(true);
  
  // Données
  const [talents, setTalents] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  // État pour la Modal de détails
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  
  // États pour les attributions
  const [selectedCoach, setSelectedCoach] = useState('');
  const [selectedTalent, setSelectedTalent] = useState('');
  const [assigning, setAssigning] = useState(false);

  // États Filtres & Recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');

  // États Journal
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<any>({ 
    title: '', 
    content: '', 
    category: 'Analyse', 
    is_published: true 
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);

  // Système de Toast
  const [toasts, setToasts] = useState<Toast[]>([]);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tData, cData, nData, aData, jData, appData, meetData] = await Promise.all([
        supabase.from('talents').select('*').order('created_at', { ascending: false }),
        supabase.from('coaches').select('*').order('created_at', { ascending: false }),
        supabase.from('news').select('*').order('created_at', { ascending: false }),
        supabase.from('coach_assignments').select(`id, coach_id, talent_id, coaches (full_name), talents (full_name, role_title)`),
        supabase.from('jobs').select('*').order('created_at', { ascending: false }),
        supabase.from('job_applications').select(`*, talents (*), jobs (*)`),
        supabase.from('appointments').select(`*, coaches(full_name), talents(full_name)` ).order('meeting_date', { ascending: true })
      ]);
      
      if (tData.data) setTalents(tData.data);
      if (cData.data) setCoaches(cData.data);
      if (nData.data) setArticles(nData.data);
      if (aData.data) setAssignments(aData.data);
      if (jData.data) setJobs(jData.data);
      if (appData.data) setApplications(appData.data);
      if (meetData.data) setAppointments(meetData.data);
    } catch (err) {
      showToast("Erreur de chargement", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- FONCTION EXPORT EXCEL (CSV) ---
  const exportToExcel = (data: any[], fileName: string) => {
    if (data.length === 0) {
      showToast("Aucune donnée à exporter", "error");
      return;
    }
    
    // Extraire les colonnes (ignore les objets complexes pour le CSV)
    const headers = Object.keys(data[0])
      .filter(key => typeof data[0][key] !== 'object')
      .join(';');

    const rows = data.map(obj => {
      return Object.keys(obj)
        .filter(key => typeof obj[key] !== 'object')
        .map(key => `"${String(obj[key] || '').replace(/"/g, '""')}"`)
        .join(';');
    });

    const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `elite_ops_${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateAppStatus = async (appId: string, status: 'accepted' | 'rejected' | 'pending') => {
    try {
      const { error } = await supabase.from('job_applications').update({ status }).eq('id', appId);
      if (error) throw error;
      showToast("Statut mis à jour", "success");
      fetchData();
    } catch (err) {
      showToast("Erreur lors de la mise à jour", "error");
    }
  };

  const assignedTalentIds = assignments.map(a => a.talent_id);
  const availableTalents = talents.filter(t => !assignedTalentIds.includes(t.id));

  const handleAssign = async () => {
    if (!selectedCoach || !selectedTalent) {
      return showToast(t('admin.assignments.selectError'), "error");
    }
    setAssigning(true);
    try {
      const { error } = await supabase
        .from('coach_assignments')
        .insert([{ coach_id: selectedCoach, talent_id: selectedTalent }]);
      
      if (error) throw error;
      showToast(t('admin.toasts.assignSuccess'), "success");
      fetchData();
      setSelectedTalent(''); 
    } catch (err: any) {
      showToast(err.code === '23505' ? t('admin.toasts.alreadyExists') : t('admin.toasts.assignError'), "error");
    } finally {
      setAssigning(false);
    }
  };

  const removeAssignment = async (id: string) => {
    if(!window.confirm(t('admin.assignments.confirmDelete'))) return;
    try {
      const { error } = await supabase.from('coach_assignments').delete().eq('id', id);
      if (error) throw error;
      showToast(t('admin.toasts.deleteSuccess'), "success");
      fetchData();
    } catch (err) {
      showToast(t('admin.toasts.deleteError'), "error");
    }
  };

  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          art.content.toLowerCase().includes(searchTerm.toLowerCase());
    const artDate = new Date(art.created_at);
    const matchesMonth = monthFilter === 'all' || artDate.getMonth().toString() === monthFilter;
    return matchesSearch && matchesMonth;
  });

  const newsCategoryData = ['Analyse', 'Solution', 'Inclusion', 'Vision'].map(cat => ({
    name: t(`admin.categories.${cat.toLowerCase()}`),
    value: articles.filter(a => a.category === cat).length
  }));

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    try {
      let finalImageUrl = currentArticle.image_url || '';
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('news-images')
          .upload(`news/${fileName}`, imageFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('news-images').getPublicUrl(`news/${fileName}`);
        finalImageUrl = data.publicUrl;
      }

      const payload = {
        title: currentArticle.title,
        content: currentArticle.content,
        category: currentArticle.category,
        image_url: finalImageUrl,
        is_published: currentArticle.is_published ?? true,
        author: currentArticle.author || t('admin.news.defaultAuthor')
      };

      let error;
      if (currentArticle.id) {
        const { error: updateError } = await supabase.from('news').update(payload).eq('id', currentArticle.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('news').insert([payload]);
        error = insertError;
      }

      if (error) throw error;
      showToast(currentArticle.id ? t('admin.toasts.updateSuccess') : t('admin.toasts.publishSuccess'), "success");
      setIsEditing(false);
      setImageFile(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || t('admin.toasts.publishError'), "error");
    } finally {
      setPublishing(false);
    }
  };

  const handleToggleStatus = async (id: string, status: boolean) => {
    try {
      const { error } = await supabase.from('news').update({ is_published: !status }).eq('id', id);
      if (error) throw error;
      showToast(t('admin.toasts.statusUpdated'), "success");
      fetchData();
    } catch (err) {
      showToast(t('admin.toasts.error'), "error");
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if(window.confirm(t('admin.news.confirmDelete'))) {
      try {
        const { error } = await supabase.from('news').delete().eq('id', id);
        if (error) throw error;
        showToast(t('admin.toasts.deleteSuccess'), "success");
        fetchData();
      } catch (err) {
        showToast(t('admin.toasts.deleteError'), "error");
      }
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="animate-fadeIn pb-32 max-w-7xl mx-auto px-4 relative">
      
      {/* --- NOTIFICATIONS --- */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
        {toasts.map(toast => (
          <div key={toast.id} className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-slideRight border ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
            <span className="text-[11px] font-black uppercase tracking-wider">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* --- MODAL DE DÉTAILS --- */}
      {selectedEntity && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="relative h-32 bg-blue-600">
              <button onClick={() => setSelectedEntity(null)} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all"><X size={20}/></button>
            </div>
            <div className="px-10 pb-10 -mt-16">
              <div className="flex items-end gap-6 mb-8">
                <img src={selectedEntity.profile_image_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedEntity.full_name}`} className="w-32 h-32 rounded-[30px] border-8 border-white dark:border-slate-900 bg-slate-100 object-cover" />
                <div className="pb-2">
                  <h2 className="text-3xl font-black italic uppercase dark:text-white leading-none">{selectedEntity.full_name}</h2>
                  <p className="text-blue-600 font-bold uppercase text-[12px] tracking-widest mt-2">{selectedEntity.role_title || selectedEntity.specialty || 'Membre'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3"><Mail size={16} className="text-blue-600"/> <span className="text-sm font-bold dark:text-white">{selectedEntity.email || 'N/A'}</span></div>
                <div className="flex items-center gap-3"><Phone size={16} className="text-blue-600"/> <span className="text-sm font-bold dark:text-white">{selectedEntity.whatsapp_number || 'N/A'}</span></div>
                <div className="flex items-center gap-3"><MapPin size={16} className="text-blue-600"/> <span className="text-sm font-bold dark:text-white">{selectedEntity.province || 'Non spécifiée'}</span></div>
                <div className="flex items-center gap-3"><Calendar size={16} className="text-blue-600"/> <span className="text-sm font-bold dark:text-white">Inscrit le {new Date(selectedEntity.created_at).toLocaleDateString()}</span></div>
              </div>
              <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl text-sm dark:text-slate-300 italic font-medium leading-relaxed">
                "{selectedEntity.bio || selectedEntity.motivation || 'Aucun détail supplémentaire.'}"
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 py-8">
        <div>
          <h1 className="text-6xl font-black italic tracking-tighter dark:text-white uppercase">Elite <span className="text-blue-600">Ops</span></h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 tracking-widest">{t('admin.header.subtitle')}</p>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="bg-slate-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-[20px] font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-xl">
          <LogOut size={16} className="inline mr-2" /> {t('admin.header.logout')}
        </button>
      </header>

      <div className="flex gap-3 mb-12 overflow-x-auto no-scrollbar pb-2">
        <TabBtn active={activeTab === 'stats'} label={t('admin.tabs.stats')} icon={<Activity size={16}/>} onClick={() => setActiveTab('stats')} />
        <TabBtn active={activeTab === 'jobs'} label="Jobs & Tracking" icon={<Briefcase size={16}/>} onClick={() => setActiveTab('jobs')} />
        <TabBtn active={activeTab === 'appointments'} label="Rendez-vous" icon={<Calendar size={16}/>} onClick={() => setActiveTab('appointments')} />
        <TabBtn active={activeTab === 'participants'} label={t('admin.tabs.talents')} icon={<Users size={16}/>} onClick={() => setActiveTab('participants')} />
        <TabBtn active={activeTab === 'coaches'} label={t('admin.tabs.coaches')} icon={<Star size={16}/>} onClick={() => setActiveTab('coaches')} />
        <TabBtn active={activeTab === 'assignments'} label={t('admin.tabs.assignments')} icon={<LinkIcon size={16}/>} onClick={() => setActiveTab('assignments')} />
        <TabBtn active={activeTab === 'news'} label={t('admin.tabs.journal')} icon={<FileText size={16}/>} onClick={() => setActiveTab('news')} />
      </div>

      {/* --- BARRE D'ACTION EXPORT --- */}
      {['participants', 'coaches', 'appointments'].includes(activeTab) && (
        <div className="flex justify-end mb-6 animate-fadeIn">
          <button 
            onClick={() => {
              const dataToExport = activeTab === 'participants' ? talents : 
                                   activeTab === 'coaches' ? coaches : appointments;
              exportToExcel(dataToExport, activeTab);
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg"
          >
            <Download size={16} /> 
            Exporter la liste {activeTab}
          </button>
        </div>
      )}

      {/* --- SECTION STATS --- */}
      {/* {activeTab === 'stats' && (
        <div className="space-y-10 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard label={t('admin.stats.totalTalents')} value={talents.length} trend={t('admin.stats.talentTrend')} icon={<Users className="text-blue-600"/>} />
            <StatCard label={t('admin.stats.expertCoaches')} value={coaches.length} trend={t('admin.stats.coachTrend')} icon={<Star className="text-amber-500"/>} />
            <StatCard label="Rdv Prévus" value={appointments.length} trend="UP" icon={<Calendar className="text-emerald-500"/>} />
          </div>
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[50px] border border-slate-100 dark:border-slate-800 shadow-2xl">
            <h4 className="text-sm font-black uppercase tracking-widest mb-8 dark:text-white">{t('admin.charts.distribution')}</h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={newsCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" />
                  <YAxis hide />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {newsCategoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )} */}
      {/* --- SECTION STATISTIQUES ENRICHIE --- */}
      {activeTab === 'stats' && (
        <div className="space-y-10 animate-fadeIn">
          {/* Cartes de score rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard label={t('admin.stats.totalTalents')} value={talents.length} trend="+12%" icon={<Users className="text-blue-600"/>} />
            <StatCard label={t('admin.stats.expertCoaches')} value={coaches.length} trend="Stable" icon={<Star className="text-amber-500"/>} />
            <StatCard label="Rdv Prévus" value={appointments.length} trend="High" icon={<Calendar className="text-emerald-500"/>} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 1. Pie Chart: Répartition Talents vs Coachs */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[50px] border border-slate-100 dark:border-slate-800 shadow-2xl">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-8 dark:text-white">Répartition de la Communauté</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={[
                        { name: 'Talents', value: talents.length },
                        { name: 'Coachs', value: coaches.length }
                      ]} 
                      cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                    >
                      <Cell fill="#2563eb" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Bar Chart: Activité Jobs vs Candidatures */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[50px] border border-slate-100 dark:border-slate-800 shadow-2xl">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-8 dark:text-white">Activité des Jobs</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Total Jobs', count: jobs.length },
                    { name: 'Candidatures', count: applications.length }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={10} fontWeight="bold" />
                    <YAxis hide />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Horizontal Bar Chart: Top Talents Acceptés */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[50px] border border-slate-100 dark:border-slate-800 shadow-2xl">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-8 dark:text-white">Top Talents (Candidatures Acceptées)</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    layout="vertical"
                    data={talents
                      .map(t => ({
                        name: t.full_name,
                        accepted: applications.filter(app => app.talent_id === t.id && app.status === 'accepted').length
                      }))
                      .filter(t => t.accepted > 0)
                      .sort((a, b) => b.accepted - a.accepted)
                      .slice(0, 5)
                    }
                  >
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} fontSize={9} fontWeight="bold" />
                    <Tooltip />
                    <Bar dataKey="accepted" fill="#10b981" radius={[0, 10, 10, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Bar Chart: Distribution News par catégorie */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[50px] border border-slate-100 dark:border-slate-800 shadow-2xl">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-8 dark:text-white">Articles par Catégorie</h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={['Analyse', 'Solution', 'Inclusion', 'Vision'].map(cat => ({
                    name: cat,
                    value: articles.filter(a => a.category === cat).length
                  }))}>
                    <XAxis dataKey="name" fontSize={10} fontWeight="bold" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#f59e0b" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- SECTION JOBS & TRACKING --- */}
      {activeTab === 'jobs' && (
        <div className="space-y-10 animate-fadeIn">
          {jobs.map((job) => {
            const jobApps = applications.filter(app => app.job_id === job.id);
            const acceptedTalents = jobApps.filter(app => app.status === 'accepted');

            return (
              <div key={job.id} className="bg-white dark:bg-slate-900 rounded-[45px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
                <div className="p-8 md:p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50 dark:bg-slate-800/30">
                  <div>
                    <span className="text-[9px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase mb-3 inline-block tracking-tighter">Job Post</span>
                    <h3 className="text-2xl font-black italic uppercase dark:text-white leading-none">{job.title}</h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase">{job.company} • {job.location}</p>
                  </div>
                  <div className="flex gap-8">
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Candidatures</p>
                      <p className="text-2xl font-black dark:text-white">{jobApps.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Acceptés</p>
                      <p className="text-2xl font-black text-emerald-500">{acceptedTalents.length}</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-10">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-[0.3em] flex items-center gap-2">
                    <ClipboardList size={14}/> Tracking des Talents
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobApps.map((app) => (
                      <div key={app.id} className={`p-6 rounded-[35px] border transition-all flex flex-col justify-between h-full ${app.status === 'accepted' ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl'}`}>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                            <img src={app.talents?.profile_image_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${app.talents?.full_name}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-[12px] font-black italic uppercase dark:text-white truncate">{app.talents?.full_name}</h5>
                            <button onClick={() => setSelectedEntity(app.talents)} className="text-[9px] font-black text-blue-600 uppercase hover:underline">Voir profil</button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-slate-50 dark:border-slate-800 pt-5">
                          <span className={`text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                            app.status === 'accepted' ? 'bg-emerald-500 text-white' : 
                            app.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {app.status}
                          </span>

                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateAppStatus(app.id, 'accepted')} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 transition-all"><CheckCircle2 size={16} /></button>
                            <button onClick={() => handleUpdateAppStatus(app.id, 'rejected')} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 transition-all"><X size={16} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- SECTION RENDEZ-VOUS --- */}
      {activeTab === 'appointments' && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[50px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-50 dark:border-slate-800">
                <th className="pb-4 pl-4">Date & Heure</th>
                <th className="pb-4">Duo Talent / Coach</th>
                <th className="pb-4">Sujet</th>
                <th className="pb-4">Statut</th>
                <th className="pb-4 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 transition-all">
                  <td className="py-6 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Clock size={16}/></div>
                      <div>
                        <p className="text-sm font-black dark:text-white">{new Date(apt.meeting_date).toLocaleDateString()}</p>
                        <p className="text-[10px] font-bold text-slate-400">{new Date(apt.meeting_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6">
                    <p className="text-[11px] font-black dark:text-white uppercase italic">T: {apt.talents?.full_name}</p>
                    <p className="text-[11px] font-bold text-blue-600 uppercase italic">C: {apt.coaches?.full_name}</p>
                  </td>
                  <td className="py-6">
                    <p className="text-[12px] font-black dark:text-white uppercase truncate max-w-[150px]">{apt.title}</p>
                  </td>
                  <td className="py-6">
                    <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase ${apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{apt.status}</span>
                  </td>
                  <td className="py-6 text-right pr-4">
                    {apt.meeting_link && (
                      <a href={apt.meeting_link} target="_blank" className="p-3 bg-blue-600 text-white rounded-xl inline-block hover:scale-105 transition-all shadow-lg shadow-blue-500/30">
                        <Video size={14}/>
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- SECTION ATTRIBUTIONS --- */}
      {activeTab === 'assignments' && (
        <div className="space-y-10 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[50px] border border-slate-100 dark:border-slate-800 shadow-2xl">
            <h3 className="text-2xl font-black italic uppercase dark:text-white mb-8">{t('admin.assignments.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">{t('admin.assignments.labelCoach')}</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl font-bold dark:text-white outline-none border border-transparent focus:border-blue-600 transition-all appearance-none" value={selectedCoach} onChange={e => setSelectedCoach(e.target.value)}>
                  <option value="">{t('admin.assignments.placeholderCoach')}</option>
                  {coaches.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">{t('admin.assignments.labelTalent')}</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl font-bold dark:text-white outline-none border border-transparent focus:border-blue-600 transition-all appearance-none" value={selectedTalent} onChange={e => setSelectedTalent(e.target.value)}>
                  <option value="">{t('admin.assignments.placeholderTalent')}</option>
                  {availableTalents.map(t => <option key={t.id} value={t.id}>{t.full_name} ({t.role_title})</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <button disabled={assigning} onClick={handleAssign} className="w-full bg-blue-600 text-white h-[60px] rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50">
                  {assigning ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />} 
                  {t('admin.assignments.btnAssign')}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((as: any) => (
              <div key={as.id} className="bg-white dark:bg-slate-900 p-6 rounded-[35px] border border-slate-100 dark:border-slate-800 shadow-xl relative group overflow-hidden border-l-4 border-l-blue-600">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl"><Star size={20}/></div>
                  <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase text-slate-400">{t('admin.assignments.coachRole')}</p>
                    <h4 className="font-black italic dark:text-white truncate uppercase">{as.coaches?.full_name}</h4>
                  </div>
                </div>
                <div className="h-px bg-slate-50 dark:bg-slate-800 w-full mb-4" />
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl"><Users size={20}/></div>
                  <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase text-slate-400">{t('admin.assignments.talentRole')}</p>
                    <h4 className="font-black italic dark:text-white truncate uppercase">{as.talents?.full_name}</h4>
                  </div>
                </div>
                <button onClick={() => removeAssignment(as.id)} className="absolute top-4 right-4 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SECTION JOURNAL --- */}
      {activeTab === 'news' && (
        <div className="space-y-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <h3 className="text-3xl font-black italic uppercase dark:text-white">{t('admin.news.title')}</h3>
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input placeholder={t('admin.news.searchPlaceholder')} className="w-full bg-white dark:bg-slate-900 p-4 pl-12 rounded-2xl text-[11px] font-bold dark:text-white outline-none border border-slate-100 dark:border-slate-800" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <button onClick={() => { setCurrentArticle({ title: '', content: '', category: 'Analyse', is_published: true }); setImageFile(null); setIsEditing(true); }} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest flex items-center gap-3 shadow-xl">
                <PlusCircle size={18}/> {t('admin.news.newBtn')}
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[50px] border border-slate-100 dark:border-slate-800 shadow-2xl animate-slideUp">
               <button onClick={() => setIsEditing(false)} className="mb-8 text-slate-400 font-black text-[10px] tracking-widest flex items-center gap-2 uppercase"><ArrowLeft size={16}/> {t('admin.news.back')}</button>
               <form onSubmit={handleSaveArticle} className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="space-y-4">
                      <div className="h-64 relative rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center group">
                        {(imageFile || currentArticle.image_url) ? (
                          <>
                            <img src={imageFile ? URL.createObjectURL(imageFile) : currentArticle.image_url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ImageIcon className="text-white" size={32} />
                            </div>
                          </>
                        ) : <ImageIcon className="text-slate-300" size={48} />}
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                      </div>
                      <select className="w-full bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl font-bold dark:text-white outline-none" value={currentArticle.category} onChange={e => setCurrentArticle({...currentArticle, category: e.target.value})}>
                        <option value="Analyse">{t('admin.categories.analyse')}</option>
                        <option value="Solution">{t('admin.categories.solution')}</option>
                        <option value="Inclusion">{t('admin.categories.inclusion')}</option>
                        <option value="Vision">{t('admin.categories.vision')}</option>
                      </select>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                      <input required placeholder={t('admin.news.fields.title')} className="w-full bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl text-2xl font-black italic dark:text-white outline-none border-2 border-transparent focus:border-blue-600 transition-all" value={currentArticle.title} onChange={e => setCurrentArticle({...currentArticle, title: e.target.value})} />
                      <textarea required rows={10} placeholder={t('admin.news.fields.content')} className="w-full bg-slate-50 dark:bg-slate-800 p-8 rounded-[30px] text-md font-medium dark:text-white outline-none border-2 border-transparent focus:border-blue-600 transition-all" value={currentArticle.content} onChange={e => setCurrentArticle({...currentArticle, content: e.target.value})} />
                      <button type="submit" disabled={publishing} className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all disabled:opacity-50">
                        {publishing ? <Loader2 className="animate-spin" /> : <Send />} {t('admin.news.saveBtn')}
                      </button>
                    </div>
                  </div>
               </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredArticles.map(art => (
                <div key={art.id} className="bg-white dark:bg-slate-900 p-6 rounded-[35px] border border-slate-100 dark:border-slate-800 flex items-center gap-6 group hover:border-blue-600 transition-all">
                  <img src={art.image_url || 'https://via.placeholder.com/150'} className="w-20 h-20 rounded-2xl object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[8px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase">{art.category}</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{t('admin.news.by')} {art.author}</span>
                    </div>
                    <h4 className="text-md font-black italic dark:text-white truncate">{art.title}</h4>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setIsEditing(true); setCurrentArticle(art); }} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={16}/></button>
                    <button onClick={() => handleToggleStatus(art.id, art.is_published)} className={`p-3 rounded-xl transition-all ${art.is_published ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{art.is_published ? <Eye size={16}/> : <EyeOff size={16}/>}</button>
                    <button onClick={() => handleDeleteArticle(art.id)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-red-600 hover:text-white text-red-500"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'participants' && <ListView items={talents} t={t} onDetail={setSelectedEntity} />}
      {activeTab === 'coaches' && <ListView items={coaches} isCoach t={t} onDetail={setSelectedEntity} />}
    </div>
  );
};

// --- SOUS-COMPOSANTS ---
const TabBtn = ({ active, label, icon, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-8 py-5 rounded-[25px] font-black uppercase text-[10px] tracking-[0.2em] transition-all shrink-0 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{icon} {label}</button>
);

const StatCard = ({ label, value, trend, icon }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl">
    <div className="flex justify-between items-center mb-4">{icon}<span className="text-[9px] font-black text-emerald-600 italic tracking-tighter">{trend}</span></div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <h3 className="text-4xl font-black italic dark:text-white">{value}</h3>
  </div>
);

const ListView = ({ items, isCoach, t, onDetail }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
    {items.map((item: any) => (
      <div key={item.id} className="bg-white dark:bg-slate-900 p-6 rounded-[35px] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-4 group hover:border-blue-600 transition-all">
        <div className="w-14 h-14 rounded-[20px] bg-slate-100 overflow-hidden shrink-0">
          <img src={item.profile_image_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.full_name}`} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-[12px] font-black italic uppercase dark:text-white truncate">{item.full_name}</h4>
          <p className="text-[9px] font-bold text-blue-600 uppercase mb-2">{isCoach ? (item.specialty || 'Expert') : (item.role_title || 'Talent')}</p>
          <button onClick={() => onDetail(item)} className="text-[8px] font-black bg-slate-900 dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-full uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md">
            Voir Détails
          </button>
        </div>
      </div>
    ))}
    {items.length === 0 && <p className="col-span-full text-center py-20 text-slate-400 font-black uppercase text-[10px]">{t('admin.list.empty')}</p>}
  </div>
);