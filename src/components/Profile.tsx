import React, { useState } from 'react';
import { useClan, Member } from '../context/ClanContext';
import { User, Clock, ShieldCheck, Award, Medal, LogOut, Edit3, Save, X, ExternalLink } from 'lucide-react';

const getTierByHours = (hours: number) => {
  if (hours >= 2000) return { label: 'Ветеран', icon: '🏆', color: 'text-yellow-500', desc: 'Легенда RISEN SQUAD' };
  if (hours >= 1000) return { label: 'Бывалый', icon: '🥈', color: 'text-zinc-300', desc: 'Опытный боец' };
  if (hours >= 500) return { label: 'Основной состав', icon: '🔰', color: 'text-purple-bright', desc: 'Проверенный солдат' };
  if (hours >= 200) return { label: 'Стажёр', icon: '📖', color: 'text-blue-400', desc: 'Набирается опыта' };
  return { label: 'Новобранец', icon: '🌱', color: 'text-green-400', desc: 'Только с учебки' };
};

const getRoleIcon = (role: Member['role']) => {
  switch (role) {
    case 'leader': return '👑';
    case 'officer': return '⭐';
    case 'recruit': return '🎖️';
  }
};

export const Profile: React.FC = () => {
  const { currentUser, members, updateMember, logoutUser } = useClan();
  const [isEditing, setIsEditing] = useState(false);
  const [editRankName, setEditRankName] = useState('');

  // Найти себя в составе клана
  const myProfile = members.find(m => m.steamId === currentUser?.steamId) || 
                    (currentUser ? {
                      id: 'temp',
                      nick: currentUser.displayName,
                      role: 'recruit' as Member['role'],
                      rankName: 'Private',
                      hours: currentUser.squadHours,
                      avatar: currentUser.photoURL,
                      steamId: currentUser.steamId,
                      joinedDate: 'Сегодня',
                      status: 'online' as Member['status']
                    } : null);

  const tier = myProfile ? getTierByHours(myProfile.hours) : null;

  if (!currentUser || !myProfile) {
    return (
      <div className="py-20 min-h-screen flex items-center justify-center bg-coal-dark px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-purple-primary/10 border border-purple-primary/30 rounded-full flex items-center justify-center text-purple-bright mx-auto mb-6">
            <User className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-wider gamer-font">Личный кабинет</h2>
          <p className="text-zinc-400 mb-8">Войди через Steam, чтобы увидеть свой профиль.</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!myProfile) return;
    await updateMember(myProfile.id, {
      rankName: editRankName || myProfile.rankName
    });
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditRankName(myProfile.rankName);
    setIsEditing(true);
  };

  return (
    <div className="py-12 bg-coal-dark min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Шапка профиля */}
        <div className="text-center md:text-left mb-10 border-b border-zinc-900 pb-6">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 uppercase tracking-tighter gamer-font">
            ЛИЧНЫЙ КАБИНЕТ
          </h1>
          <p className="text-zinc-400">Профиль бойца RISEN SQUAD</p>
        </div>

        {/* Карточка профиля */}
        <div className="bg-coal-medium border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Hero секция с аватаром */}
          <div className="relative bg-gradient-to-r from-purple-primary/20 via-coal-medium to-purple-primary/10 p-8 pb-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-primary/5 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-purple-primary/60 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <h2 className="text-3xl font-black text-white tracking-wide">
                    {currentUser.displayName}
                  </h2>
                  {tier && <span className="text-3xl">{tier.icon}</span>}
                </div>
                <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                  <span className="text-sm text-zinc-400 font-medium">{myProfile.rankName}</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-sm text-zinc-400 font-medium">{getRoleIcon(myProfile.role)} {
                    myProfile.role === 'leader' ? 'Лидер' :
                    myProfile.role === 'officer' ? 'Офицер' : 'Рядовой'
                  }</span>
                </div>
                {tier && (
                  <div className="mt-2">
                    <span className={`text-xs font-bold uppercase tracking-widest ${tier.color}`}>
                      {tier.label} — {tier.desc}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800/60">
            <div className="bg-coal-medium p-6 text-center">
              <Clock className="w-6 h-6 text-purple-bright mx-auto mb-2" />
              <div className="text-3xl font-black text-white font-mono">{myProfile.hours}</div>
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Часов в Squad</div>
            </div>
            <div className="bg-coal-medium p-6 text-center">
              <Award className="w-6 h-6 text-purple-bright mx-auto mb-2" />
              <div className="text-3xl font-black text-white font-mono">{tier?.label || 'Нет'}</div>
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Звание</div>
            </div>
            <div className="bg-coal-medium p-6 text-center">
              <ShieldCheck className="w-6 h-6 text-purple-bright mx-auto mb-2" />
              <div className="text-3xl font-black text-white font-mono">{myProfile.joinedDate}</div>
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">В клане с</div>
            </div>
          </div>
        </div>

        {/* Редактирование профиля */}
        <div className="mt-8 bg-coal-medium border border-zinc-800/80 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-purple-bright" />
              <span>Настройки профиля</span>
            </h3>
            {!isEditing ? (
              <button onClick={startEditing} className="text-purple-bright hover:text-white text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-1">
                <Edit3 className="w-4 h-4" />
                Редактировать
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={handleSave} className="text-green-500 hover:text-white text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-1">
                  <Save className="w-4 h-4" />
                  Сохранить
                </button>
                <button onClick={() => setIsEditing(false)} className="text-zinc-500 hover:text-white text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-1">
                  <X className="w-4 h-4" />
                  Отмена
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4 max-w-lg">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Специализация (роль в Squad)</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editRankName}
                  onChange={(e) => setEditRankName(e.target.value)}
                  className="w-full bg-coal-dark border border-zinc-800 rounded px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-primary"
                  placeholder="Medic / SL / LAT / Marksman"
                />
              ) : (
                <div className="text-white font-bold text-lg">{myProfile.rankName}</div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Steam ID</label>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-sm">{currentUser.steamId}</span>
                <a
                  href={`https://steamcommunity.com/profiles/${currentUser.steamId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-bright hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Достижения / прогрессия */}
        <div className="mt-8 bg-coal-medium border border-zinc-800/80 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-6">
            <Medal className="w-5 h-5 text-purple-bright" />
            <span>Прогрессия</span>
          </h3>
          
          <div className="space-y-4">
            {[
              { hours: 2000, label: 'Ветеран', icon: '🏆', progress: Math.min(100, (myProfile.hours / 2000) * 100) },
              { hours: 1000, label: 'Бывалый', icon: '🥈', progress: Math.min(100, (myProfile.hours / 1000) * 100) },
              { hours: 500, label: 'Основной состав', icon: '🔰', progress: Math.min(100, (myProfile.hours / 500) * 100) },
              { hours: 200, label: 'Стажёр', icon: '📖', progress: Math.min(100, (myProfile.hours / 200) * 100) },
            ].map((tier) => (
              <div key={tier.hours} className="relative">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-zinc-400 font-semibold">{tier.icon} {tier.label}</span>
                  <span className="text-zinc-500 font-mono text-xs">{tier.hours} ч.</span>
                </div>
                <div className="w-full h-2 bg-coal-dark rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      tier.progress >= 100 ? 'bg-green-500 shadow-[0_0_6px_#22c55e]' : 'bg-purple-primary'
                    }`}
                    style={{ width: `${tier.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Выход */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={logoutUser}
            className="flex items-center gap-2 text-zinc-500 hover:text-red-400 font-bold text-xs uppercase tracking-widest transition-colors px-4 py-2 border border-zinc-800 hover:border-red-500/30 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  );
};
