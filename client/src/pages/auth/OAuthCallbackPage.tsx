import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth.api';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Loader2 } from 'lucide-react';

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const finalizeAuth = async () => {
      try {
        const { data } = await authApi.me();
        if (data.success && data.user) {
          setAuth(data.user);
          navigate('/dashboard');
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('OAuth finalization error:', error);
        navigate('/login?error=oauth_failed');
      }
    };

    finalizeAuth();
  }, [navigate, setAuth]);

  return (
    <PageWrapper noNavbar>
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="space-y-6 animate-fade-up">
          <Loader2 className="w-12 h-12 text-crimson animate-spin mx-auto" />
          <h2 className="font-display text-3xl text-charcoal">Authenticating...</h2>
          <p className="text-muted">Finalizing your secure sign-in with Google.</p>
        </div>
      </div>
    </PageWrapper>
  );
};

export default OAuthCallbackPage;
