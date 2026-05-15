import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../api/auth.api';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <PageWrapper noNavbar>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full space-y-8 animate-fade-up">
            <span className="text-8xl text-crimson opacity-20 font-serif leading-none block">観</span>
            <div className="space-y-4">
              <h2 className="font-display text-4xl text-charcoal">Verify your email.</h2>
              <p className="text-muted leading-relaxed">
                We've sent a verification link to your inbox. Please click the link to activate your account.
              </p>
            </div>
            <div className="pt-8">
              <Link to="/login">
                <Button variant="ghost">Return to Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper noNavbar>
      <div className="min-h-screen flex">
        {/* Left Side - Hero Content */}
        <div className="hidden lg:flex lg:w-1/2 bg-crimson p-20 flex-col justify-between items-start text-cream relative overflow-hidden">
          <Link to="/" className="flex flex-col leading-none z-10 group">
            <span className="font-display text-2xl font-bold tracking-tight text-white group-hover:opacity-80 transition-opacity">
              POLL—STAR
            </span>
            <span className="text-[10px] tracking-[0.4em] text-white/60 uppercase">投票 · HOSHI</span>
          </Link>

          <div className="z-10 space-y-6">
            <h1 className="font-display text-7xl leading-[0.9] italic animate-fade-up text-white">
              Join the<br />conversation.
            </h1>
            <p className="text-white/70 max-w-sm text-lg animate-fade-up animation-delay-200">
              Create an account to build your own polls and gather meaningful insights.
            </p>
          </div>

          <div className="z-10 text-[10px] uppercase tracking-widest text-white/60 font-bold animate-fade-up animation-delay-400">
            CHAPTER 03 — THE SHARED EXPERIENCE
          </div>

          {/* Abstract decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 text-[300px] font-serif leading-none select-none text-white">大</div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12">
          <div className="max-w-md w-full mx-auto space-y-12">
            <div className="space-y-4">
              <h2 className="font-display text-4xl text-charcoal">Register</h2>
              <p className="text-muted text-sm">Fill in your details to get started.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs uppercase tracking-widest font-semibold">
                  {error}
                </div>
              )}
              
              <Input
                label="Full Name"
                placeholder="Jane Doe"
                {...register('name')}
                error={errors.name?.message}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                error={errors.email?.message}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />

              <Button type="submit" className="w-full" loading={isLoading}>
                Create Account →
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-cream px-4 text-muted font-bold">Or</span>
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-3 !bg-white"
              onClick={() => authApi.googleLogin()}
              type="button"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            <p className="text-center text-xs text-muted uppercase tracking-widest">
              Already have an account?{' '}
              <Link to="/login" className="text-charcoal font-bold hover:text-crimson transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default RegisterPage;
