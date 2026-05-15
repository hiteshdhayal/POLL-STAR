import React from 'react';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

const shimmer = 'bg-gradient-to-r from-border via-cream to-border bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]';

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', lines }) => {
  if (lines) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 rounded-none ${shimmer} ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`${shimmer} ${className}`} />
  );
};

export const PollCardSkeleton: React.FC = () => (
  <div className="card border border-border animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-5 w-16" />
    </div>
    <Skeleton lines={3} />
    <div className="flex gap-3 mt-6">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);
