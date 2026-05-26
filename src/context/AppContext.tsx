import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../api/client';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  roomId: string | null;
  setRoomId: (id: string | null) => void;
  role: 'admin' | 'member' | null;
  setRole: (role: 'admin' | 'member' | null) => void;
  socket: Socket | null;
}

export const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},
  roomId: null,
  setRoomId: () => {},
  role: null,
  setRole: () => {},
  socket: null,
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [role, setRole] = useState<'admin' | 'member' | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

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
    <AppContext.Provider value={{ user, setUser, roomId, setRoomId, role, setRole, socket }}>
      {children}
    </AppContext.Provider>
  );
};
