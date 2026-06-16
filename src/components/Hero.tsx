import React, { useState, useEffect } from 'react';
import { ParticleBackground } from './ParticleBackground';
import { useClan } from '../context/ClanContext';
import { ChevronRight, Shield, Swords, Users, Target, Activity } from 'lucide-react';

interface HeroProps {
  setActiveTab: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ setActiveTab }) => {
  const { members, achievements } = useClan();
  
  // States for counting animation
  const [memberCount, setMemberCount] = useState(0);
  const [winCount, setWinCount] = useState(0);
  const [rankPos, setRankPos] = useState(0);
  const [winRate, setWinRate] = useState(0);

  // Targets for counting animation
  const targetMembers = members.length * 12 + 64; // Scale it up to look like a large active gaming community
  const targetWins = 342;
  const targetRank = 12; // Top 12 in regional ladder
  const targetWinrate = 78;

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 2000; // 2 seconds animation

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing out quad
      const easeProgress = progress * (2 - progress);

      setMemberCount(Math.floor(easeProgress * targetMembers));
      setWinCount(Math.floor(easeProgress * targetWins));
      setRankPos(Math.max(1, Math.floor(targetRank + (100 - targetRank) * (1 - easeProgress))));
      setWinRate(Math.floor(easeProgress * targetWinrate));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Set exact targets at the end
        setMemberCount(targetMembers);
        setWinCount(targetWins);
        setRankPos(targetRank);
        setWinRate(targetWinrate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetMembers, targetWins, targetRank, targetWinrate]);

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-coal-dark">
      
      {/* Particle & Dark Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-coal-dark via-transparent to-coal-dark/50 z-0"></div>
      <ParticleBackground />

      {/* Futuristic glowing spheres in background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-primary/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-bright/5 blur-[150px] pointer-events-none z-0"></div>

      {/* Main Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10 flex-grow flex flex-col justify-center">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-primary/10 border border-purple-primary/30 text-purple-bright text-xs font-semibold uppercase tracking-widest mb-6 glow-purple animate-pulse">
            <Shield className="w-3.5 h-3.5" />
            <span>ОФИЦИАЛЬНЫЙ КЛАНОВЫЙ САЙТ</span>
          </div>

          {/* Slogan */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 leading-none select-none">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              СОЗДАВАЙ ИСТОРИЮ
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-primary via-purple-bright to-purple-glow text-glow-purple animate-glitch">
              ДОМИНИРУЙ. ПОБЕЖДАЙ.
            </span>
          </h1>

          {/* Motto */}
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Мы — не просто клан, мы — братство единомышленников, стремящихся к абсолютному киберспортивному триумфу. Объединяем лучших тактиков и стрелков. Готов вписать свое имя в легенды?
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a
              href="https://discord.gg/BuSBWGNf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-primary to-purple-bright text-white px-8 py-4 rounded-md font-bold uppercase tracking-wider text-base clip-cyber transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] glow-purple"
            >
              <span>ВСТУПИТЬ В КЛАН</span>
              <ChevronRight className="w-5 h-5" />
            </a>
            
            <button
              onClick={() => setActiveTab('roster')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 border border-zinc-700 bg-coal-medium/50 hover:bg-zinc-800/80 hover:border-zinc-500 text-white px-8 py-4 rounded-md font-bold uppercase tracking-wider text-base clip-cyber transition-all duration-300"
            >
              <span>НАШ СОСТАВ</span>
            </button>
          </div>

        </div>

        {/* Counter Section (Numbers count up on load) */}
        <div className="mt-24 max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-1 bg-gradient-to-r from-purple-primary/30 via-zinc-800/30 to-purple-primary/30 rounded-2xl border border-purple-primary/20 backdrop-blur-sm shadow-2xl">
            <div className="bg-coal-medium/80 backdrop-blur rounded-xl p-6 text-center border border-zinc-800/50">
              <div className="flex justify-center mb-2 text-purple-bright">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-1 font-mono">
                {memberCount}
              </div>
              <div className="text-xs sm:text-sm text-zinc-400 uppercase tracking-wider font-semibold gamer-font">
                Участников
              </div>
            </div>

            <div className="bg-coal-medium/80 backdrop-blur rounded-xl p-6 text-center border border-zinc-800/50">
              <div className="flex justify-center mb-2 text-purple-bright">
                <Swords className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-1 font-mono">
                {winCount}
              </div>
              <div className="text-xs sm:text-sm text-zinc-400 uppercase tracking-wider font-semibold gamer-font">
                Побед в матчах
              </div>
            </div>

            <div className="bg-coal-medium/80 backdrop-blur rounded-xl p-6 text-center border border-zinc-800/50">
              <div className="flex justify-center mb-2 text-purple-bright">
                <Target className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-1 font-mono">
                #{rankPos}
              </div>
              <div className="text-xs sm:text-sm text-zinc-400 uppercase tracking-wider font-semibold gamer-font">
                Ранг в ладдере
              </div>
            </div>

            <div className="bg-coal-medium/80 backdrop-blur rounded-xl p-6 text-center border border-zinc-800/50">
              <div className="flex justify-center mb-2 text-purple-bright">
                <Activity className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-1 font-mono">
                {winRate}%
              </div>
              <div className="text-xs sm:text-sm text-zinc-400 uppercase tracking-wider font-semibold gamer-font">
                Винрейт клана
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clan Overview and Features */}
      <div className="bg-coal-dark border-t border-zinc-900 py-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">ПОЧЕМУ ИМЕННО RISEN SQUAD?</h2>
            <p className="text-zinc-400">Мы развиваем инфраструктуру для хардкорного и профессионального гейминга, обеспечивая идеальную среду для каждого игрока.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-coal-medium border border-zinc-800 hover:border-purple-primary/30 p-8 rounded-xl transition-all hover:-translate-y-2 duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-purple-primary/10 flex items-center justify-center text-purple-bright mb-6 group-hover:bg-purple-primary/20 transition-all">
                <Swords className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Киберспортивный Фокус</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Регулярное участие в региональных и онлайн турнирах с призовыми фондами. Собственные лиги и тренировочные матчи внутри клана.</p>
            </div>

            <div className="bg-coal-medium border border-zinc-800 hover:border-purple-primary/30 p-8 rounded-xl transition-all hover:-translate-y-2 duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-purple-primary/10 flex items-center justify-center text-purple-bright mb-6 group-hover:bg-purple-primary/20 transition-all">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Живой Discord Сервер</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Активное сообщество 24/7. Удобные каналы для поиска напарников, голосовые комнаты высокого качества, боты для статистики и крутые кастомные роли.</p>
            </div>

            <div className="bg-coal-medium border border-zinc-800 hover:border-purple-primary/30 p-8 rounded-xl transition-all hover:-translate-y-2 duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-purple-primary/10 flex items-center justify-center text-purple-bright mb-6 group-hover:bg-purple-primary/20 transition-all">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Профессиональный Тренинг</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Разборы тактик с опытными офицерами и лидером клана. Индивидуальный анализ ваших записей игр, тренировки аима и раскидок.</p>
            </div>
          </div>

          {/* Mini Achievements Ticker */}
          <div className="mt-20 p-6 bg-coal-medium/40 border border-zinc-800/60 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Последнее достижение:</h4>
                <p className="text-zinc-400 text-xs mt-0.5">{achievements[0]?.title || 'Участие в турнирах'} ({achievements[0]?.place || 'Топ'})</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('achievements')}
              className="text-purple-bright hover:text-white text-sm font-bold flex items-center space-x-1 group"
            >
              <span>СМОТРЕТЬ ВСЕ ДОСТИЖЕНИЯ</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
