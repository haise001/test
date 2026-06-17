import React, { useState, useEffect } from 'react';
import { ClanProvider } from './context/ClanContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Roster } from './components/Roster';
import { Achievements } from './components/Achievements';
import { Schedule } from './components/Schedule';
import { News } from './components/News';
import { Statistics } from './components/Statistics';
import { AdminPanel } from './components/AdminPanel';
import { Profile } from './components/Profile';
import { Shield, ChevronUp } from 'lucide-react';

const AppContent: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => {
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'landing':
        return <Hero setActiveTab={setActiveTab} />;
      case 'roster':
        return <Roster />;
      case 'achievements':
        return <Achievements />;
      case 'schedule':
        return <Schedule />;
      case 'news':
        return <News />;
      case 'stats':
        return <Statistics />;
      case 'admin':
        return <AdminPanel />;
      case 'profile':
        return <Profile />;
      default:
        return <Hero setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-coal text-zinc-150 relative selection:bg-purple-primary selection:text-white animate-fadeIn">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <main className="flex-grow">
        {renderActiveComponent()}
      </main>

      <footer className="bg-coal-dark border-t border-purple-primary/15 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            <div className="space-y-4 col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-primary flex items-center justify-center clip-cyber-sm glow-purple">
                  <span className="gamer-font text-white text-base font-bold">V</span>
                </div>
                <span className="gamer-font text-xl font-black tracking-wider text-white text-glow-purple">
                  VORTEX
                </span>
              </div>
              <p className="text-zinc-500 text-sm max-w-sm font-light">
                Премиальное игровое сообщество, стремящееся к лидерству в соревновательном гейминге. Развиваем таланты, создаем сплоченные команды и доминируем на аренах.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-xs tracking-widest gamer-font">Навигация</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><button onClick={() => setActiveTab('landing')} className="hover:text-purple-bright transition-colors text-left cursor-pointer">Главная</button></li>
                <li><button onClick={() => setActiveTab('roster')} className="hover:text-purple-bright transition-colors text-left cursor-pointer">Состав Клана</button></li>
                <li><button onClick={() => setActiveTab('achievements')} className="hover:text-purple-bright transition-colors text-left cursor-pointer">Наши Достижения</button></li>
                <li><button onClick={() => setActiveTab('schedule')} className="hover:text-purple-bright transition-colors text-left cursor-pointer">Расписание Матчей</button></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-xs tracking-widest gamer-font">Связь с нами</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="https://discord.gg/BuSBWGNf" target="_blank" rel="noopener noreferrer" className="hover:text-purple-bright transition-colors">Официальный Discord</a></li>
                <li><button onClick={() => setActiveTab('admin')} className="hover:text-purple-bright transition-colors text-left cursor-pointer">Панель Администратора</button></li>
                <li><button onClick={() => setActiveTab('stats')} className="hover:text-purple-bright transition-colors text-left cursor-pointer">Статистика и API</button></li>
                <li><span className="text-zinc-600 text-xs">Email: contact@vortexclan.ru</span></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-zinc-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-purple-primary" />
              <span>&copy; {new Date().getFullYear()} VORTEX CLAN. Все права защищены.</span>
            </div>
            
            <div className="flex space-x-4">
              <span>Сделано с ❤️ для геймеров</span>
              <span>•</span>
              <a href="https://discord.gg/BuSBWGNf" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">Присоединиться к Discord</a>
            </div>
          </div>

        </div>
      </footer>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-30 p-3 rounded bg-purple-primary hover:bg-purple-bright text-white shadow-lg border border-purple-bright/20 transition-all hover:scale-115 glow-purple"
          title="Наверх"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');

  const handleAuthRedirect = () => {
    setActiveTab('profile');
  };

  return (
    <ClanProvider onAuthSuccess={handleAuthRedirect}>
      <AppContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </ClanProvider>
  );
}