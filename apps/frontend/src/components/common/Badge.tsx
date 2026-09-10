import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TaskPriority, TaskStatus } from '@/types/task.types';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'status' | 'priority' | 'default';
  status?: TaskStatus;
  priority?: TaskPriority;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  priority,
  className,
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  let badgeColor = 'bg-slate-100 text-slate-700';

  if (variant === 'status' && status) {
    switch (status) {
      case 'TODO':
        badgeColor = 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20';
        break;
      case 'IN_PROGRESS':
        badgeColor = 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20';
        break;
      case 'DONE':
        badgeColor = 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20';
        break;
    }
  } else if (variant === 'priority' && priority) {
    switch (priority) {
      case 'LOW':
        badgeColor = 'bg-slate-100 text-slate-600';
        break;
      case 'MEDIUM':
        badgeColor = 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20';
        break;
      case 'HIGH':
        badgeColor = 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20';
        break;
      case 'URGENT':
        badgeColor = 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20';
        break;
    }
  }

  const label =
    children ||
    (status ? status.replace('_', ' ') : priority ? priority : '');

  return (
    <span className={twMerge(clsx(baseStyles, badgeColor, className))}>
      {label}
    </span>
  );
};
