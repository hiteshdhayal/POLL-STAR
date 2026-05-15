import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PlusCircle, BarChart2, LogOut, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-cream/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex flex-col leading-none group">
          <span className="font-display text-xl font-bold text-charcoal tracking-tight group-hover:text-crimson transition-colors">
            POLL—STAR
          </span>
          <span className="text-[9px] tracking-[0.3em] text-muted uppercase">投票 · HOSHI</span>
        </Link>

        {/* Nav Actions */}
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link
                to="/polls/create"
                className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal hover:text-crimson transition-colors font-semibold"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">New Poll</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal hover:text-crimson transition-colors font-semibold"
              >
                <BarChart2 className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <div className="w-7 h-7 rounded-full bg-crimson/10 border border-crimson/20 flex items-center justify-center">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-crimson" />
                    )}
                  </div>
                  <span className="hidden md:inline text-xs font-medium text-charcoal">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-muted hover:text-crimson transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="btn-primary px-6 py-2 text-[10px]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
