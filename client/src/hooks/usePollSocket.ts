import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import type { ResponseNewEvent } from '../types';

export const usePollSocket = (pollId: string) => {
  const [liveData, setLiveData] = useState<ResponseNewEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!pollId) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.emit('join:poll', pollId);

    socket.on('response:new', (data: ResponseNewEvent) => {
      setLiveData(data);
    });

    socket.on('poll:published', () => {
      window.location.reload();
    });

    return () => {
      socket.emit('leave:poll', pollId);
      socket.disconnect();
    };
  }, [pollId]);

  return { liveData, isConnected };
};
