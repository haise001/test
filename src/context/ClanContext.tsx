import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

export interface Member {
  id: string;
  nick: string;
  role: 'leader' | 'officer' | 'recruit';
  rankName: string;
  hours: number;
  avatar: string;
  steamId?: string;
  joinedDate: string;
  status: 'online' | 'offline' | 'in-game';
}

export interface Achievement { id: string; title: string; description: string; date: string; place: string; icon: string; }
export interface ClanEvent { id: string; title: string; type: 'tournament' | 'training' | 'recruiting' | 'match'; date: string; time: string; description: string; participants: number; }
export interface NewsPost { id: string; title: string; category: 'clan' | 'game' | 'match'; content: string; date: string; author: string; image: string; likes: number; }
export interface StatPoint { month: string; membersCount: number; totalHours: number; }

interface ClanContextType {
  members: Member[];
  achievements: Achievement[];
  events: ClanEvent[];
  news: NewsPost[];
  stats: StatPoint[];
  currentUser: Member | null;
  isAdmin: boolean;
  loginAdmin: (password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  loginWithSteam: () => void;
  logoutUser: () => void;
  addMember: (member: Omit<Member, 'id' | 'joinedDate'>) => Promise<void>;
  updateMember: (id: string, member: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  addEvent: (event: Omit<ClanEvent, 'id'>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addNews: (post: Omit<NewsPost, 'id' | 'date' | 'likes'>) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  likeNews: (id: string) => Promise<void>;
}

const ClanContext = createContext<ClanContextType | undefined>(undefined);

export const ClanProvider: React.FC<{ children: React.ReactNode; onAuthSuccess?: () => void }> = ({ children, onAuthSuccess }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [events, setEvents] = useState<ClanEvent[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [stats, setStats] = useState<StatPoint[]>([]);
  
  const [currentUser, setCurrentUser] = useState<Member | null>(() => {
    const saved = localStorage.getItem('vortex_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('vortex_admin') === 'true');

  // Получение списков реального времени из Firestore
  useEffect(() => {
    const unsubMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
      setMembers(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Member)));
    });
    const unsubNews = onSnapshot(query(collection(db, 'news'), orderBy('date', 'desc')), (snapshot) => {
      setNews(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NewsPost)));
    });
    const unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      setEvents(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ClanEvent)));
    });
    const unsubAchievements = onSnapshot(collection(db, 'achievements'), (snapshot) => {
      setAchievements(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Achievement)));
    });
    const unsubStats = onSnapshot(collection(db, 'stats'), (snapshot) => {
      setStats(snapshot.docs.map(d => ({ ...d.data() } as StatPoint)));
    });
    return () => { unsubMembers(); unsubNews(); unsubEvents(); unsubAchievements(); unsubStats(); };
  }, []);

  // Ловим успешное возвращение из Steam
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authId = params.get('auth_success_id');

    if (authId) {
      window.history.replaceState({}, document.title, window.location.pathname);

      // Читаем данные напрямую из коллекции MEMBERS
      getDoc(doc(db, 'members', authId)).then((mSnap) => {
        if (mSnap.exists()) {
          const fullMemberData = { id: mSnap.id, ...mSnap.data() } as Member;
          setCurrentUser(fullMemberData);
          localStorage.setItem('vortex_user', JSON.stringify(fullMemberData));
          
          if (onAuthSuccess) onAuthSuccess();
        }
      }).catch(err => console.error("Firestore loading member error:", err));
    }
  }, [onAuthSuccess]);

  const loginWithSteam = () => {
    window.location.href = `${window.location.origin}/.netlify/functions/steamAuth`;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('vortex_user');
  };

  const loginAdmin = async (password: string): Promise<boolean> => {
    if (password === 'vortex2026') {
      setIsAdmin(true);
      localStorage.setItem('vortex_admin', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('vortex_admin');
  };

  const addMember = async (m: Omit<Member, 'id' | 'joinedDate'>) => { await addDoc(collection(db, 'members'), { ...m, joinedDate: new Date().toISOString().split('T')[0] }); };
  const updateMember = async (id: string, fields: Partial<Member>) => { await updateDoc(doc(db, 'members', id), fields); };
  const deleteMember = async (id: string) => { await deleteDoc(doc(db, 'members', id)); };
  const addEvent = async (e: Omit<ClanEvent, 'id'>) => { await addDoc(collection(db, 'events'), e); };
  const deleteEvent = async (id: string) => { await deleteDoc(doc(db, 'events', id)); };
  const addNews = async (p: Omit<NewsPost, 'id' | 'date' | 'likes'>) => { await addDoc(collection(db, 'news'), { ...p, date: new Date().toISOString().split('T')[0], likes: 0 }); };
  const deleteNews = async (id: string) => { await deleteDoc(doc(db, 'news', id)); };
  const likeNews = async (id: string) => {
    const r = doc(db, 'news', id); const s = await getDoc(r);
    if (s.exists()) await updateDoc(r, { likes: (s.data().likes || 0) + 1 });
  };

  return (
    <ClanContext.Provider value={{
      members, achievements, events, news, stats, currentUser, isAdmin,
      loginAdmin, logoutAdmin, loginWithSteam, logoutUser,
      addMember, updateMember, deleteMember, addEvent, deleteEvent, addNews, deleteNews, likeNews
    }}>
      {children}
    </ClanContext.Provider>
  );
};

export const useClan = () => {
  const context = useContext(ClanContext);
  if (!context) throw new Error('useClan exception');
  return context;
};