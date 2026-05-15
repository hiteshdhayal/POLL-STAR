import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token: accessToken },
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [accessToken]);

  return socketRef.current;
};
