
import React, { useState, useRef, useEffect } from 'react';
import { getMbanzaResponse } from '../services/geminiService.ts';

export const MbanzaChat: React.FC = () => {
  const [messages, setMessages] = useState([
    { role: 'model', text: "Amahoro! I am Mbanza. Your national intelligence core is ready for synchronization. How can I assist with your journey today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const responseText = await getMbanzaResponse(userText, {
        view: 'mbanza-ai',
        history: messages,
        advanced: advancedMode
      });
      setMessages(prev => [...prev, { role: 'model', text: responseText || 'Connection flickering. Amahoro.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "National node failure. Please retry in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[750px] flex flex-col bg-white rounded-[60px] shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn">
      <div className="bg-slate-900 p-8 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg ring-4 ring-emerald-900/50">🤖</div>
          <div>
            <h2 className="text-white font-black text-2xl italic tracking-tighter leading-none">Mbanza Core</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.2em]">Active Link</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setAdvancedMode(!advancedMode)}
          className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border-2 ${
            advancedMode ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg' : 'bg-slate-800 text-slate-500 border-slate-700'
          }`}
        >
          {advancedMode ? '🧠 Deep Reason' : '⚡ Speed Mode'}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/20 no-scrollbar scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-8 py-6 rounded-[35px] text-[15px] font-medium leading-relaxed shadow-sm ${
              m.role === 'user' ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none italic'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-emerald-50 text-emerald-600 px-8 py-5 rounded-[30px] text-[10px] font-black uppercase tracking-widest animate-pulse border border-emerald-100 flex items-center gap-3">
              <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
              {advancedMode ? 'Mbanza is thinking...' : 'Syncing...'}
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-white border-t border-slate-50">
        <div className="flex gap-4">
          <input 
            type="text" value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Query the Hub intelligence..."
            className="flex-1 p-6 bg-slate-50 rounded-[30px] font-bold text-slate-900 outline-none border-2 border-transparent focus:border-emerald-500 transition-all"
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()} className="w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center text-3xl hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-10 active:scale-95">↗</button>
        </div>
      </div>
    </div>
  );
};
