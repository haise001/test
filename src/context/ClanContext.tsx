import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, onSnapshot, addDoc, updateDoc, 
  deleteDoc, doc, query, orderBy, getDoc 
} from 'firebase/firestore';
import { 
  onAuthStateChanged, signOut
} from 'firebase/auth';

// Проверка окружения
const isLocalhost = () => {
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
};

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
}

const ClanContext = createContext<ClanContextType | undefined>(undefined);

// Ключ для хранения Steam-сессии
const STEAM_USER_KEY = 'current_steam_user';

/** Читает Steam-юзера из localStorage, нормализует ключ */
const loadSteamUserFromStorage = (): SteamUser | null => {
  try {
    const raw = localStorage.getItem(STEAM_USER_KEY) || localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Нормализуем: всегда пишем в правильный ключ
    localStorage.setItem(STEAM_USER_KEY, JSON.stringify(parsed));
    localStorage.removeItem('user');
    return parsed as SteamUser;
  } catch {
    return null;
  }
};

export const ClanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [events, setEvents] = useState<ClanEvent[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [stats, setStats] = useState<StatPoint[]>([]);
  const [currentUser, setCurrentUser] = useState<SteamUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  /**
   * Флаг — был ли Steam-пользователь установлен через checkSteamCallback.
   * Используем ref, чтобы onAuthStateChanged мог его прочитать без устаревшего замыкания.
   */
  const steamUserSetRef = useRef(false);

  // Firestore Real-time Listeners
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

  // Проверяем Steam-сессию ДО подписки на Firebase Auth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('steam_auth') === 'success') {
      // Вернулись со Steam — берём данные из localStorage
      const storedData = localStorage.getItem('user') || localStorage.getItem(STEAM_USER_KEY);
      if (storedData) {
        try {
          const userPayload = JSON.parse(storedData) as SteamUser;
          setCurrentUser(userPayload);
          steamUserSetRef.current = true;
          localStorage.setItem(STEAM_USER_KEY, JSON.stringify(userPayload));
          localStorage.removeItem('user');
          // Убираем ?steam_auth=success из адресной строки
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
          console.error('Failed to parse steam auth data', e);
        }
      }
    } else {
      // Обычный заход — восстанавливаем сохранённую сессию
      const savedUser = loadSteamUserFromStorage();
      if (savedUser) {
        setCurrentUser(savedUser);
        steamUserSetRef.current = true;
      }
    }
  }, []);

  // Синхронизация Firebase Auth (для админа и Firebase-пользователей)
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
            steamUserSetRef.current = true;
          }
        }
      } else {
        // Firebase вернул null — НЕ сбрасываем Steam-юзера!
        // Если Steam-сессия уже установлена (через localStorage), оставляем её.
        if (steamUserSetRef.current) {
          // Steam-юзер уже восстановлен — ничего не делаем
          return;
        }
        // Последняя попытка: вдруг localStorage обновился позже
        const savedUser = loadSteamUserFromStorage();
        if (savedUser) {
          setCurrentUser(savedUser);
          steamUserSetRef.current = true;
        } else {
          setCurrentUser(null);
          setIsAdmin(false);
        }
      }
    });
    return unsubAuth;
  }, []);

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

  // Кнопка авторизации Steam (Редирект на функцию Netlify)
  const loginWithSteam = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    try {
      const targetUrl = `${window.location.origin}/.netlify/functions/steamAuth`;
      window.location.href = targetUrl;
    } catch (error) {
      console.error("Ошибка при перенаправлении в Steam:", error);
      setIsLoggingIn(false);
    }
  };

  const logoutUser = async () => {
    setCurrentUser(null);
    steamUserSetRef.current = false;
    localStorage.removeItem(STEAM_USER_KEY);
    localStorage.removeItem('user');
    await signOut(auth);
  };

  // CRUD для Участников клана
  const addMember = async (newMember: Omit<Member, 'id' | 'joinedDate'>) => {
    await addDoc(collection(db, 'members'), {
      ...newMember,
      joinedDate: new Date().toISOString().split('T')[0]
    });
  };

  const updateMember = async (id: string, fields: Partial<Member>) => {
    await updateDoc(doc(db, 'members', id), fields);
  };

  const deleteMember = async (id: string) => {
    await deleteDoc(doc(db, 'members', id));
  };

  // CRUD для Ивентов
  const addEvent = async (event: Omit<ClanEvent, 'id'>) => {
    await addDoc(collection(db, 'events'), event);
  };

  const deleteEvent = async (id: string) => {
    await deleteDoc(doc(db, 'events', id));
  };

  // CRUD для Новостей
  const addNews = async (post: Omit<NewsPost, 'id' | 'date' | 'likes'>) => {
    await addDoc(collection(db, 'news'), {
      ...post,
      date: new Date().toISOString().split('T')[0],
      likes: 0
    });
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