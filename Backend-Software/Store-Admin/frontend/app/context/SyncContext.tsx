'use client';

/**
 * CafeCanvas — Sync Context Provider
 *
 * Provides global network status, sync queue management,
 * and data fetching with offline-first cache support.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import type { SyncQueueItem } from '@/app/types';
import {
  enqueueOperation,
  getSyncQueueLength,
  flushQueue,
  fetchWithCache,
  cleanSyncedItems,
  type CafeCanvasDB,
} from '@/app/utils/offline-sync';

// ─── Context Value Interface ────────────────────────

export interface SyncContextValue {
  /** True physical navigator.onLine status */
  isOnline: boolean;
  /** Developer simulation toggle state */
  isSimulatedOffline: boolean;
  /** Combined: isOnline && !isSimulatedOffline */
  effectivelyOnline: boolean;
  /** Number of pending items in the sync queue */
  syncQueueLength: number;
  /** Last successful sync timestamp */
  lastSyncedAt: Date | null;
  /** Current sync status */
  syncStatus: 'idle' | 'syncing' | 'error';
  /** Queue an offline operation */
  queueAction: (
    item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'>
  ) => Promise<void>;
  /** Fetch data with cache-first strategy based on connectivity */
  fetchWithSync: <T>(
    endpoint: string,
    cacheStore: keyof CafeCanvasDB
  ) => Promise<T[]>;
  /** Toggle the dev simulation switch */
  toggleSimulatedOffline: () => void;
  /** Manually trigger a sync flush */
  forceSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | null>(null);

// ─── Provider Component ─────────────────────────────

const API_BASE_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000')
    : 'http://localhost:4000';

const QUEUE_POLL_INTERVAL = 3000;
const FLUSH_DEBOUNCE_MS = 1500;

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [syncQueueLength, setSyncQueueLength] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  const flushTimerRef = useRef<NodeJS.Timeout | null>(null);

  const effectivelyOnline = isOnline && !isSimulatedOffline;

  // ─── Network Listeners ──────────────────────────

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ─── Auto-Flush on Going Online ─────────────────

  const doFlush = useCallback(async () => {
    if (syncStatus === 'syncing') return;

    const queueLen = await getSyncQueueLength();
    if (queueLen === 0) return;

    setSyncStatus('syncing');
    try {
      const result = await flushQueue(API_BASE_URL);
      setSyncQueueLength(result.remaining);
      if (result.synced > 0) {
        setLastSyncedAt(new Date());
      }
      setSyncStatus(result.remaining > 0 ? 'error' : 'idle');

      // Clean old synced items
      await cleanSyncedItems();
    } catch (err) {
      console.error('[SyncProvider] Flush failed:', err);
      setSyncStatus('error');
    }
  }, [syncStatus]);

  useEffect(() => {
    if (effectivelyOnline) {
      // Debounce the flush to avoid hammering server on reconnect
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      flushTimerRef.current = setTimeout(() => {
        doFlush();
      }, FLUSH_DEBOUNCE_MS);
    }
    return () => {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    };
  }, [effectivelyOnline, doFlush]);

  // ─── Poll Sync Queue Length ─────────────────────

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const poll = async () => {
      const len = await getSyncQueueLength();
      setSyncQueueLength(len);
    };

    poll(); // Initial read
    const interval = setInterval(poll, QUEUE_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // ─── Context Methods ────────────────────────────

  const queueAction = useCallback(
    async (
      item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'>
    ) => {
      await enqueueOperation(item);
      const len = await getSyncQueueLength();
      setSyncQueueLength(len);
    },
    []
  );

  const fetchWithSyncFn = useCallback(
    async <T,>(
      endpoint: string,
      cacheStore: keyof CafeCanvasDB
    ): Promise<T[]> => {
      return fetchWithCache<T>(
        endpoint,
        cacheStore,
        effectivelyOnline,
        API_BASE_URL
      );
    },
    [effectivelyOnline]
  );

  const toggleSimulatedOffline = useCallback(() => {
    setIsSimulatedOffline((prev) => !prev);
  }, []);

  const forceSync = useCallback(async () => {
    await doFlush();
  }, [doFlush]);

  // ─── Render ─────────────────────────────────────

  const value: SyncContextValue = {
    isOnline,
    isSimulatedOffline,
    effectivelyOnline,
    syncQueueLength,
    lastSyncedAt,
    syncStatus,
    queueAction,
    fetchWithSync: fetchWithSyncFn,
    toggleSimulatedOffline,
    forceSync,
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────

export function useSyncContext(): SyncContextValue {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error(
      'useSyncContext must be used within a <SyncProvider>. ' +
      'Wrap your app layout with <SyncProvider> in layout.tsx.'
    );
  }
  return context;
}
