import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../src/supabaseClient';
import { NEW_PROVINCES } from '../constants';
import { Loader2, Calendar, User, ArrowLeft, Share2, MessageCircle } from 'lucide-react';

interface BlogPost {
  id: string;
  category: string;
  author: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string; // Changé de 'image' à 'image_url' pour matcher Supabase
  province_tag: string;
  created_at: string;
}

export const NewsView: React.FC = () => {
  const { t } = useTranslation();
  const [news, setNews] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Form State
  const [commentForm, setCommentForm] = useState({ name: '', email: '', message: '' });

  // Fetch News from Supabase
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNews(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    const updateScroll = () => {
      const currentScroll = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight) setScrollProgress((currentScroll / scrollHeight) * 100);
    };
    window.addEventListener('scroll', updateScroll);
    return () => window.removeEventListener('scroll', updateScroll);
  }, [selectedArticle]);

  const shareArticle = (platform: string) => {
    if (!selectedArticle) return;
    const url = window.location.href;
    const text = `Découvrez cet article sur FSTI Hub : ${selectedArticle.title}`;
    
    const links: any = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`
    };

    if (platform === 'link') {
      navigator.clipboard.writeText(url);
      alert(t('link_copied', 'Lien copié !'));
    } else {
      window.open(links[platform], '_blank');
    }
  };

  const filteredNews = news.filter(post => 
    selectedProvince === 'all' || post.province_tag === selectedProvince
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chargement du journal...</p>
      </div>
    );
  }

  if (selectedArticle) {
    return (
      <div className="animate-fadeIn max-w-4xl mx-auto pb-24 relative px-4">
        <div className="fixed top-0 left-0 w-full h-1.5 z-[100] bg-slate-100 dark:bg-slate-800">
          <div className="h-full bg-blue-600 transition-all duration-150" style={{ width: `${scrollProgress}%` }}></div>
        </div>

        <button 
          onClick={() => { setSelectedArticle(null); window.scrollTo(0,0); }}
          className="mb-8 flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] tracking-widest hover:-translate-x-2 transition-transform"
        >
          <ArrowLeft size={14} /> {t('news_back_list')}
        </button>
        
        <img src={selectedArticle.image_url} className="w-full h-[300px] md:h-[500px] object-cover rounded-[40px] md:rounded-[60px] mb-12 shadow-2xl" alt="" />
        
        <div className="space-y-8">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedArticle.category}</span>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold italic flex items-center gap-2">
              <Calendar size={14} /> {new Date(selectedArticle.created_at).toLocaleDateString()} • <User size={14} /> {selectedArticle.author || 'Admin'}
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] italic tracking-tighter">
            {selectedArticle.title}
          </h2>

          <div className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed font-medium space-y-6 whitespace-pre-line border-l-4 border-blue-600/20 pl-6 md:pl-10">
            {selectedArticle.content}
          </div>

          <div className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800 space-y-12">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Share2 size={14} /> {t('news_share')}
              </span>
              <button onClick={() => shareArticle('facebook')} className="bg-[#1877F2] text-white px-6 py-2 rounded-full text-[10px] font-black hover:opacity-80 transition-all">Facebook</button>
              <button onClick={() => shareArticle('whatsapp')} className="bg-[#25D366] text-white px-6 py-2 rounded-full text-[10px] font-black hover:opacity-80 transition-all">WhatsApp</button>
              <button onClick={() => shareArticle('link')} className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-white px-6 py-2 rounded-full text-[10px] font-black hover:opacity-80 transition-all">Lien</button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-10 rounded-[40px] border-2 border-slate-200 dark:border-slate-800">
              <h4 className="text-2xl font-black italic mb-6 dark:text-white tracking-tighter flex items-center gap-3">
                <MessageCircle className="text-blue-600" /> {t('news_comment_space')}
              </h4>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder={t('news_form_name')} className="w-full bg-white dark:bg-slate-800 border-none p-5 rounded-2xl outline-none focus:ring-2 ring-blue-600 dark:text-white shadow-sm" />
                  <input type="email" placeholder={t('news_form_email')} className="w-full bg-white dark:bg-slate-800 border-none p-5 rounded-2xl outline-none focus:ring-2 ring-blue-600 dark:text-white shadow-sm" />
                </div>
                <textarea placeholder={t('news_form_msg')} rows={4} className="w-full bg-white dark:bg-slate-800 border-none p-6 rounded-[30px] outline-none focus:ring-2 ring-blue-600 dark:text-white shadow-sm"></textarea>
                <button className="bg-blue-600 text-white px-12 py-5 rounded-[25px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all">
                  {t('news_form_btn')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-12 pb-20 px-4">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-12">
        <div>
          <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none uppercase">
            Journal <span className="text-blue-600">Hub</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-4 italic max-w-lg">{t('news_journal_subtitle')}</p>
        </div>
        
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t('news_filter_label')}</label>
          <select 
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 px-8 py-4 rounded-[25px] font-black text-xs uppercase dark:text-white outline-none focus:border-blue-600 shadow-xl"
          >
            <option value="all">{t('news_all_country')}</option>
            {NEW_PROVINCES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </header>

      {filteredNews.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[50px] border-2 border-dashed border-slate-200 dark:border-slate-800">
           <p className="font-black italic text-slate-400 uppercase tracking-widest">Aucun article disponible pour cette région</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {filteredNews.map(post => (
            <article key={post.id} className="group bg-white dark:bg-slate-900 rounded-[50px] md:rounded-[60px] overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all flex flex-col cursor-pointer" onClick={() => { setSelectedArticle(post); window.scrollTo(0,0); }}>
              <div className="h-64 md:h-72 relative overflow-hidden">
                <img src={post.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={post.title} />
                <div className="absolute top-8 left-8 bg-blue-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl">
                  {post.category}
                </div>
              </div>

              <div className="p-8 md:p-12 flex flex-col flex-1 space-y-4">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span>{post.author || 'FSTI'}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight italic tracking-tighter group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 font-medium italic leading-relaxed">
                  {post.content.substring(0, 160)}...
                </p>
                <div className="pt-4 flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-3 transition-transform">
                  {t('news_read_more')} <span className="text-lg">→</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};