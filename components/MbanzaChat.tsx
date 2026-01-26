import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Copy, Check, MessageSquarePlus } from 'lucide-react';

const API_KEY = import.meta.env.VITE_PPQ_KEY;
const ENDPOINT = "https://api.ppq.ai/chat/completions";
const MODEL = "gpt-4o";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  suggestions?: string[];
}

export const MbanzaChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Connexion au Node FSTI établie. Je suis Mbanza ndakwishura, votre assistant FSTI. Que puis-je pour vous ?", 
      sender: 'bot',
      suggestions: ["C'est quoi le Hub FSTI ?", "Comment m'inscrire ?", "Quelles sont les formations ?"]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    e?.preventDefault();
    const messageText = customText || input;
    if (!messageText.trim() || isTyping) return;

    setMessages(prev => [...prev, { id: Date.now(), text: messageText, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { 
              role: "system", 
              content: "Tu es Mbanza, l'IA du Hub FSTI au Burundi. Réponds de façon concise. À la toute fin de ta réponse, génère TOUJOURS exactement 3 questions courtes que l'utilisateur pourrait poser ensuite, séparées par des points-virgules, sous ce format précis : SUGGESTIONS: question1; question2; question3" 
            },
            { role: "user", content: messageText }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Erreur API");

      let rawText = data.choices[0].message.content;
      
      // Extraction des suggestions
      let suggestions: string[] = [];
      if (rawText.includes("SUGGESTIONS:")) {
        const parts = rawText.split("SUGGESTIONS:");
        rawText = parts[0].trim();
        suggestions = parts[1].split(";").map((s: string) => s.trim()).filter((s: string) => s !== "");
      }

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: rawText, 
        sender: 'bot', 
        suggestions: suggestions.length > 0 ? suggestions : undefined 
      }]);

    } catch (error: any) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: `Erreur : ${error.message}`, sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-[50px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      
      {/* HEADER */}
      <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Bot size={28} />
          </div>
          <div>
            <h3 className="font-black uppercase italic tracking-tighter">Mbaza ndakwishura</h3>
            <span className="text-[8px] text-emerald-500 font-black uppercase">Guhindura ubuhinga bw'iwacu mu mitahe irama</span>
          </div>
        </div>
        <Sparkles className="text-blue-500 animate-pulse" />
      </div>

      {/* CHAT ZONE */}
      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-8 bg-slate-50/50 dark:bg-slate-950/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              
              <div className="relative group">
                <div className={`p-5 rounded-[30px] font-bold text-sm italic shadow-sm transition-all ${
                  msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-slate-800 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-700'
                }`}>
                  {msg.text}
                </div>

                {/* Bouton Copier (uniquement pour le bot) */}
                {msg.sender === 'bot' && (
                  <button 
                    onClick={() => copyToClipboard(msg.text, msg.id)}
                    className="absolute -right-10 top-2 p-2 bg-white dark:bg-slate-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedId === msg.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-slate-400" />}
                  </button>
                )}
              </div>
            </div>

            {/* Suggestions de questions */}
            {msg.suggestions && msg.suggestions.length > 0 && !isTyping && (
              <div className="mt-4 flex flex-wrap gap-2 ml-11">
                {msg.suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(undefined, sug)}
                    className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-tighter border border-blue-100 dark:border-blue-800 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                  >
                    <MessageSquarePlus size={12} />
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start ml-11">
            <div className="bg-blue-600/10 text-blue-600 px-6 py-2 rounded-full text-[10px] font-black uppercase animate-pulse border border-blue-600/20">
              Mbaza prépare la suite...
            </div>
          </div>
        )}
      </div>

      {/* INPUT ZONE */}
      <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <form onSubmit={handleSendMessage} className="flex gap-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-[30px] border border-transparent focus-within:border-blue-600 transition-all">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrivez votre message..." 
            className="flex-1 bg-transparent p-4 outline-none font-bold italic dark:text-white text-sm"
          />
          <button 
            type="submit"
            disabled={isTyping}
            className="bg-blue-600 text-white p-4 rounded-[25px] hover:scale-110 active:scale-95 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};