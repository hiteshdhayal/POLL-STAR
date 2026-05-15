import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth.api';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const completeLogin = async () => {
      try {
        // Fetch the user session to update Zustand store
        const { data } = await authApi.me();
        if (data.success && data.user) {
          setAuth(data.user);
        }
      } catch (err) {
        console.error('Failed to fetch auth state during OAuth callback', err);
      } finally {
        // Always navigate to dashboard as requested
        navigate('/dashboard');
      }
    };

    completeLogin();
  }, [navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="space-y-4 text-center">
        <h2 className="font-display text-3xl text-charcoal">Signing you in...</h2>
      </div>
    </div>
  );
}
