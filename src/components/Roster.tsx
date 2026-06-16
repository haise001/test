import React, { useState } from 'react';
import { useClan } from '../context/ClanContext';
import { Search, ShieldAlert, ShieldCheck, User, Shield, Clock, ExternalLink } from 'lucide-react';

export const Roster: React.FC = () => {
  const { members } = useClan();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'leader' | 'officer' | 'recruit'>('all');

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.nick.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Get Role Badge Styling
  const getRoleBadge = (role: 'leader' | 'officer' | 'recruit') => {
    switch (role) {
      case 'leader':
        return {
          label: 'ЛИДЕР КЛАНА',
          classes: 'bg-purple-primary/20 border-purple-primary text-purple-bright shadow-[0_0_8px_rgba(124,58,237,0.3)]',
          icon: ShieldAlert
        };
      case 'officer':
        return {
          label: 'ОФИЦЕР / SL',
          classes: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
          icon: ShieldCheck
        };
      case 'recruit':
        return {
          label: 'БОЕЦ',
          classes: 'bg-zinc-800 border-zinc-700 text-zinc-400',
          icon: User
        };
    }
  };

  return (
    <div className="py-12 bg-coal-dark min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Section */}
        <div className="text-center md:text-left mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 uppercase tracking-tighter">СОСТАВ RISEN SQUAD</h1>
            <p className="text-zinc-400">Наши бойцы и их боевой налет в Squad.</p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Поиск по позывному..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-coal-medium border border-zinc-800 rounded-md pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-primary focus:ring-1 focus:ring-purple-primary transition-all"
            />
          </div>
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap gap-2.5 mb-10">
          {[
            { id: 'all', label: 'Весь состав' },
            { id: 'leader', label: 'Командование' },
            { id: 'officer', label: 'Офицеры / SL' },
            { id: 'recruit', label: 'Рядовые' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id as any)}
              className={`px-5 py-2 rounded font-semibold text-xs uppercase tracking-wider transition-all duration-200 clip-cyber-sm ${
                roleFilter === tab.id
                  ? 'bg-purple-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                  : 'bg-coal-medium border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-20 bg-coal-medium/20 border border-zinc-800/60 rounded-2xl">
            <Shield className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-zinc-400">Бойцы не найдены</h3>
            <p className="text-zinc-500 text-sm mt-1">Попробуйте изменить поисковый запрос</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member) => {
              const badge = getRoleBadge(member.role);
              const BadgeIcon = badge.icon;
              
              return (
                <div 
                  key={member.id}
                  className="group relative bg-coal-medium hover:bg-coal-light border border-zinc-800/80 hover:border-purple-primary/50 rounded-xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between h-full"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-zinc-800 group-hover:border-purple-primary transition-colors duration-300">
                          <img 
                            src={member.avatar} 
                            alt={member.nick}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        {/* Status Dot */}
                        <div className="absolute -bottom-1 -right-1 p-0.5 bg-coal-medium rounded-full">
                          <span className={`block w-4 h-4 rounded-full border border-coal-medium ${
                            member.status === 'online' ? 'bg-green-500 shadow-[0_0_6px_#22c55e]' :
                            member.status === 'in-game' ? 'bg-neon-cyan shadow-[0_0_6px_#00f0ff]' :
                            'bg-zinc-600'
                          }`} />
                        </div>
                      </div>

                      {/* Role Badge */}
                      <div className={`flex items-center space-x-1 px-2.5 py-1 border rounded text-[8px] font-black tracking-widest uppercase ${badge.classes}`}>
                        <BadgeIcon className="w-2.5 h-2.5" />
                        <span>{badge.label}</span>
                      </div>
                    </div>

                    {/* Nickname & Specialties */}
                    <div className="mt-5">
                      <h3 className="text-xl font-bold text-white tracking-wide truncate group-hover:text-purple-bright transition-colors uppercase">
                        {member.nick}
                      </h3>
                      <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-0.5">
                        {member.rankName}
                      </p>
                    </div>

                    {/* Squad Experience (Hours) */}
                    <div className="mt-6 p-3.5 bg-coal-dark/50 border border-zinc-800/80 rounded-lg flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-primary/10 rounded-md">
                          <Clock className="w-5 h-5 text-purple-bright" />
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Опыт в Squad</div>
                          <div className="text-lg font-black text-white font-mono leading-none mt-0.5">
                            {member.hours} <span className="text-xs text-zinc-400 font-sans ml-0.5 font-bold uppercase">Ч.</span>
                          </div>
                        </div>
                      </div>
                      
                      {member.steamId && (
                        <a 
                          href={`https://steamcommunity.com/profiles/${member.steamId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-600 hover:text-white transition-colors"
                          title="Steam Профиль"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Joined Date Footer */}
                  <div className="px-6 py-3 bg-coal-dark/30 border-t border-zinc-800/60 flex items-center justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                    <span>В RISEN SQUAD С:</span>
                    <span className="text-zinc-400">{new Date(member.joinedDate).toLocaleDateString('ru-RU')}</span>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
