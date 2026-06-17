import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';

export interface SteamUser {
  uid: string;
  displayName: string;
  photoURL: string;
  steamId: string;
}

interface ClanContextType {
  currentUser: SteamUser | null;
  loginWithSteam: () => void;
  logoutUser: () => void;
  members: any[];
}

const ClanContext = createContext<ClanContextType | undefined>(undefined);

export const ClanProvider: React.FC<{ children: React.ReactNode; onAuthSuccess?: () => void }> = ({ children, onAuthSuccess }) => {
  const [currentUser, setCurrentUser] = useState<SteamUser | null>(() => {
    const saved = localStorage.getItem('vortex_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [members, setMembers] = useState<any[]>([]);

  // 1. Слушаем коллекцию мемберов (стандарт)
  useEffect(() => {
    return onSnapshot(collection(db, 'members'), (snapshot) => {
      setMembers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  // 2. Ловим возврат из Steam прямо при старте контекста
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authId = params.get('auth_success_id');

    if (authId) {
      // Чистим URL сразу, чтобы при обновлении страницы код не срабатывал повторно
      window.history.replaceState({}, document.title, window.location.pathname);

      // Идем в Firestore за свежими данными юзера
      getDoc(doc(db, 'users', authId)).then((userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data() as SteamUser;
          setCurrentUser(userData);
          localStorage.setItem('vortex_user', JSON.stringify(userData));
          
          // Триггерим переключение вкладки на профиль
          if (onAuthSuccess) onAuthSuccess();
        }
      }).catch(err => console.error("Ошибка получения юзера:", err));
    }
  }, [onAuthSuccess]);

  const loginWithSteam = () => {
    window.location.href = `${window.location.origin}/.netlify/functions/steamAuth`;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('vortex_user');
  };

  return (
    <ClanContext.Provider value={{ currentUser, loginWithSteam, logoutUser, members }}>
      {children}
    </ClanContext.Provider>
  );
};

export const useClan = () => {
  const context = useContext(ClanContext);
  if (!context) throw new Error('useClan error');
  return context;
};