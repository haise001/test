import React from 'react';
import { useClan } from '../context/ClanContext';
import { Trophy, Medal, Shield, Zap, Clock, User, Award } from 'lucide-react';

export const Achievements: React.FC = () => {
  const { achievements, members } = useClan();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy':
        return <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />;
      case 'Shield':
        return <Shield className="w-8 h-8 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />;
      case 'Medal':
        return <Medal className="w-8 h-8 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" />;
      case 'Zap':
        return <Zap className="w-8 h-8 text-purple-bright drop-shadow-[0_0_8px_rgba(157,78,221,0.5)]" />;
      default:
        return <Award className="w-8 h-8 text-zinc-400" />;
    }
  };

  const sortedMembers = [...members].sort((a, b) => b.hours - a.hours);
  const totalHours = members.reduce((acc, m) => acc + m.hours, 0);

  return (
    <div className="py-12 bg-coal-dark min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center md:text-left mb-12 border-b border-zinc-900 pb-6">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 uppercase tracking-tighter">ДОСТИЖЕНИЯ И ЛИЧНЫЙ СОСТАВ</h1>
          <p className="text-zinc-400">Наши победы и боевой опыт участников RISEN SQUAD.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-white flex items-center space-x-3 uppercase tracking-wider">
              <Trophy className="w-7 h-7 text-purple-bright" />
              <span>Зал Славы</span>
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {achievements.map((ach) => (
                <div 
                  key={ach.id}
                  className="bg-coal-medium border border-zinc-800/80 hover:border-purple-primary/40 rounded-xl p-6 flex items-start space-x-5 hover:bg-coal-light transition-all duration-300 relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex-shrink-0 p-3 bg-coal-dark/50 border border-zinc-800/60 rounded-lg group-hover:border-purple-primary/30 transition-all">
                    {getIcon(ach.icon)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-purple-bright transition-colors">
                        {ach.title}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-primary/20 border border-purple-primary/40 text-purple-bright text-[10px] font-bold uppercase tracking-wider">
                        {ach.place}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white flex items-center space-x-3 uppercase tracking-wider">
                <User className="w-7 h-7 text-purple-bright" />
                <span>Боевой Налет</span>
              </h2>
              <div className="text-[10px] font-bold text-zinc-500 bg-zinc-800/40 px-2 py-1 rounded border border-zinc-700 uppercase tracking-widest">
                Часы в Squad
              </div>
            </div>

            <div className="bg-coal-medium border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl">
              <div className="max-h-[700px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-coal-dark/70 border-b border-zinc-800/80 text-zinc-500 uppercase text-[10px] font-bold tracking-widest">
                      <th className="py-4 px-6 text-center w-16">№</th>
                      <th className="py-4 px-6">Позывной</th>
                      <th className="py-4 px-6 text-right">Налет (Часы)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {sortedMembers.map((member, index) => (
                      <tr 
                        key={member.id}
                        className={`hover:bg-coal-light/40 transition-colors group ${index < 3 ? 'bg-purple-primary/[0.03]' : ''}`}
                      >
                        <td className="py-4 px-6 text-center font-mono font-bold text-sm">
                          {index === 0 ? <span className="text-yellow-500">🏆</span> :
                           index === 1 ? <span className="text-zinc-400">🥈</span> :
                           index === 2 ? <span className="text-orange-400">🥉</span> :
                           <span className="text-zinc-600">{index + 1}</span>}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={member.avatar} 
                              alt={member.nick}
                              className="w-8 h-8 rounded-lg object-cover border border-zinc-800 group-hover:border-purple-primary transition-colors"
                            />
                            <div>
                              <div className="font-bold text-white tracking-wide group-hover:text-purple-bright transition-colors">
                                {member.nick}
                              </div>
                              <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">
                                {member.rankName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <span className="font-mono font-bold text-white text-base">
                              {member.hours}
                            </span>
                            <Clock className="w-3.5 h-3.5 text-purple-bright opacity-60" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-coal-dark/50 p-4 border-t border-zinc-800 text-[10px] text-zinc-500 text-center uppercase tracking-widest font-bold">
                Общий налет отряда:{' '}
                <span className="text-purple-bright">{totalHours} ч.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
