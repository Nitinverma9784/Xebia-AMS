import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantClasses = {
  primary: 'bg-[#6C1D5F] hover:bg-[#4A1E47] text-white border border-transparent shadow-sm',
  secondary: 'bg-[#01AC9F] hover:bg-[#0B7F76] text-white border border-transparent shadow-sm',
  outline: 'bg-transparent border border-[#6C1D5F] text-[#6C1D5F] hover:bg-[#6C1D5F0D] dark:text-purple-300 dark:border-purple-400',
  ghost: 'bg-transparent border border-transparent text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800',
  danger: 'bg-red-500 hover:bg-red-600 text-white border border-transparent shadow-sm',
  success: 'bg-emerald-500 hover:bg-emerald-600 text-white border border-transparent shadow-sm',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm font-medium rounded-xl gap-2',
  lg: 'px-6 py-2.5 text-base font-semibold rounded-xl gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95 cursor-pointer
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin shrink-0" size={size === 'sm' ? 14 : 16} />
      ) : (
        iconPosition === 'left' && icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
      {!loading && iconPosition === 'right' && icon && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
};
