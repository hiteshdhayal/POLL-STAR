import bcrypt from 'bcrypt';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { generateEmailVerificationToken } from '../../utils/tokens';
import { sendVerificationEmail } from '../../utils/email';
import { env } from '../../config/env';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);



export const register = async (data: { name: string; email: string; password: string }) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw new AppError('Email already registered', 409);

  const passwordHash = await bcrypt.hash(data.password, 12);
  const emailVerifyToken = generateEmailVerificationToken();
  const emailVerifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 hours

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      emailVerifyToken,
      emailVerifyTokenExpiry,
      isEmailVerified: false,
    },
  });

  await sendVerificationEmail(data.email, data.name, emailVerifyToken);

  return { message: 'Verification email sent. Please check your inbox.' };
};

export const verifyEmail = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: {
      emailVerifyToken: token,
      emailVerifyTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) throw new AppError('Invalid or expired verification token', 400);

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerifyToken: null,
      emailVerifyTokenExpiry: null,
      refreshToken: refreshTokenHash,
    },
    select: { id: true, email: true, name: true, avatarUrl: true, isEmailVerified: true },
  });

  return { accessToken, refreshToken, user: updatedUser };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError('Please verify your email first', 403);
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) throw new AppError('Invalid credentials', 401);

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: refreshTokenHash },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      isEmailVerified: user.isEmailVerified,
    },
  };
};

export const googleOAuth = async (code: string) => {
  // Exchange code for tokens
  const tokenResponse = await googleClient.getToken({
    code,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
  });

  const tokens = tokenResponse.tokens;
  if (!tokens.id_token) throw new AppError('Failed to get ID token from Google', 400);

  // Verify ID token
  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw new AppError('Invalid Google token payload', 400);
  }

  const { sub: googleId, email, name = 'Google User', picture: avatarUrl } = payload;

  // Upsert user
  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
  });

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId,
        avatarUrl: avatarUrl ?? user.avatarUrl,
        isEmailVerified: true,
        name: user.name || name,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        googleId,
        email,
        name,
        avatarUrl,
        isEmailVerified: true,
      },
    });
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: refreshTokenHash },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      isEmailVerified: user.isEmailVerified,
    },
  };
};

export const refresh = async (refreshToken: string) => {
  let userId: string;
  try {
    const payload = verifyRefreshToken(refreshToken);
    userId = payload.userId;
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.refreshToken) throw new AppError('Invalid refresh token', 401);

  const tokenMatch = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!tokenMatch) throw new AppError('Invalid refresh token', 401);

  // Rotate tokens
  const newAccessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);
  const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshTokenHash },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
  return { message: 'Logged out successfully' };
};
