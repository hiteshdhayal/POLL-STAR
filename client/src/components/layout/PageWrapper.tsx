import React from 'react';
import { Navbar } from './Navbar';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  noNavbar?: boolean;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '', noNavbar }) => {
  return (
    <div className="min-h-screen bg-cream">
      {!noNavbar && <Navbar />}
      <main className={`${noNavbar ? '' : 'pt-16'} ${className}`}>
        {children}
      </main>
    </div>
  );
};
