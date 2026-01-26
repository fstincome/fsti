import React, { useState } from 'react';
import { MOCK_NEWS, NEW_PROVINCES } from '../constants.ts';
import { getMbanzaResponse } from '../services/geminiService.ts';

interface NewsListProps {
  showFilter?: boolean; // optionnel
  limit?: number;       // pour Home (ex: 3 news)
}

interface SummariesState {
  [key: string]: {
    text: string;
    loading: boolean;
  };
}

export const NewsList: React.FC<NewsListProps> = ({
  showFilter = true,
  limit
}) => {
  const [summaries, setSummaries] = useState<SummariesState>({});
  const [selectedProvince, setSelectedProvince] = useState<string>('all');

  const filteredNews = MOCK_NEWS
    .filter(news =>
      selectedProvince === 'all' || news.provinceTag === selectedProvince
    )
    .slice(0, limit ?? MOCK_NEWS.length);

  const handleGenerateSummary = async (
    articleId: string,
    title: string,
    summary: string
  ) => {
    if (summaries[articleId]?.text || summaries[articleId]?.loading) return;

    setSummaries(prev => ({
      ...prev,
      [articleId]: { text: '', loading: true }
    }));

    const prompt = `Explain its significance for the nation's 2025 digital transformation. Article: ${title} - ${summary}`;

    const aiText = await getMbanzaResponse(prompt, {
      view: 'news',
      history: [],
      advanced: true
    });

    setSummaries(prev => ({
      ...prev,
      [articleId]: { text: aiText, loading: false }
    }));
  };

  return (
    <div className="space-y-12">
      {showFilter && (
        <div className="max-w-sm">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
            Regional Filter
          </label>
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-widest"
          >
            <option value="all">All Provinces</option>
            {NEW_PROVINCES.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {filteredNews.map(news => (
          <article key={news.id} className="bg-white rounded-[50px] overflow-hidden border border-slate-100 shadow-sm">
            <img src={news.image} className="h-64 w-full object-cover" />
            <div className="p-10">
              <h3 className="text-2xl font-black">{news.title}</h3>
              <p className="text-slate-500 italic mt-4">"{news.summary}"</p>

              {summaries[news.id]?.text && (
                <div className="mt-6 p-6 bg-emerald-50 rounded-3xl">
                  <p className="text-emerald-900 text-sm italic">
                    {summaries[news.id].text}
                  </p>
                </div>
              )}

              <button
                onClick={() => handleGenerateSummary(news.id, news.title, news.summary)}
                className="mt-6 w-full border-2 border-emerald-200 py-4 rounded-2xl font-black text-xs uppercase"
              >
                🧠 AI Deep Analysis
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
