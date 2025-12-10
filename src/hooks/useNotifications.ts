'use client';

import { useSyncExternalStore } from 'react';
import { notificationSystem, type Notification } from '@/lib/notifications/system';

/**
 * React hook that keeps the component tree synchronized with the in-memory notification store.
 *
 * Internally this wraps the notification system with React's `useSyncExternalStore` so that
 * components stay consistent during concurrent rendering and avoid manual `useEffect` bookkeeping.
 *
 * @returns The latest list of notifications sorted with the newest entries first.
 */
export function useNotifications(): Notification[] {
  return useSyncExternalStore(
    (onStoreChange) => notificationSystem.subscribeToStore(onStoreChange),
    () => notificationSystem.getAll(),
    () => []
  );
}
