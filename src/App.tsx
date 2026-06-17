import React, { useState } from 'react';
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

const AppContent: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#111] text-zinc-100 relative">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-grow">
        {activeTab === 'landing' && <Hero setActiveTab={setActiveTab} />}
        {activeTab === 'roster' && <Roster />}
        {activeTab === 'achievements' && <Achievements />}
        {activeTab === 'schedule' && <Schedule />}
        {activeTab === 'news' && <News />}
        {activeTab === 'stats' && <Statistics />}
        {activeTab === 'admin' && <AdminPanel />}
        {activeTab === 'profile' && <Profile />}
      </main>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');

  const handleAuthRedirect = () => {
    setActiveTab('profile'); // Переносим в кабинет автоматически!
  };

  return (
    <ClanProvider onAuthSuccess={handleAuthRedirect}>
      <AppContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </ClanProvider>
  );
}