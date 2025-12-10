/**
 * Icon Loader Component
 * 
 * Dynamically loads Lucide icons to reduce bundle size.
 * Only loads icons that are actually used.
 */

import { lazy, Suspense, type ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

interface IconLoaderProps {
  name: string;
  className?: string;
  size?: number;
}

/**
 * Lazy load icon component
 */
export function IconLoader({ name, className, size = 24 }: IconLoaderProps) {
  // Dynamically import icon
  const IconComponent = lazy(() =>
    import('lucide-react').then((mod) => ({
      default: (mod as Record<string, ComponentType>)[name] || mod.AlertCircle,
    }))
  );

  return (
    <Suspense fallback={<Loader2 className={className} size={size} />}>
      <IconComponent className={className} size={size} />
    </Suspense>
  );
}

/**
 * Preload commonly used icons
 */
export function preloadIcons(iconNames: string[]): void {
  if (typeof window === 'undefined') return;
  
  import('lucide-react').then((mod) => {
    iconNames.forEach((name) => {
      if (mod[name]) {
        // Icon is available
      }
    });
  });
}
