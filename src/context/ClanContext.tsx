import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, onSnapshot, addDoc, updateDoc, 
  deleteDoc, doc, query, orderBy, getDoc 
} from 'firebase/firestore';
import { 
  onAuthStateChanged, signOut
} from 'firebase/auth';

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

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  place: string;
  icon: string;
}

export interface ClanEvent {
  id: string;
  title: string;
  type: 'tournament' | 'training' | 'recruiting' | 'match';
  date: string;
  time: string;
  description: string;
  participants: number;
}

export interface NewsPost {
  id: string;
  title: string;
  category: 'clan' | 'game' | 'match';
  content: string;
  date: string;
  author: string;
  image: string;
  likes: number;
}

export interface StatPoint {
  month: string;
  membersCount: number;
  totalHours: number;
}

export interface SteamUser {
  uid: string;
  displayName: string;
  photoURL: string;
  squadHours: number;
  steamId: string;
}

interface ClanContextType {
  members: Member[];
  achievements: Achievement[];
  events: ClanEvent[];
  news: NewsPost[];
  stats: StatPoint[];
  
  addMember: (member: Omit<Member, 'id' | 'joinedDate'>) => Promise<void>;
  updateMember: (id: string, member: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  
  addEvent: (event: Omit<ClanEvent, 'id'>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  addNews: (post: Omit<NewsPost, 'id' | 'date' | 'likes'>) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  likeNews: (id: string) => Promise<void>;
  
  isAdmin: boolean;
  loginAdmin: (password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  
  currentUser: SteamUser | null;
  isLoggingIn: boolean;
  loginWithSteam: (e?: React.MouseEvent) => Promise<void>;
  logoutUser: () => Promise<void>;
  onAuthSuccess?: () => void; 
}

const ClanContext = createContext<ClanContextType | undefined>(undefined);

const getInitialUser = (): SteamUser | null => {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  const authStatus = params.get('steam_auth');
  const base64Data = params.get('data');
  
  if (authStatus === 'success' && base64Data) {
    try {
      const decodedJson = decodeURIComponent(
        atob(base64Data.replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const userPayload = JSON.parse(decodedJson);
      localStorage.setItem('current_steam_user', decodedJson);
      return userPayload;
    } catch (e) {
      console.error('Ошибка парсинга URL:', e);
    }
  }
  
  const savedUser = localStorage.getItem('current_steam_user');
  if (savedUser) {
    try {
      return JSON.parse(savedUser);
    } catch (e) {
      localStorage.removeItem('current_steam_user');
    }
  }
  return null;
};

export const ClanProvider: React.FC<{ children: React.ReactNode, onAuthSuccess?: () => void }> = ({ children, onAuthSuccess }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [events, setEvents] = useState<ClanEvent[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [stats, setStats] = useState<StatPoint[]>([]);
  
  const [currentUser, setCurrentUser] = useState<SteamUser | null>(() => getInitialUser());
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Очистка URL после успешной синхронизации стейта
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('steam_auth') === 'success') {
      window.history.replaceState({}, document.title, window.location.pathname);
      if (onAuthSuccess) {
        onAuthSuccess();
      }
    }
  }, [onAuthSuccess]);

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
    return () => {
      unsubMembers(); unsubNews(); unsubEvents(); unsubAchievements(); unsubStats();
    };
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.email === 'admin@risensquad.ru') {
          setIsAdmin(true);
        } else {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setCurrentUser({
              uid: user.uid,
              displayName: data.displayName || user.displayName || 'Unknown',
              photoURL: data.photoURL || user.photoURL || '',
              squadHours: data.squadHours || 0,
              steamId: data.steamId || ''
            });
          }
        }
      } else {
        const savedUser = localStorage.getItem('current_steam_user');
        if (!savedUser && !currentUser) {
          setCurrentUser(null);
          setIsAdmin(false);
        }
      }
    });
    return unsubAuth;
  }, [currentUser]);

  const loginAdmin = async (password: string): Promise<boolean> => {
    if (password === 'vortex2026') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    signOut(auth);
  };

  const loginWithSteam = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      window.location.href = `${window.location.origin}/.netlify/functions/steamAuth`;
    } catch (error) {
      console.error("Steam redirect error:", error);
      setIsLoggingIn(false);
    }
  };

  const logoutUser = async () => {
    setCurrentUser(null);
    localStorage.removeItem('current_steam_user');
    await signOut(auth);
  };

  const addMember = async (newMember: Omit<Member, 'id' | 'joinedDate'>) => {
    await addDoc(collection(db, 'members'), { ...newMember, joinedDate: new Date().toISOString().split('T')[0] });
  };
  const updateMember = async (id: string, fields: Partial<Member>) => {
    await updateDoc(doc(db, 'members', id), fields);
  };
  const deleteMember = async (id: string) => {
    await deleteDoc(doc(db, 'members', id));
  };
  const addEvent = async (event: Omit<ClanEvent, 'id'>) => {
    await addDoc(collection(db, 'events'), event);
  };
  const deleteEvent = async (id: string) => {
    await deleteDoc(doc(db, 'events', id));
  };
  const addNews = async (post: Omit<NewsPost, 'id' | 'date' | 'likes'>) => {
    await addDoc(collection(db, 'news'), { ...post, date: new Date().toISOString().split('T')[0], likes: 0 });
  };
  const deleteNews = async (id: string) => {
    await deleteDoc(doc(db, 'news', id));
  };
  const likeNews = async (id: string) => {
    const postRef = doc(db, 'news', id);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      await updateDoc(postRef, { likes: (postSnap.data().likes || 0) + 1 });
    }
  };

  return (
    <ClanContext.Provider value={{
      members, achievements, events, news, stats,
      addMember, updateMember, deleteMember,
      addEvent, deleteEvent,
      addNews, deleteNews, likeNews,
      isAdmin, loginAdmin, logoutAdmin,
      currentUser, isLoggingIn, loginWithSteam, logoutUser
    }}>
      {children}
    </ClanContext.Provider>
  );
};

export const useClan = () => {
  const context = useContext(ClanContext);
  if (!context) throw new Error('useClan must be used within a ClanProvider');
  return context;
};