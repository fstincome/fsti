import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppView } from '../types.ts';
import { Moon, Sun, Languages, Lock, UserCheck, ShieldCheck } from 'lucide-react'; // Ajout de ShieldCheck
import { supabase } from '../src/supabaseClient';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onProfileClick: () => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  setView, 
  onProfileClick, 
  toggleDarkMode, 
  isDarkMode 
}) => {
  const { i18n } = useTranslation();
  const [session, setSession] = useState<any>(null);
  // Ajout d'un état pour l'utilisateur Elite (Talent/Coach)
  const [isEliteUser, setIsEliteUser] = useState(false);

  useEffect(() => {
    // 1. Check session Admin (Supabase Auth)
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // 2. Check session Elite (LocalStorage - Code FSTI)
    const checkEliteSession = () => {
      const storedUser = localStorage.getItem('fsti_user');
      setIsEliteUser(!!storedUser);
    };

    checkEliteSession();
    // Écoute les changements de stockage pour mettre à jour l'icône en temps réel
    window.addEventListener('storage', checkEliteSession);
    
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', checkEliteSession);
    };
  }, [currentView]); // Re-vérifie lors des changements de vue

  const navItems: { id: AppView; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'news', label: 'News', icon: '📰' },
    { id: 'register', label: 'Register', icon: '📝' },
    { id: 'marketplace', label: 'Market', icon: '🛒' },
    { id: 'utilities', label: 'Pay', icon: '⚡' },
    { id: 'mbanza', label: 'Mbanza', icon: '🤖' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentYear = new Date().getFullYear();

  // Détermine si quelqu'un est connecté (Admin ou Elite)
  const isAnySessionActive = session || isEliteUser;

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:top-0 lg:bottom-auto glass z-[100] border-t lg:border-t-0 lg:border-b border-slate-200 dark:border-slate-800 shadow-2xl transition-colors duration-300 dark:bg-slate-900/80">
      <div className="max-w-[1440px] mx-auto px-2 lg:px-10">
        <div className="flex justify-between items-center h-20 lg:h-24 gap-2">
          
          {/* Logo Section */}
          <div 
            className="hidden lg:flex items-center gap-4 cursor-pointer group shrink-0" 
            onClick={() => setView('home')}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-lg transition-transform group-hover:rotate-12 group-hover:scale-110 duration-300">
              F
            </div>
            <div className="flex flex-col">
               <span className="font-black text-xl tracking-tighter leading-none text-slate-900 dark:text-white uppercase">
                 From Skills <span className="text-blue-600">to Income</span>
               </span>
               <span className="text-[8px] font-black tracking-[0.3em] text-slate-400 dark:text-slate-500">
                 For every talent, Equal opportunity. • {currentYear}
               </span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-1 justify-start lg:justify-center items-center gap-1 overflow-x-auto no-scrollbar px-2 py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 rounded-2xl transition-all duration-300 shrink-0 ${
                  currentView === item.id 
                    ? 'text-blue-600 lg:bg-blue-50 dark:lg:bg-blue-900/20 scale-105' 
                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-xl lg:text-lg">{item.icon}</span>
                <span className="text-[8px] lg:text-[10px] font-black whitespace-nowrap uppercase tracking-tighter lg:tracking-widest">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Utility Controls */}
          <div className="flex items-center gap-2 lg:gap-4 ml-2 shrink-0">
            
            {/* Language Selector */}
            <div className="relative group hidden sm:block">
              <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all">
                <Languages size={20} />
              </button>
              <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[110]">
                {['fr', 'en', 'sw', 'rn'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => changeLanguage(lang)}
                    className="w-full text-left px-4 py-2 text-xs font-bold uppercase hover:bg-blue-50 dark:hover:bg-slate-700 first:rounded-t-2xl last:rounded-b-2xl dark:text-slate-200"
                  >
                    {lang === 'rn' ? 'Kirundi' : lang === 'sw' ? 'Swahili' : lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Mode */}
            <button 
              onClick={toggleDarkMode}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-yellow-500 hover:text-white transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Elite Portal / Login Toggle - CHANGEMENTS ICI */}
            <button 
               onClick={() => setView('admin')} // Pointe toujours vers la vue Admin qui affichera le LoginPortal
               className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex flex-col items-center justify-center transition-all border shrink-0 ${
                 currentView === 'admin' 
                 ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                 : 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent'
               }`}
            >
               {isAnySessionActive ? <UserCheck size={18} /> : <Lock size={18} />}
               <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">
                 {isAnySessionActive ? (session ? 'Admin' : 'Hub') : 'Elite'}
               </span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};