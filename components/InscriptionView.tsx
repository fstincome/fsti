import React, { useState } from 'react';
import { supabase } from '../src/supabaseClient'; 

type Role = 'participant' | 'coach';

export const InscriptionView: React.FC = () => {
  const [activeRole, setActiveRole] = useState<Role>('participant');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- États pour les Fichiers ---
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  // État pour les Participants
  const [participantData, setParticipantData] = useState({
    full_name: '',
    whatsapp_number: '',
    birth_date: '',
    province: '',
    category: 'Informatique & Digital',
    education_level: '',
    bio: '',
    role_title: '',
    experience_summary: '',
    skills: '' // On gère les compétences comme du texte ici
  });

  // État pour les Coachs
  const [coachData, setCoachData] = useState({
    full_name: '',
    specialty: '',
    experience_years: 0,
    whatsapp_number: '',
    motivation: ''
  });

  // --- Fonction utilitaire pour l'Upload ---
  const uploadToSupabase = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('fsti_assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('fsti_assets').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeRole === 'participant') {
        let profile_url = '';
        let cv_url = '';

        // Upload des fichiers si présents
        if (profileImage) profile_url = await uploadToSupabase(profileImage, 'profiles');
        if (cvFile) cv_url = await uploadToSupabase(cvFile, 'cvs');

        // Conversion des compétences : "React, JS" -> ["React", "JS"]
        const skillsArray = participantData.skills
          .split(',')
          .map(s => s.trim())
          .filter(s => s !== "");

        const { error } = await supabase
          .from('talents')
          .insert([{
            ...participantData,
            skills: skillsArray, // Envoi du tableau à Supabase
            profile_image_url: profile_url,
            cv_url: cv_url,
            status: 'Disponible'
          }]);
        if (error) throw error;

      } else {
        const { error } = await supabase
          .from('coaches')
          .insert([coachData]);
        if (error) throw error;
      }
      setSubmitted(true);
    } catch (error: any) {
      alert("Erreur de soumission : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-white dark:bg-slate-900 rounded-[60px] shadow-2xl border border-blue-100 dark:border-slate-800 animate-fadeIn">
        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 text-white text-4xl shadow-lg shadow-emerald-500/20">✓</div>
        <h2 className="text-4xl font-black italic tracking-tighter dark:text-white uppercase mb-4">Dossier Reçu !</h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold italic px-10">
          Candidature et documents enregistrés avec succès dans le Hub FSTI.
        </p>
        <button onClick={() => window.location.reload()} className="mt-10 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all">Retour au Hub</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn pb-24 px-4">
      <div className="flex flex-col items-center mb-16 space-y-8">
        <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter dark:text-white uppercase leading-none">Rejoindre <span className="text-blue-600">L'Élite</span></h2>
            <p className="text-slate-500 font-bold italic mt-2">Choisissez votre statut pour commencer l'intégration.</p>
        </div>
        
        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-[30px] flex gap-2">
          <button onClick={() => setActiveRole('participant')} className={`px-6 md:px-10 py-4 rounded-[25px] font-black text-[10px] uppercase tracking-widest transition-all ${activeRole === 'participant' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Devenir Participant</button>
          <button onClick={() => setActiveRole('coach')} className={`px-6 md:px-10 py-4 rounded-[25px] font-black text-[10px] uppercase tracking-widest transition-all ${activeRole === 'coach' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Devenir Coach</button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[60px] p-8 md:p-16 shadow-2xl border border-slate-100 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-12">
          
          {activeRole === 'participant' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="md:col-span-2 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h3 className="text-2xl font-black italic dark:text-white uppercase text-blue-600">Dossier Identité Complète</h3>
              </div>

              <InputField label="Nom complet (selon CNI)" placeholder="Jean-Marie Nkurunziza" value={participantData.full_name} onChange={(v: string) => setParticipantData({...participantData, full_name: v})} />
              <InputField label="Numéro WhatsApp" placeholder="+257 60 00 00 00" type="tel" value={participantData.whatsapp_number} onChange={(v: string) => setParticipantData({...participantData, whatsapp_number: v})} />
              <InputField label="Date de Naissance" type="date" value={participantData.birth_date} onChange={(v: string) => setParticipantData({...participantData, birth_date: v})} />
              <InputField label="Province de Résidence" placeholder="Gitega, Burundi" value={participantData.province} onChange={(v: string) => setParticipantData({...participantData, province: v})} />
              
              <div className="md:col-span-2 border-b border-slate-100 dark:border-slate-800 pb-4 pt-8 mb-4">
                <h3 className="text-2xl font-black italic dark:text-white uppercase text-blue-600">Fichiers & Médias</h3>
              </div>

              {/* Upload Photo */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Photo de Profil (JPG/PNG)</label>
                <div className="relative group">
                  <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="p-6 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl group-hover:border-blue-600 transition-colors flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm text-2xl">📸</div>
                    <div>
                      <p className="text-[11px] font-bold dark:text-white uppercase">{profileImage ? profileImage.name : "Cliquez pour uploader"}</p>
                      <p className="text-[9px] text-slate-400 font-bold italic">Format carré recommandé</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload CV */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">CV ou Portfolio (PDF)</label>
                <div className="relative group">
                  <input type="file" accept=".pdf" onChange={(e) => setCvFile(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="p-6 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl group-hover:border-blue-600 transition-colors flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm text-2xl">📄</div>
                    <div>
                      <p className="text-[11px] font-bold dark:text-white uppercase">{cvFile ? cvFile.name : "Cliquez pour uploader"}</p>
                      <p className="text-[9px] text-slate-400 font-bold italic">Max 5 Mo</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 border-b border-slate-100 dark:border-slate-800 pb-4 pt-8 mb-4">
                <h3 className="text-2xl font-black italic dark:text-white uppercase text-blue-600">Expertise & Preuves</h3>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Catégorie de Talent</label>
                <select 
                  value={participantData.category}
                  onChange={(e) => setParticipantData({...participantData, category: e.target.value})}
                  className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 ring-blue-600 dark:text-white font-bold italic"
                >
                    <option>Informatique & Digital</option>
                    <option>Artisanat & Textile</option>
                    <option>Énergie & Solaire</option>
                    <option>Mécanique & Électronique</option>
                </select>
              </div>

              <InputField label="Titre exact de votre métier" placeholder="ex: Développeur React / Menuisier ébéniste" value={participantData.role_title} onChange={(v: string) => setParticipantData({...participantData, role_title: v})} />
              
              <InputField label="Résumé d'expérience" placeholder="Ex: 3 ans en agence, 2 projets freelance..." value={participantData.experience_summary} onChange={(v: string) => setParticipantData({...participantData, experience_summary: v})} />
              
              <InputField label="Compétences clés (séparées par des virgules)" placeholder="Ex: Soudure, React, Management, Anglais..." value={participantData.skills} onChange={(v: string) => setParticipantData({...participantData, skills: v})} />

              <InputField label="Dernier Diplôme / Certification" placeholder="Ex: Diplôme d'Ingénieur, Certificat..." value={participantData.education_level} onChange={(v: string) => setParticipantData({...participantData, education_level: v})} />
              
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Bio Professionnelle pour les Boss</label>
                <textarea 
                  value={participantData.bio}
                  onChange={(e) => setParticipantData({...participantData, bio: e.target.value})}
                  rows={4} 
                  placeholder="Décrivez vos accomplissements et ce que vous apportez..." 
                  className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[30px] outline-none focus:ring-2 ring-blue-600 dark:text-white font-bold italic"
                ></textarea>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-slideIn">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h3 className="text-2xl font-black italic dark:text-white uppercase text-blue-600">Accréditation Coach</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField label="Nom du Coach" placeholder="Expert Prénom" value={coachData.full_name} onChange={(v: string) => setCoachData({...coachData, full_name: v})} />
                <InputField label="Spécialité de Coaching" placeholder="Ex: Leadership..." value={coachData.specialty} onChange={(v: string) => setCoachData({...coachData, specialty: v})} />
                <InputField label="Années d'Expérience" type="number" value={coachData.experience_years} onChange={(v: any) => setCoachData({...coachData, experience_years: parseInt(v)})} />
                <InputField label="WhatsApp Professionnel" placeholder="+257 ...." value={coachData.whatsapp_number} onChange={(v: string) => setCoachData({...coachData, whatsapp_number: v})} />
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Pourquoi voulez-vous encadrer les jeunes du Hub ?</label>
                    <textarea value={coachData.motivation} onChange={(e) => setCoachData({...coachData, motivation: e.target.value})} rows={3} className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[30px] outline-none focus:ring-2 ring-blue-600 dark:text-white font-bold italic"></textarea>
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-6 rounded-[30px] font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-2xl active:scale-95 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-slate-900 shadow-blue-500/20'}`}
          >
            {loading ? 'Téléchargement des documents...' : 'Soumettre ma candidature officielle'}
          </button>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, placeholder, type = "text", value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">{label}</label>
    <input 
      required 
      type={type} 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} 
      className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border-2 border-transparent focus:border-blue-600 dark:text-white font-bold italic transition-all" 
    />
  </div>
);