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
  primary: 'bg-[#4A1F4F] hover:bg-[#622865] text-white border border-transparent shadow-sm shadow-[#4A1F4F]/10 hover:shadow-md transition-all active:scale-98',
  secondary: 'bg-white hover:bg-slate-50 text-[#4A1F4F] border border-[#E6E8F0] dark:border-slate-700 shadow-sm transition-all active:scale-98',
  outline: 'bg-transparent border border-[#E6E8F0] dark:border-slate-700 text-[#4A1F4F] hover:bg-[#F5EAF8] dark:hover:bg-[#4A1F4F]/20 transition-all active:scale-98',
  ghost: 'bg-transparent border border-transparent text-[#4A1F4F] hover:bg-[#F5EAF8] dark:hover:bg-[#4A1F4F]/15 transition-all',
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
