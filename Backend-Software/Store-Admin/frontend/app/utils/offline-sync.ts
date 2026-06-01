/**
 * CafeCanvas — Offline Sync Engine
 *
 * Uses Dexie.js (IndexedDB) for persistent local storage.
 * Provides a sync queue that survives browser refreshes and
 * drains chronologically when connectivity is restored.
 */

import Dexie, { type Table } from 'dexie';
import type {
  SyncQueueItem,
  MenuItem,
  MenuCategory,
  FloorTable,
  FloorSection,
  Order,
  OrderItem,
  Bill,
} from '@/app/types';

// ─── Dexie Database Schema ──────────────────────────

export class CafeCanvasDB extends Dexie {
  syncQueue!: Table<SyncQueueItem, number>;
  menuItems!: Table<MenuItem, string>;
  menuCategories!: Table<MenuCategory, string>;
  floorSections!: Table<FloorSection, string>;
  floorTables!: Table<FloorTable, string>;
  orders!: Table<Order, string>;
  orderItems!: Table<OrderItem, string>;
  bills!: Table<Bill, string>;

  constructor() {
    super('cafecanvas-store-admin');
    this.version(1).stores({
      syncQueue:      '++id, timestamp, status, operation',
      menuItems:      'id, category_id, available, tenant_id',
      menuCategories: 'id, tenant_id, sort_order',
      floorSections:  'id, tenant_id',
      floorTables:    'id, status, section_id, tenant_id',
      orders:         'id, table_id, status, tenant_id',
      orderItems:     'id, order_id, kds_status, tenant_id',
      bills:          'id, order_id, local_ref, tenant_id',
    });
  }
}

export const db = new CafeCanvasDB();

// ─── Sync Queue Operations ──────────────────────────

/**
 * Add an operation to the persistent sync queue.
 * This is called when the user performs a mutative action while offline.
 */
export async function enqueueOperation(
  item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'>
): Promise<void> {
  await db.syncQueue.add({
    ...item,
    timestamp: Date.now(),
    retryCount: 0,
    status: 'pending',
  });
}

/**
 * Get the number of pending items in the sync queue.
 */
export async function getSyncQueueLength(): Promise<number> {
  return db.syncQueue.where('status').anyOf(['pending', 'failed']).count();
}

/**
 * Get all pending sync queue items, oldest first.
 */
export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  return db.syncQueue
    .where('status')
    .anyOf(['pending', 'failed'])
    .sortBy('timestamp');
}

const MAX_RETRIES = 5;

/**
 * Flush the sync queue by sending all pending operations to the server.
 * Processes items oldest-first. On success, marks as 'synced'.
 * On 409 Conflict, marks as 'failed' (data conflict — log for manual review).
 * On 5xx, increments retryCount; marks 'failed' after MAX_RETRIES.
 */
export async function flushQueue(apiBaseUrl: string): Promise<{
  synced: number;
  failed: number;
  remaining: number;
}> {
  const pending = await getPendingSyncItems();
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    if (item.retryCount >= MAX_RETRIES) {
      await db.syncQueue.update(item.id!, { status: 'failed' });
      failed++;
      continue;
    }

    try {
      // Mark as syncing
      await db.syncQueue.update(item.id!, { status: 'syncing' });

      const response = await fetch(`${apiBaseUrl}${item.endpoint}`, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: item.method !== 'GET' ? JSON.stringify(item.payload) : undefined,
      });

      if (response.ok) {
        await db.syncQueue.update(item.id!, { status: 'synced' });
        synced++;
      } else if (response.status === 409) {
        // Conflict — mark as failed, don't retry
        console.warn(
          `[SyncEngine] Conflict on ${item.operation}: ${item.endpoint}`,
          await response.text()
        );
        await db.syncQueue.update(item.id!, {
          status: 'failed',
          retryCount: MAX_RETRIES, // prevent future retries
        });
        failed++;
      } else if (response.status >= 500) {
        // Server error — increment retry, mark pending again
        await db.syncQueue.update(item.id!, {
          status: 'pending',
          retryCount: item.retryCount + 1,
        });
      } else {
        // 4xx (other than 409) — don't retry, mark failed
        console.error(
          `[SyncEngine] Client error ${response.status} on ${item.operation}`,
          await response.text()
        );
        await db.syncQueue.update(item.id!, {
          status: 'failed',
          retryCount: MAX_RETRIES,
        });
        failed++;
      }
    } catch (err) {
      // Network error — increment retry, leave as pending
      console.error(`[SyncEngine] Network error on ${item.operation}:`, err);
      await db.syncQueue.update(item.id!, {
        status: 'pending',
        retryCount: item.retryCount + 1,
      });
    }
  }

  const remaining = await getSyncQueueLength();
  return { synced, failed, remaining };
}

