import React, { useState } from 'react';
import { useClan, Member } from '../context/ClanContext';
import { 
  ShieldCheck, Lock, Users, 
  Plus, Trash2, Edit2, CheckCircle
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { 
    isAdmin, loginAdmin, logoutAdmin, members,
    addMember, deleteMember, updateMember
  } = useClan();

  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [memberForm, setMemberForm] = useState({
    nick: '',
    role: 'recruit' as Member['role'],
    rankName: 'Rifleman',
    hours: 500,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    steamId: '',
    status: 'online' as Member['status']
  });

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editHours, setEditHours] = useState<number>(500);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(false);
    const success = await loginAdmin(password);
    setIsLoggingIn(false);
    if (!success) setLoginError(true);
    else setPassword('');
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.nick.trim()) return;
    await addMember(memberForm);
    setMemberForm({
      nick: '', role: 'recruit', rankName: 'Rifleman', hours: 500,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      steamId: '', status: 'online'
    });
    triggerSuccess('Боец добавлен!');
  };

  const handleUpdateMemberHours = async (id: string) => {
    await updateMember(id, { hours: editHours });
    setEditingMemberId(null);
    triggerSuccess('Часы обновлены!');
  };

  if (!isAdmin) {
    return (
      <div className="py-20 min-h-screen flex items-center justify-center bg-coal-dark px-4">
        <div className="max-w-md w-full bg-coal-medium border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-primary/10 rounded-full blur-2xl" />
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-purple-primary/15 border border-purple-primary/40 rounded-full flex items-center justify-center text-purple-bright mx-auto mb-4 glow-purple">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-wider gamer-font">Штаб RISEN SQUAD</h1>
            <p className="text-zinc-500 text-sm mt-1">Требуется авторизация командира.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full bg-coal-dark border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-purple-primary text-sm font-mono"
              required
            />
            {loginError && <div className="text-red-400 text-xs text-center font-bold">Неверный пароль.</div>}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-purple-primary hover:bg-purple-bright text-white font-bold py-3.5 rounded font-sans uppercase tracking-wider text-xs transition-all glow-purple"
            >
              {isLoggingIn ? 'ПРОВЕРКА...' : 'ВОЙТИ'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-coal-dark min-h-screen">
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-coal-card border-2 border-green-500 text-white px-5 py-4 rounded-xl shadow-lg flex items-center space-x-3 animate-bounce">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-6 mb-8">
          <h1 className="text-4xl font-black text-white flex items-center space-x-3">
            <ShieldCheck className="w-9 h-9 text-purple-bright" />
            <span>УПРАВЛЕНИЕ ОТРЯДОМ</span>
          </h1>
          <button onClick={logoutAdmin} className="w-full md:w-auto px-4 py-2 border border-zinc-800 text-zinc-500 hover:text-red-400 rounded font-semibold text-xs uppercase tracking-widest transition-all">
            Выйти
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-2">
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold text-xs uppercase tracking-wider text-left bg-purple-primary text-white">
              <Users className="w-4 h-4" />
              <span>Личный состав</span>
            </button>
          </div>

          <div className="lg:col-span-9 bg-coal-medium border border-zinc-800 rounded-xl p-6 shadow-xl">
            <div className="space-y-10">
              <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h3 className="col-span-2 text-xl font-bold text-white border-b border-zinc-800 pb-2 flex items-center space-x-2 uppercase">
                  <Plus className="w-5 h-5 text-purple-bright" />
                  <span>Добавить бойца</span>
                </h3>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Позывной</label>
                  <input
                    type="text"
                    value={memberForm.nick}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, nick: e.target.value }))}
                    className="w-full bg-coal-dark border border-zinc-800 rounded px-3 py-2 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Налет (часы)</label>
                  <input
                    type="number"
                    value={memberForm.hours}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-coal-dark border border-zinc-800 rounded px-3 py-2 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Ранг / Роль</label>
                  <input
                    type="text"
                    value={memberForm.rankName}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, rankName: e.target.value }))}
                    className="w-full bg-coal-dark border border-zinc-800 rounded px-3 py-2 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Роль в клане</label>
                  <select
                    value={memberForm.role}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full bg-coal-dark border border-zinc-800 rounded px-3 py-2 text-white text-sm"
                  >
                    <option value="recruit">Рядовой</option>
                    <option value="officer">Офицер / SL</option>
                    <option value="leader">Лидер</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-purple-primary text-white font-bold px-6 py-2.5 rounded text-xs uppercase tracking-wider hover:bg-purple-bright transition-all col-span-2"
                >
                  Вписать в базу
                </button>
              </form>

              <div className="overflow-x-auto border border-zinc-800 rounded-lg bg-coal-dark/30">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-coal-dark/80 text-zinc-500 text-[10px] uppercase font-bold border-b border-zinc-800">
                      <th className="p-3">Боец</th>
                      <th className="p-3">Роль</th>
                      <th className="p-3">Часы</th>
                      <th className="p-3 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-coal-medium/20">
                        <td className="p-3 font-bold text-white flex items-center space-x-2">
                          <img src={member.avatar} className="w-6 h-6 rounded-full object-cover border border-zinc-800" alt="" />
                          <span>{member.nick}</span>
                        </td>
                        <td className="p-3 text-[10px] text-zinc-400 uppercase font-bold">{member.role}</td>
                        <td className="p-3">
                          {editingMemberId === member.id ? (
                            <input
                              type="number"
                              value={editHours}
                              onChange={(e) => setEditHours(parseInt(e.target.value) || 0)}
                              className="w-20 bg-coal-dark border border-zinc-700 rounded text-center text-white"
                            />
                          ) : (
                            <span className="font-mono text-white">{member.hours} ч.</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {editingMemberId === member.id ? (
                            <button onClick={() => handleUpdateMemberHours(member.id)} className="text-xs text-green-400 font-bold px-2 underline">
                              ОК
                            </button>
                          ) : (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => { setEditingMemberId(member.id); setEditHours(member.hours); }}
                                className="text-zinc-500 hover:text-purple-bright"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteMember(member.id)}
                                disabled={member.role === 'leader'}
                                className="text-zinc-500 hover:text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
