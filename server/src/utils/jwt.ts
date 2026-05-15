import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const generateAccessToken = (userId: string) =>
  jwt.sign({ userId, type: 'access' }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

export const generateRefreshToken = (userId: string) =>
  jwt.sign({ userId, type: 'refresh' }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

export const verifyAccessToken = (token: string) => {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string; type: string };
  if (payload.type !== 'access') throw new Error('Invalid token type');
  return payload;
};

export const verifyRefreshToken = (token: string) => {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string; type: string };
  if (payload.type !== 'refresh') throw new Error('Invalid token type');
  return payload;
};
