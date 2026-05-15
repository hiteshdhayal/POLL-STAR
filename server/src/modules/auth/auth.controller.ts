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

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const result = await authService.register(data);
  res.status(201).json({ success: true, ...result });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = verifyEmailSchema.parse(req.body);
  const result = await authService.verifyEmail(token);
  res.json({ success: true, ...result });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const result = await authService.login(email, password);
  res.json({ success: true, ...result });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = refreshSchema.parse(req.body);
  const result = await authService.refresh(refreshToken);
  res.json({ success: true, ...result });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await authService.logout(userId);
  res.json({ success: true, ...result });
});

export const googleRedirect = asyncHandler(async (_req: Request, res: Response) => {
  try {
    console.log('--- GOOGLE AUTH REDIRECT ---');
    console.log('CLIENT_ID:', env.GOOGLE_CLIENT_ID);
    console.log('REDIRECT_URI:', env.GOOGLE_REDIRECT_URI);

    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  } catch (err) {
    console.error('GOOGLE REDIRECT ERROR:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error during redirect'
    });
  }
});

export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('--- GOOGLE AUTH CALLBACK ---');
    const code = req.query.code as string;
    
    if (!code) {
      console.warn('OAuth Error: No code received in callback');
      return res.redirect(`${env.CLIENT_URL}/login?error=oauth_failed`);
    }

    const result = await authService.googleOAuth(code);
    
    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    console.log('OAuth Success: User authenticated, redirecting to client');
    res.redirect(`${env.CLIENT_URL}/oauth-callback?${params.toString()}`);
  } catch (err) {
    console.error('GOOGLE AUTH CALLBACK ERROR:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error during callback'
    });
  }
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, user: req.user });
});
