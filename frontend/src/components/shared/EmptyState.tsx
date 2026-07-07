import React from 'react';
import { FileText, Search, Inbox } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  icon?: 'file' | 'search' | 'inbox';
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

const icons = {
  file: FileText,
  search: Search,
  inbox: Inbox,
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  action,
}) => {
  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-purple-500/10 dark:bg-purple-500/10 flex items-center justify-center mb-4">
        <Icon size={28} className="text-[#6C1D5F] dark:text-purple-400" />
      </div>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] max-w-sm leading-relaxed">{description}</p>
      )}
      {action && (
        <Button variant="primary" className="mt-5" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
