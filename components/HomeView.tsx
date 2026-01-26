import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppView } from '../types.ts';

interface HomeViewProps {
  setView: (view: AppView) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setView }) => {
  const { t } = useTranslation();

  return (
    <div className="animate-fadeIn space-y-24 pb-20 bg-white dark:bg-slate-950 transition-colors duration-500">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[700px] w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] overflow-hidden group">
        <img 
          src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-105" 
          alt="FSTI Gitega Hero"
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent">
          <div className="max-w-[1440px] mx-auto h-full flex flex-col justify-center px-8 lg:px-20 text-white space-y-8">
            
            <span className="bg-blue-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] w-fit shadow-2xl animate-pulse">
              Advaxe Initiative • Gitega 2026
            </span>

            <h1 className="text-7xl lg:text-[120px] font-black tracking-tighter leading-[0.8] italic uppercase">
              From Skills<br/>
              <span className="text-blue-400 drop-shadow-2xl">To Income.</span>
            </h1>

            <p className="text-xl lg:text-2xl max-w-2xl opacity-90 font-medium leading-relaxed italic border-l-4 border-blue-400 pl-6">
              {t('hero_subtitle')}
            </p>

            <div className="flex gap-6 pt-8">
              <button 
                onClick={() => setView('services')} 
                className="bg-white text-slate-900 px-14 py-6 rounded-full font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 shadow-2xl"
              >
                {t('view_talents')}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION IMPACT : 4 COLONNES */}
      <section className="relative w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800">
          
          {/* Jeunes Formés */}
          <div className="p-16 flex flex-col items-center text-center space-y-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
            <span className="text-4xl group-hover:scale-110 transition-transform">👥</span>
            <div>
              <h3 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white">50</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">{t('impact_trained')}</p>
            </div>
          </div>

          {/* Inclusion */}
          <div className="p-16 flex flex-col items-center text-center space-y-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
            <span className="text-4xl group-hover:scale-110 transition-transform">♿</span>
            <div>
              <h3 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white">20%</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">{t('impact_inclusion')}</p>
            </div>
          </div>

          {/* Micro-services */}
          <div className="p-16 flex flex-col items-center text-center space-y-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
            <span className="text-4xl group-hover:scale-110 transition-transform">🛠️</span>
            <div>
              <h3 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white">30</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">{t('impact_services')}</p>
            </div>
          </div>

          {/* Durée */}
          <div className="p-16 flex flex-col items-center text-center space-y-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
            <span className="text-4xl group-hover:scale-110 transition-transform">⏱️</span>
            <div>
              <h3 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white">10</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Weeks</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. LE PROBLÈME */}
      <section className="px-8 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1">
          <img 
            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000" 
            className="rounded-[40px] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500"
            alt="Chômage Gitega"
          />
        </div>
        <div className="space-y-8 order-1 lg:order-2">
          <span className="text-blue-600 font-black uppercase tracking-widest text-xs">Analysis</span>
          <h2 className="text-5xl lg:text-6xl font-black tracking-tighter dark:text-white">{t('problem_title')}</h2>
          <div className="space-y-4 text-xl text-slate-600 dark:text-slate-400 font-medium">
            <p className="border-l-4 border-red-500 pl-6">
              65% des jeunes à Gitega occupent des emplois précaires. FSTI apporte une solution concrète.
            </p>
          </div>
        </div>
      </section>

      {/* 3. INNOVATION */}
      <section className="bg-slate-900 rounded-[60px] p-12 lg:p-24 text-white relative overflow-hidden mx-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/30 blur-[120px] rounded-full"></div>
        <div className="relative z-10 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter italic">{t('innovation_title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all">
              <div className="text-4xl mb-4">🌍</div>
              <h4 className="text-2xl font-black mb-2">Scalable</h4>
              <p className="text-slate-400">Gitega First, Burundi Next.</p>
            </div>
            {/* ... autres blocs innovation ... */}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="text-center py-20 px-8">
        <h2 className="text-7xl lg:text-9xl font-black tracking-tighter italic mb-10 dark:text-white">
          {t('cta_title')}
        </h2>
        <button className="bg-slate-900 dark:bg-blue-600 text-white px-16 py-8 rounded-full font-black text-xl uppercase tracking-tighter hover:scale-105 transition-all shadow-2xl">
          {t('cta_button')}
        </button>
      </section>

    </div>
  );
};