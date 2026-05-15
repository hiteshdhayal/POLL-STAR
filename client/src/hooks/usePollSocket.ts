import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ResponseNewEvent } from '../types';

export const usePollSocket = (pollId: string) => {
  const [liveData, setLiveData] = useState<ResponseNewEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!pollId) return;

    if (!socketRef.current) {
      socketRef.current = io(import.meta.env.VITE_SOCKET_URL);
    }
    
    const socket = socketRef.current;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.emit('join:poll', pollId);

    socket.on('response:new', (data: ResponseNewEvent) => {
      setLiveData(data);
    });

    socket.on('poll:published', () => {
      setIsPublished(true);
    });

    return () => {
      socket.emit('leave:poll', pollId);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('response:new');
      socket.off('poll:published');
    };
  }, [pollId]);

  return { liveData, isConnected, isPublished };
};
