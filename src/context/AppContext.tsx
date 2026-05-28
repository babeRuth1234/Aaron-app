import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../api/client';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  roomId: string | null;
  setRoomId: (id: string | null) => void;
  role: 'admin' | 'member' | null;
  setRole: (role: 'admin' | 'member' | null) => void;
  socket: Socket | null;
  isReady: boolean;
}

export const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},
  roomId: null,
  setRoomId: () => {},
  role: null,
  setRole: () => {},
  socket: null,
  isReady: false,
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [roomId, setRoomIdState] = useState<string | null>(null);
  const [role, setRoleState] = useState<'admin' | 'member' | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedRoomId = await AsyncStorage.getItem('roomId');
        const storedRole = await AsyncStorage.getItem('role');
        
        if (storedUser) setUserState(JSON.parse(storedUser));
        if (storedRoomId) setRoomIdState(storedRoomId);
        if (storedRole) setRoleState(storedRole as 'admin' | 'member');
      } catch (e) {
        console.error("Failed to load auth data", e);
      } finally {
        setIsReady(true);
      }
    };
    loadStorage();
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) AsyncStorage.setItem('user', JSON.stringify(newUser));
    else AsyncStorage.removeItem('user');
  };

  const setRoomId = (newRoomId: string | null) => {
    setRoomIdState(newRoomId);
    if (newRoomId) AsyncStorage.setItem('roomId', newRoomId);
    else AsyncStorage.removeItem('roomId');
  };

  const setRole = (newRole: 'admin' | 'member' | null) => {
    setRoleState(newRole);
    if (newRole) AsyncStorage.setItem('role', newRole);
    else AsyncStorage.removeItem('role');
  };

  // Handle Socket Connection
  useEffect(() => {
    if (user && roomId) {
      // Connect to the base URL (strip /api)
      const socketUrl = API_URL.replace('/api', '');
      const newSocket = io(socketUrl);
      
      newSocket.on('connect', () => {
        newSocket.emit('join_room_channel', roomId);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) socket.disconnect();
      setSocket(null);
    }
  }, [user?.id, roomId]);

  return (
    <AppContext.Provider value={{ user, setUser, roomId, setRoomId, role, setRole, socket, isReady }}>
      {children}
    </AppContext.Provider>
  );
};
