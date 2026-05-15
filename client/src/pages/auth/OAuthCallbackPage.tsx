import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth.api';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Loader2 } from 'lucide-react';

const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (!accessToken || !refreshToken) {
      navigate('/login?error=oauth_failed');
      return;
    }

    const finalizeAuth = async () => {
      try {
        // Temporary set auth to fetch 'me'
        useAuthStore.setState({ accessToken, refreshToken });
        
        const { data } = await authApi.me();
        if (data.success) {
          setAuth(data.user, accessToken, refreshToken);
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
  }, [searchParams, navigate, setAuth]);

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
