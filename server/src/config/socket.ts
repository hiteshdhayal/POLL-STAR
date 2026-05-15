import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from './env';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join:poll', (pollId: string) => {
      socket.join(`poll:${pollId}`);
    });

    socket.on('leave:poll', (pollId: string) => {
      socket.leave(`poll:${pollId}`);
    });

    socket.on('disconnect', () => {
      // Cleanup handled by socket.io automatically
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
