import React, { useState } from 'react';
import { useClan } from '../context/ClanContext';
import { 
  Users, Trophy, Calendar, Newspaper, TrendingUp, Home, User,
  ShieldCheck, ShieldAlert, Menu, X
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { 
    isAdmin, 
    currentUser, loginWithSteam, logoutUser, isLoggingIn 
  } = useClan();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'landing', label: 'Главная', icon: Home },
    { id: 'roster', label: 'Состав', icon: Users },
    { id: 'achievements', label: 'Достижения', icon: Trophy },
    { id: 'schedule', label: 'Расписание', icon: Calendar },
    { id: 'news', label: 'Новости', icon: Newspaper },
    { id: 'stats', label: 'Статистика', icon: TrendingUp },
  ];

  // Добавляем пункт "Профиль" если пользователь авторизован
  if (currentUser) {
    menuItems.push({ id: 'profile', label: 'Кабинет', icon: User });
  }

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const DiscordIcon = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36">
      <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.43-5c.89-.66,1.76-1.37,2.58-2.1a75.22,75.22,0,0,0,72.58,0c.82.73,1.69,1.44,2.58,2.1a68.43,68.43,0,0,1-10.43,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129.87,50.87,123.77,28,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
    </svg>
  );

  return (
    <header className="sticky top-0 z-40 bg-coal-dark/95 border-b border-purple-primary/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div onClick={() => handleTabClick('landing')} className="flex items-center space-x-3 cursor-pointer group">
            <div className="w-10 h-10 bg-purple-primary flex items-center justify-center clip-cyber-sm glow-purple group-hover:bg-purple-bright transition-all">
              <span className="gamer-font text-white text-xl font-bold">R</span>
            </div>
            <div className="flex flex-col">
              <span className="gamer-font text-2xl font-black tracking-wider text-white group-hover:text-purple-bright transition-colors text-glow-purple uppercase leading-none">RISEN SQUAD</span>
              <span className="text-[8px] text-zinc-500 tracking-[0.3em] font-bold mt-1 uppercase">Elite Cyber Unit</span>
            </div>
          </div>

          <nav className="hidden lg:flex space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id} onClick={() => handleTabClick(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-bold transition-all uppercase tracking-wider gamer-font ${
                    isActive ? 'text-white border-b-2 border-purple-primary bg-purple-primary/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-bright' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center space-x-5">
            {currentUser ? (
              <div className="flex items-center space-x-3 bg-zinc-900/50 border border-zinc-800 px-3 py-1.5 rounded-lg group">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-white uppercase truncate max-w-[100px]">{currentUser.displayName}</div>
                  <div className="text-[9px] text-zinc-500 font-bold mt-1">{currentUser.squadHours} ч. в Squad</div>
                </div>
                <div className="relative">
                  <img src={currentUser.photoURL} className="w-8 h-8 rounded border border-zinc-700" alt="avatar" />
                  <button onClick={logoutUser} className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2 h-2" /></button>
                </div>
              </div>
            ) : (
              <button
                onClick={loginWithSteam} disabled={isLoggingIn}
                className="flex items-center space-x-2 bg-[#1b2838] hover:bg-[#2a475e] text-white px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all border border-[#66c0f4]/20"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" className="w-4 h-4 invert" alt="steam" />
                <span>{isLoggingIn ? 'Вход...' : 'Войти через Steam'}</span>
              </button>
            )}

            {isAdmin ? (
              <button onClick={() => handleTabClick('admin')} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded bg-purple-primary/20 border border-purple-primary/50 text-xs font-semibold text-purple-bright hover:bg-purple-primary/30 transition-all ${activeTab === 'admin' ? 'glow-purple' : ''}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>АДМИН</span>
              </button>
            ) : (
              <button onClick={() => handleTabClick('admin')} className="text-zinc-600 hover:text-zinc-400 p-2 transition-all"><ShieldAlert className="w-4 h-4" /></button>
            )}

            <a href="https://discord.gg/BuSBWGNf" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-purple-primary hover:bg-purple-bright text-white px-5 py-2.5 rounded font-bold uppercase text-xs clip-cyber-btn tracking-wider transition-all glow-purple">
              <DiscordIcon />
              <span>DISCORD</span>
            </a>
          </div>

          <div className="flex items-center lg:hidden space-x-3">
            {!currentUser && (
              <button onClick={loginWithSteam} className="p-2 bg-[#1b2838] rounded border border-[#66c0f4]/30">
                <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" className="w-5 h-5 invert" alt="steam" />
              </button>
            )}
            {currentUser && <img src={currentUser.photoURL} className="w-8 h-8 rounded-full border border-purple-primary" alt="avatar" />}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-400 hover:text-white p-2">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-coal-medium border-t border-purple-primary/20 px-2 pt-2 pb-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id} onClick={() => handleTabClick(item.id)}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded text-base font-semibold uppercase tracking-wider gamer-font ${activeTab === item.id ? 'bg-purple-primary/20 text-purple-bright border-l-4 border-purple-primary' : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
          <div className="pt-4 border-t border-zinc-800/60 px-4 space-y-3">
            {currentUser ? (
              <div className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                <div className="flex items-center space-x-3">
                  <img src={currentUser.photoURL} className="w-10 h-10 rounded border border-zinc-700" alt="avatar" />
                  <div>
                    <div className="text-sm font-bold text-white uppercase">{currentUser.displayName}</div>
                    <div className="text-xs text-zinc-500">{currentUser.squadHours} ч. в Squad</div>
                  </div>
                </div>
                <button onClick={logoutUser} className="text-xs text-red-500 font-bold uppercase">Выйти</button>
              </div>
            ) : (
              <button onClick={loginWithSteam} disabled={isLoggingIn} className="flex items-center justify-center space-x-3 bg-[#1b2838] text-white py-3 rounded font-bold uppercase text-xs w-full border border-[#66c0f4]/20">
                <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" className="w-5 h-5 invert" alt="steam" />
                <span>{isLoggingIn ? 'ПОДКЛЮЧЕНИЕ...' : 'ВОЙТИ ЧЕРЕЗ STEAM'}</span>
              </button>
            )}
            <a href="https://discord.gg/BuSBWGNf" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-2 bg-purple-primary text-white py-3 rounded font-bold uppercase text-xs w-full glow-purple">
              <DiscordIcon />
              <span>ВСТУПИТЬ В DISCORD</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
