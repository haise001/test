import React, { useState } from 'react';
import { useClan } from '../context/ClanContext';
import { Activity, ShieldAlert, Award, RefreshCw, User } from 'lucide-react';

export const Statistics: React.FC = () => {
  const { stats, members } = useClan();
  const [activeChart, setActiveChart] = useState<'growth' | 'winrate'>('growth');
  const [playerTag, setPlayerTag] = useState('76561198XXXXXXXXX');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [syncSteps, setSyncSteps] = useState<string[]>([]);
  const [syncedData, setSyncedData] = useState<any>(null);

  const maxMembers = Math.max(...stats.map(s => s.membersCount));
  const chartWidth = 500;
  const chartHeight = 200;
  const padding = 30;

  const linePoints = stats.map((s, idx) => {
    const x = padding + (idx * (chartWidth - padding * 2)) / (stats.length - 1);
    const y = chartHeight - padding - ((s.membersCount / maxMembers) * (chartHeight - padding * 2));
    return { x, y, label: s.month, value: s.membersCount };
  });
  const linePath = linePoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const maxHours = Math.max(...stats.map(s => s.totalHours));
  const barWidth = 35;
  const barSpacing = (chartWidth - padding * 2) / stats.length;
  const bars = stats.map((s, idx) => {
    const x = padding + idx * barSpacing + (barSpacing - barWidth) / 2;
    const height = ((s.totalHours / maxHours) * (chartHeight - padding * 2));
    const y = chartHeight - padding - height;
    return { x, y, width: barWidth, height, label: s.month, value: s.totalHours };
  });

  const startSync = async () => {
    if (!playerTag.trim()) {
      setSyncStatus('error');
      return;
    }
    setSyncStatus('loading');
    setSyncSteps([]);
    const steps = [
      'Подключение к Steam Community API...',
      'Поиск профиля по SteamID64...',
      'Загрузка игрового времени в Squad (AppID 393380)...',
      'Анализ активности за последние 2 недели...',
      'Данные синхронизированы!'
    ];
    for (let i = 0; i < steps.length; i++) {
      setSyncSteps(prev => [...prev, steps[i]]);
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    const mockHours = Math.floor(Math.random() * 2000) + 100;
    setSyncedData({
      nick: 'Steam_Battle_' + Math.floor(Math.random() * 999),
      steamId: playerTag,
      rank: mockHours > 1000 ? 'Ветеран Squad' : mockHours > 500 ? 'Бывалый' : 'Новобранец',
      hours: mockHours,
      lastTwoWeeks: Math.floor(Math.random() * 40),
      bestRole: 'Стрелок / LAT',
      favoriteMap: 'Gorodok / Fallujah',
      lastSync: new Date().toLocaleTimeString('ru-RU')
    });
    setSyncStatus('success');
  };

  return (
    <div className="py-12 bg-coal-dark min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center md:text-left mb-12 border-b border-zinc-900 pb-6">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 uppercase tracking-tighter">СТАТИСТИКА RISEN SQUAD</h1>
          <p className="text-zinc-400">Графики роста отряда, общий налёт часов и проверка профиля Steam.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-8 bg-coal-medium border border-zinc-800/80 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4 mb-6">
              <h3 className="font-bold text-white uppercase text-lg tracking-wider gamer-font flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-bright" />
                <span>Аналитика Отряда</span>
              </h3>
              <div className="flex bg-coal-dark p-1 rounded-md border border-zinc-800">
                <button
                  onClick={() => setActiveChart('growth')}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${activeChart === 'growth' ? 'bg-purple-primary text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Численность
                </button>
                <button
                  onClick={() => setActiveChart('winrate')}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${activeChart === 'winrate' ? 'bg-purple-primary text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Часы
                </button>
              </div>
            </div>

            <div className="relative p-2 bg-coal-dark/50 border border-zinc-900 rounded-lg flex justify-center min-h-[220px]">
              {activeChart === 'growth' && (
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
                  {Array.from({ length: 4 }).map((_, i) => {
                    const y = padding + (i * (chartHeight - padding * 2)) / 3;
                    return <line key={i} x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
                  })}
                  <path d={linePath} fill="none" stroke="url(#purple-gradient)" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]" />
                  <defs>
                    <linearGradient id="purple-gradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#9D4EDD" />
                    </linearGradient>
                  </defs>
                  {linePoints.map((p, idx) => (
                    <g key={idx} className="group cursor-pointer">
                      <circle cx={p.x} cy={p.y} r="5" fill="#0A0A0F" stroke="#9D4EDD" strokeWidth="2.5" />
                      <text x={p.x} y={p.y - 12} fill="#E0AAFF" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">{p.value} чел.</text>
                      <text x={p.x} y={chartHeight - 8} fill="#71717a" fontSize="10" fontWeight="bold" textAnchor="middle">{p.label}</text>
                    </g>
                  ))}
                </svg>
              )}
              {activeChart === 'winrate' && (
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
                  {Array.from({ length: 4 }).map((_, i) => {
                    const y = padding + (i * (chartHeight - padding * 2)) / 3;
                    return <line key={i} x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
                  })}
                  {bars.map((bar, idx) => (
                    <g key={idx} className="group cursor-pointer">
                      <rect x={bar.x} y={padding} width={bar.width} height={chartHeight - padding * 2} fill="rgba(255,255,255,0.02)" rx="3" />
                      <rect x={bar.x} y={bar.y} width={bar.width} height={bar.height} fill="#7C3AED" rx="3" className="hover:fill-purple-bright transition-colors drop-shadow-[0_0_8px_rgba(124,58,237,0.4)]" />
                      <text x={bar.x + bar.width / 2} y={bar.y - 8} fill="#E0AAFF" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">{bar.value}ч</text>
                      <text x={bar.x + bar.width / 2} y={chartHeight - 8} fill="#71717a" fontSize="10" fontWeight="bold" textAnchor="middle">{bar.label}</text>
                    </g>
                  ))}
                </svg>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-800/60">
              <div className="bg-coal-dark/40 p-4 border border-zinc-800/60 rounded-xl">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Общий налёт отряда</div>
                <div className="text-2xl font-black text-white mt-1 font-mono">{members.reduce((acc, m) => acc + m.hours, 0)}</div>
                <div className="text-[10px] text-purple-bright font-bold mt-0.5">Часов в Squad</div>
              </div>
              <div className="bg-coal-dark/40 p-4 border border-zinc-800/60 rounded-xl">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Средний налёт бойца</div>
                <div className="text-2xl font-black text-white mt-1 font-mono">{Math.floor(members.reduce((acc, m) => acc + m.hours, 0) / members.length)}</div>
                <div className="text-[10px] text-zinc-400 font-bold mt-0.5">Часов в среднем</div>
              </div>
              <div className="bg-coal-dark/40 p-4 border border-zinc-800/60 rounded-xl">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Активность за месяц</div>
                <div className="text-2xl font-black text-white mt-1 font-mono">42</div>
                <div className="text-[10px] text-green-500 font-bold mt-0.5">Бойца онлайн</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-coal-medium border border-zinc-800/80 rounded-xl p-6 shadow-xl space-y-6">
            <h3 className="font-bold text-white uppercase text-lg tracking-wider gamer-font flex items-center space-x-2">
              <Award className="w-5 h-5 text-purple-bright" />
              <span>Steam Синхронизация</span>
            </h3>
            <p className="text-zinc-400 text-xs">
              Введите ваш SteamID64, чтобы подтянуть часы в Squad из Steam API.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={playerTag}
                onChange={(e) => setPlayerTag(e.target.value)}
                placeholder="76561198XXXXXXXXX"
                className="flex-grow bg-coal-dark border border-zinc-800 rounded px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-primary text-sm font-mono"
              />
              <button
                onClick={startSync}
                disabled={syncStatus === 'loading'}
                className="bg-purple-primary hover:bg-purple-bright text-white font-bold px-4 rounded text-xs uppercase tracking-wider transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${syncStatus === 'loading' ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {syncStatus === 'loading' && (
              <div className="bg-coal-dark/80 border border-zinc-900 rounded p-4 space-y-2 text-xs font-mono">
                <div className="flex items-center space-x-2 text-purple-bright mb-1 font-sans font-bold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>ПОДКЛЮЧЕНИЕ К STEAM API...</span>
                </div>
                {syncSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-1.5 text-zinc-400">
                    <span className="text-purple-bright">&gt;</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}

            {syncStatus === 'success' && syncedData && (
              <div className="bg-coal-dark/50 border border-purple-primary/30 rounded-xl p-5 space-y-5">
                <div className="flex items-center space-x-3 border-b border-zinc-800/60 pb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-primary/20 border border-purple-primary/30 flex items-center justify-center text-purple-bright">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">{syncedData.nick}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{syncedData.steamId}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-coal-medium border border-zinc-800 p-3.5 rounded-lg text-center">
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase">Опыт</div>
                    <div className="text-xl font-black text-white mt-1 font-mono">{syncedData.hours} ч.</div>
                  </div>
                  <div className="bg-coal-medium border border-zinc-800 p-3.5 rounded-lg text-center">
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase">Статус</div>
                    <div className="text-xl font-black text-white mt-1 font-mono">{syncedData.rank}</div>
                  </div>
                </div>
                <div className="text-[9px] text-zinc-500 text-right italic">
                  Последняя синхронизация: {syncedData.lastSync}
                </div>
              </div>
            )}

            {syncStatus === 'error' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3 text-xs text-red-400">
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                <span>Неверный SteamID или профиль скрыт.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
