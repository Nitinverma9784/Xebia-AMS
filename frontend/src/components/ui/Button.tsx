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
  primary: 'bg-[#EF4444] hover:bg-[#DC2626] text-white border border-transparent shadow-sm shadow-red-500/10 hover:shadow-md transition-all active:scale-98',
  secondary: 'bg-[#1E293B] hover:bg-[#0F172A] text-white border border-transparent shadow-sm transition-all active:scale-98',
  outline: 'bg-transparent border border-[var(--brand-border)] text-[var(--text-primary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-98',
  ghost: 'bg-transparent border border-transparent text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all',
  danger: 'bg-red-500 hover:bg-red-600 text-white border border-transparent shadow-sm transition-all',
  success: 'bg-emerald-500 hover:bg-emerald-600 text-white border border-transparent shadow-sm transition-all',
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