/**
 * Clean up old synced items from the queue (older than 24 hours).
 */
export async function cleanSyncedItems(): Promise<void> {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  await db.syncQueue
    .where('status')
    .equals('synced')
    .and((item) => item.timestamp < cutoff)
    .delete();
}

// ─── Cache Operations ───────────────────────────────

/**
 * Fetch data from the API (if online) and cache it locally.
 * If offline, return the cached version from IndexedDB.
 *
 * @param endpoint - The API path, e.g. '/api/store-admin/menu/items'
 * @param storeName - The Dexie table name to cache into
 * @param isOnline - Whether we have network connectivity
 * @param apiBaseUrl - Base URL for the API server
 */
export async function fetchWithCache<T>(
  endpoint: string,
  storeName: keyof CafeCanvasDB,
  isOnline: boolean,
  apiBaseUrl: string
): Promise<T[]> {
  if (isOnline) {
    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const json = await response.json();
        const data: T[] = json.data || json;

        // Update local cache
        const table = db.table(storeName);
        await table.clear();
        await table.bulkPut(data);

        return data;
      }
    } catch (err) {
      console.warn(
        `[SyncEngine] Failed to fetch ${endpoint}, falling back to cache:`,
        err
      );
    }
  }

  // Return cached data from IndexedDB
  const table = db.table(storeName);
  const cached = await table.toArray();
  return cached as T[];
}

/**
 * Directly update a single record in the local IndexedDB cache.
 * Used for optimistic UI updates when offline.
 */
export async function updateLocalCache<T extends { id: string }>(
  storeName: keyof CafeCanvasDB,
  id: string,
  changes: Partial<T>
): Promise<void> {
  const table = db.table(storeName);
  await table.update(id, changes);
}

/**
 * Add a record to the local IndexedDB cache.
 */
export async function addToLocalCache<T>(
  storeName: keyof CafeCanvasDB,
  record: T
): Promise<void> {
  const table = db.table(storeName);
  await table.put(record);
}

/**
 * Get a single record from local cache by ID.
 */
export async function getFromLocalCache<T>(
  storeName: keyof CafeCanvasDB,
  id: string
): Promise<T | undefined> {
  const table = db.table(storeName);
  return table.get(id) as Promise<T | undefined>;
}

/**
 * Check if a specific item has a pending sync operation.
 * Used to show "Sync Pending" badges on UI elements.
 */
export async function hasPendingSync(
  operation: string,
  endpointPattern: string
): Promise<boolean> {
  const count = await db.syncQueue
    .where('status')
    .anyOf(['pending', 'syncing', 'failed'])
    .and(
      (item) =>
        item.operation === operation &&
        item.endpoint.includes(endpointPattern)
    )
    .count();
  return count > 0;
}

/**
 * Get all item IDs that have pending sync operations.
 * Useful for batch-checking sync status across a list of menu items.
 */
export async function getPendingSyncItemIds(
  operation: string
): Promise<Set<string>> {
  const items = await db.syncQueue
    .where('status')
    .anyOf(['pending', 'syncing', 'failed'])
    .and((item) => item.operation === operation)
    .toArray();

  const ids = new Set<string>();
  for (const item of items) {
    // Extract the ID from the endpoint, e.g. /api/store-admin/menu/items/abc-123
    const parts = item.endpoint.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart.includes('-')) {
      ids.add(lastPart);
    }
    // Also check payload for id field
    if (item.payload && typeof item.payload === 'object' && 'id' in item.payload) {
      ids.add(item.payload.id as string);
    }
  }
  return ids;
}
