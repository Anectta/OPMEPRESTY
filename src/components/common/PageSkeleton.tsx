import React from 'react';

export const PageSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse p-1">
      {/* Header Skeleton */}
      <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>

      {/* Main Table / Grid Skeleton */}
      <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
    </div>
  );
};
