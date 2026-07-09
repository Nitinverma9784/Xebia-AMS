import React from 'react';

type BadgeVariant = 'draft' | 'published' | 'submitted' | 'reviewed' | 'not_submitted' | 'overdue' | 'active' | 'pending';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  size?: 'sm' | 'md';
}

const variantConfig: Record<BadgeVariant, { label: string; classes: string }> = {
  draft: {
    label: 'Draft',
    classes: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600',
  },
  published: {
    label: 'Published',
    classes: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30',
  },
  submitted: {
    label: 'Submitted',
    classes: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30',
  },
  reviewed: {
    label: 'Reviewed',
    classes: 'bg-purple-50 dark:bg-purple-500/10 text-[#8A2C90] dark:text-purple-300 border border-purple-200 dark:border-purple-500/20',
  },
  not_submitted: {
    label: 'Not Submitted',
    classes: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30',
  },
  overdue: {
    label: 'Overdue',
    classes: 'bg-teal-50 dark:bg-teal-500/10 text-red-700 dark:text-teal-400 border border-teal-200 dark:border-red-500/30',
  },
  active: {
    label: 'Active',
    classes: 'bg-teal-50 dark:bg-teal-500/10 text-[#00B5AD] dark:text-teal-400 border border-teal-200 dark:border-teal-500/30',
  },
  pending: {
    label: 'Pending',
    classes: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30',
  },
};

const statusDot: Record<BadgeVariant, string> = {
  draft: 'bg-slate-400',
  published: 'bg-emerald-500',
  submitted: 'bg-blue-500',
  reviewed: 'bg-[#8A2C90]',
  not_submitted: 'bg-amber-500',
  overdue: 'bg-teal-500',
  active: 'bg-[#00B5AD]',
  pending: 'bg-orange-500',
};

export const Badge: React.FC<BadgeProps> = ({ variant, label, size = 'sm' }) => {
  const config = variantConfig[variant] || variantConfig.draft;
  const displayLabel = label || config.label;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
        ${config.classes}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[variant]}`} />
      {displayLabel}
    </span>
  );
};
