import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantClasses = {
  primary: 'bg-crimson text-white hover:bg-crimson-dark active:scale-95 disabled:bg-crimson/50',
  secondary: 'border border-crimson text-crimson hover:bg-crimson hover:text-white active:scale-95',
  ghost: 'text-charcoal hover:text-crimson underline-offset-4 hover:underline',
  danger: 'bg-red-800 text-white hover:bg-red-900 active:scale-95',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-8 py-3 text-xs',
  lg: 'px-10 py-4 text-sm',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        tracking-widest uppercase font-semibold
        transition-all duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};
