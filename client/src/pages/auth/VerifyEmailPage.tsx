import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setError('Missing verification token.');
      return;
    }

    if (verificationAttempted.current) return;
    verificationAttempted.current = true;

    const verify = async () => {
      try {
        const { data } = await authApi.verifyEmail(token);
        if (data.success) {
          setAuth(data.user, data.accessToken, data.refreshToken);
          setStatus('success');
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      } catch (err: any) {
        setStatus('error');
        setError(err.response?.data?.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [searchParams, navigate, setAuth]);

  return (
    <PageWrapper noNavbar>
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 animate-fade-up">
          {status === 'loading' && (
            <div className="space-y-6">
              <Loader2 className="w-12 h-12 text-crimson animate-spin mx-auto" />
              <h2 className="font-display text-3xl text-charcoal">Verifying your email...</h2>
              <p className="text-muted">Just a moment while we confirm your identity.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
              <h2 className="font-display text-3xl text-charcoal">Email Verified.</h2>
              <p className="text-muted">
                Your account is now active. Redirecting you to your dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <XCircle className="w-16 h-16 text-crimson mx-auto" />
              <h2 className="font-display text-3xl text-charcoal">Verification Failed.</h2>
              <p className="text-muted">{error}</p>
              <div className="pt-4">
                <Button onClick={() => navigate('/login')} variant="secondary">
                  Go to Login
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default VerifyEmailPage;
