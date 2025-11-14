'use client';

import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Empty State Component
 * 
 * Memoized to prevent unnecessary re-renders.
 */
const EmptyState = memo(function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl animate-pulse" />
        
        {/* Icon container */}
        <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 shadow-xl">
          <Icon className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="mt-6 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-400 text-center max-w-md">{description}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all hover:scale-105 shadow-lg hover:shadow-purple-500/50"
        >
          {actionLabel}
        </button>
      )}

      {/* Decorative elements */}
      <div className="mt-8 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-purple-500/40 animate-pulse" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-blue-500/40 animate-pulse" style={{ animationDelay: '200ms' }} />
        <div className="w-2 h-2 rounded-full bg-cyan-500/40 animate-pulse" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;

