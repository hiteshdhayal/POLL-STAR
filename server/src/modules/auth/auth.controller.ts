import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  refreshSchema,
} from './auth.validators';
import * as authService from './auth.service';
import { env } from '../../config/env';

const isProd = env.NODE_ENV === 'production';

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const result = await authService.register(data);
  res.status(201).json({ success: true, message: result.message });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = verifyEmailSchema.parse(req.body);
  const result = await authService.verifyEmail(token);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.json({ success: true, user: result.user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const result = await authService.login(email, password);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.json({ success: true, user: result.user });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No refresh token' });
  }
  const result = await authService.refresh(refreshToken);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.json({ success: true });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await authService.logout(userId);
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

export const googleRedirect = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Generate CSRF state
    const state = Math.random().toString(36).substring(2);
    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000, // 10 minutes
      path: '/',
    });

    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  } catch (err) {
    console.error('GOOGLE REDIRECT ERROR:', err);
    res.redirect(`${env.CLIENT_URL}/login?error=oauth_init_failed`);
  }
});

export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const storedState = req.cookies.oauth_state;
    res.clearCookie('oauth_state');

    if (!code || !state || state !== storedState) {
      console.warn('OAuth Error: Invalid code or state mismatch');
      return res.redirect(`${env.CLIENT_URL}/login?error=oauth_failed`);
    }

    const result = await authService.googleOAuth(code as string);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    
    // Redirect cleanly without tokens in URL
    res.redirect(`${env.CLIENT_URL}/oauth-callback`);
  } catch (err) {
    console.error('GOOGLE AUTH CALLBACK ERROR:', err);
    res.redirect(`${env.CLIENT_URL}/login?error=oauth_failed`);
  }
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, user: req.user });
});
