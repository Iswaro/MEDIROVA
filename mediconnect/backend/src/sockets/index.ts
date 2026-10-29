import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { JwtPayload } from '../middleware/authenticate';

let io: Server | null = null;

export function initSocketIO(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: config.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // JWT Authentication middleware for Socket.IO
  io.use((socket: Socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');

    if (!token) {
      // Allow unauthenticated connection for public discovery, but restrict rooms
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as JwtPayload;
      socket.data.user = decoded;
      next();
    } catch {
      // Allow socket with warning
      logger.warn(`Socket connection with invalid token: ${socket.id}`);
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as JwtPayload | undefined;
    logger.debug(`Socket connected: ${socket.id} (user: ${user?.id || 'guest'})`);

    if (user) {
      // Auto-join personal user room
      socket.join(`user:${user.id}`);

      if (user.role === 'PATIENT') {
        socket.join(`patient:${user.id}`);
      } else if (user.role === 'PROVIDER') {
        socket.join(`provider:${user.id}`);
      } else if (user.role === 'ADMIN') {
        socket.join('admin:notifications');
      }
    }

    // Join specific booking room
    socket.on('join:booking', (bookingId: string) => {
      socket.join(`booking:${bookingId}`);
      logger.debug(`Socket ${socket.id} joined booking room: booking:${bookingId}`);
    });

    socket.on('leave:booking', (bookingId: string) => {
      socket.leave(`booking:${bookingId}`);
    });

    // Provider live location broadcast
    socket.on('provider:location_update', (data: { bookingId: string; lat: number; lng: number }) => {
      if (data.bookingId) {
        socket.to(`booking:${data.bookingId}`).emit('provider:location', {
          bookingId: data.bookingId,
          lat: data.lat,
          lng: data.lng,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Call initSocketIO first.');
  }
  return io;
}
