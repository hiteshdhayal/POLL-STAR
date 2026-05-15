import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/prisma';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string; name: string };
    }
  }
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return next(new AppError('No token provided', 401));
  }
  
  try {
    const { userId } = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    if (!user) return next(new AppError('User not found', 401));
    req.user = user;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
};

// Does NOT throw — just attaches user if token exists
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  
  try {
    const { userId } = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    if (user) req.user = user;
  } catch {
    // Silently ignore invalid tokens for optional auth
  }
  next();
};
