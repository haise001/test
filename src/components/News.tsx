import React, { useState } from 'react';
import { useClan, NewsPost } from '../context/ClanContext';
import { Heart, ExternalLink, Calendar, User, Hash, Sparkles } from 'lucide-react';

export const News: React.FC = () => {
  const { news, likeNews, isAdmin, deleteNews } = useClan();
  
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'clan' | 'game' | 'match'>('all');
  const [myMessage, setMyMessage] = useState('');

  const filteredNews = selectedCategory === 'all'
    ? news
    : news.filter(post => post.category === selectedCategory);

  const getCategoryLabel = (category: NewsPost['category']) => {
    switch (category) {
      case 'clan': return { label: 'О жизни клана', color: 'text-purple-bright bg-purple-primary/10 border-purple-primary/20' };
      case 'game': return { label: 'Патчноуты игры', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      case 'match': return { label: 'Результаты матчей', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' };
    }
  };

  return (
    <div className="py-12 bg-coal-dark min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center md:text-left mb-12 border-b border-zinc-900 pb-6">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 uppercase tracking-tighter">НОВОСТИ RISEN SQUAD</h1>
          <p className="text-zinc-400">Обновления жизни клана, патчноуты Squad и результаты операций.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-wrap gap-2">
              {['all', 'clan', 'game', 'match'].map((id) => (
                <button
                  key={id} onClick={() => setSelectedCategory(id as any)}
                  className={`px-4 py-2 rounded font-bold text-[10px] uppercase tracking-widest transition-all ${selectedCategory === id ? 'bg-purple-primary text-white shadow-lg' : 'bg-coal-medium border border-zinc-800 text-zinc-500'}`}
                >
                  {id === 'all' ? 'Все' : id === 'clan' ? 'Жизнь' : id === 'game' ? 'Патчи' : 'Игры'}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {filteredNews.map((post) => {
                const cat = getCategoryLabel(post.category);
                return (
                  <article key={post.id} className="bg-coal-medium border border-zinc-800 rounded-xl overflow-hidden shadow-lg group hover:border-purple-primary/40 transition-all flex flex-col md:flex-row">
                    <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0">
                      <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-6 flex-grow">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-2 py-0.5 border text-[8px] font-black uppercase tracking-widest rounded ${cat.color}`}>{cat.label}</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase"><Calendar className="inline w-3 h-3 mr-1" />{post.date}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-bright transition-colors">{post.title}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3 mb-6 font-light">{post.content}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/60">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase"><User className="inline w-3 h-3 mr-1" />{post.author}</span>
                        <div className="flex items-center space-x-4">
                          <button onClick={() => likeNews(post.id)} className="flex items-center space-x-1 text-zinc-500 hover:text-red-500 transition-colors">
                            <Heart className="w-4 h-4" /> <span className="font-mono font-bold text-xs">{post.likes}</span>
                          </button>
                          {isAdmin && <button onClick={() => deleteNews(post.id)} className="text-red-500/70 hover:text-red-500 text-[10px] font-bold uppercase">Удалить</button>}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-[#2f3136] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col h-[500px]">
              <div className="bg-[#36393f] px-4 py-3 border-b border-[#202225] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Hash className="w-5 h-5 text-[#8e9297]" />
                  <span className="font-bold text-white text-sm uppercase">general</span>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="flex-grow bg-[#36393f] p-4 flex flex-col justify-end space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-primary/20 flex items-center justify-center text-purple-bright"><Sparkles className="w-6 h-6" /></div>
                  <div>
                    <span className="font-bold text-purple-bright text-sm">RISEN_BOT</span>
                    <p className="text-[#dcddde] text-sm font-light mt-1">Добро пожаловать на наш сервер! Для связи заходите в Discord.</p>
                  </div>
                </div>
                <form className="mt-4" onSubmit={(e) => { e.preventDefault(); setMyMessage(''); }}>
                  <div className="bg-[#40444b] rounded-lg px-4 py-2.5">
                    <input 
                      type="text" value={myMessage} onChange={(e) => setMyMessage(e.target.value)} 
                      placeholder="Написать в #general" className="w-full bg-transparent border-none text-white placeholder-[#72767d] focus:outline-none text-sm" 
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
