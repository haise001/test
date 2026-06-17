import React, { useState } from 'react';
import { ClanProvider } from './context/ClanContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Profile } from './components/Profile';
import { Roster } from './components/Roster';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');

  // Эта функция сработает КРАЙНЕ надежно, так как вызовется 
  // внутри useEffect контекста сразу после записи данных в стейт
  const handleAuthSuccess = () => {
    setActiveTab('profile');
  };

  return (
    <ClanProvider onAuthSuccess={handleAuthSuccess}>
      <div className="min-h-screen bg-coal text-white">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="p-4">
          {activeTab === 'landing' && <Hero setActiveTab={setActiveTab} />}
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'roster' && <Roster />}
        </main>
      </div>
    </ClanProvider>
  );
}