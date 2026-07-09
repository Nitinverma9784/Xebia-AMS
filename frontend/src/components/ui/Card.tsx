import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
}) => {
  const paddingMap = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };

  return (
    <div
      className={`
        bg-white dark:bg-[#1E293B]
        border border-[var(--brand-border)]
        rounded-2xl shadow-sm
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${paddingMap[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Stat Card for dashboard
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'purple' | 'teal' | 'blue' | 'amber' | 'red' | 'green';
  subtitle?: string;
}

const colorMap = {
  purple: {
    bg: 'bg-[#F5EAF8]0/10',
    text: 'text-[#4A1F4F] dark:text-purple-300',
    icon: 'bg-[#4A1F4F]',
    border: 'border-purple-200 dark:border-purple-800/30',
  },
  teal: {
    bg: 'bg-blue-500/10',
    text: 'text-[#2563EB]',
    icon: 'bg-[#2563EB]',
    border: 'border-blue-200 dark:border-teal-800/30',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    icon: 'bg-blue-500',
    border: 'border-blue-200 dark:border-blue-800/30',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    icon: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-800/30',
  },
  red: {
    bg: 'bg-[#F5EAF8]0/10',
    text: 'text-red-600 dark:text-purple-400',
    icon: 'bg-[#F5EAF8]0',
    border: 'border-purple-200 dark:border-red-800/30',
  },
  green: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: 'bg-emerald-500',
    border: 'border-emerald-200 dark:border-emerald-800/30',
  },
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'purple', subtitle }) => {
  const c = colorMap[color];
  return (
    <div className={`bg-white dark:bg-[#1E293B] border ${c.border} rounded-2xl p-5 shadow-sm card-hover`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${c.text}`}>{value}</p>
          {subtitle && <p className="text-xs text-[var(--text-secondary)] mt-1">{subtitle}</p>}
        </div>
        <div className={`${c.icon} rounded-xl p-3 text-white shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
