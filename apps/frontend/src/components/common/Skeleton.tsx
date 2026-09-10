import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'animate-pulse rounded-md bg-slate-800/80 border border-slate-700/30',
          className
        )
      )}
    />
  );
};
