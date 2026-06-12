/**
 * Zero-dependency IndexedDB Service for CafeCanvas Offline Capability.
 * Manages caching of menu items, queuing database mutations, saving offline bills,
 * and performing background synchronization when online.
 */

const DB_NAME = 'CafeCanvasOfflineDB';
const DB_VERSION = 1;

export interface OfflineOperation {
  id?: number;
  table: string;
  action: 'insert' | 'update' | 'upsert';
  payload: any;
  timestamp: number;
}

export interface OfflineBill {
  id: string; // generated UUID or local temp ID
  tenant_id: string;
  location_id: string;
  table_number: string | number;
  customer_name: string;
  customer_phone: string | null;
  subtotal_paise: number;
  cgst_paise: number;
  sgst_paise: number;
  total_paise: number;
  payment_method: string;
  status: 'paid' | 'unpaid';
  created_at: string;
  paid_at: string | null;
  items: any[];
}

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is only available in browser environments'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('menu_cache')) {
        db.createObjectStore('menu_cache', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('categories_cache')) {
        db.createObjectStore('categories_cache', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('offline_bills')) {
        db.createObjectStore('offline_bills', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('operations_queue')) {
        db.createObjectStore('operations_queue', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Generic Store operations helper
async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function putIntoStore<T>(storeName: string, items: T[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    items.forEach(item => store.put(item));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

async function clearStore(storeName: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function deleteFromStore(storeName: string, key: any): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// --- Menu Cache ---
export async function cacheMenuItems(items: any[]): Promise<void> {
  await clearStore('menu_cache');
  if (items.length > 0) {
    await putIntoStore('menu_cache', items);
  }
}

export async function getCachedMenuItems(): Promise<any[]> {
  return getAllFromStore('menu_cache');
}

export async function cacheCategories(cats: any[]): Promise<void> {
  await clearStore('categories_cache');
  if (cats.length > 0) {
    await putIntoStore('categories_cache', cats);
  }
}

export async function getCachedCategories(): Promise<any[]> {
  return getAllFromStore('categories_cache');
}

// --- Offline Bills ---
export async function saveOfflineBill(bill: OfflineBill): Promise<void> {
  await putIntoStore('offline_bills', [bill]);
}

export async function getOfflineBills(): Promise<OfflineBill[]> {
  return getAllFromStore('offline_bills');
}

export async function deleteOfflineBill(id: string): Promise<void> {
  await deleteFromStore('offline_bills', id);
}

// --- Operations Queue ---
export async function enqueueOperation(op: Omit<OfflineOperation, 'timestamp'>): Promise<number> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('operations_queue', 'readwrite');
    const store = transaction.objectStore('operations_queue');
    const operation: OfflineOperation = {
      ...op,
      timestamp: Date.now()
    };
    const request = store.add(operation);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

export async function getQueuedOperations(): Promise<OfflineOperation[]> {
  return getAllFromStore('operations_queue');
}

export async function deleteQueuedOperation(id: number): Promise<void> {
  await deleteFromStore('operations_queue', id);
}

// --- Offline state tracker helper ---
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return window.navigator.onLine;
}

// --- Background synchronization ---
let isSyncing = false;

export async function syncOfflineData(supabase: any, onProgress?: (remaining: number) => void): Promise<void> {
  if (isSyncing) return;
  if (!isOnline()) return;

  const ops = await getQueuedOperations();
  const bills = await getOfflineBills();

  if (ops.length === 0 && bills.length === 0) return;

  isSyncing = true;
  console.log(`[Offline Sync] Starting background sync: ${ops.length} ops, ${bills.length} bills.`);

  try {
    // 1. Process queued operations (order creations, status updates, etc.)
    for (const op of ops) {
      try {
        let error = null;
        if (op.action === 'insert') {
          const { error: err } = await supabase.from(op.table).insert(op.payload);
          error = err;
        } else if (op.action === 'update') {
          // If table has ID, update by ID
          if (op.payload.id) {
            const { error: err } = await supabase.from(op.table).update(op.payload).eq('id', op.payload.id);
            error = err;
          }
        }
        
        if (!error) {
          if (op.id !== undefined) {
            await deleteQueuedOperation(op.id);
          }
        } else {
          console.warn(`[Offline Sync] Failed to replay operation:`, error);
        }
      } catch (err) {
        console.error(`[Offline Sync] Operation error:`, err);
      }
    }

    // 2. Sync Offline Bills
    for (const bill of bills) {
      try {
        // Strip nested items for DB insertion if bills table does not store it as items
        const { items, ...dbBill } = bill;
        const { error } = await supabase.from('bills').insert(dbBill);
        if (!error) {
          await deleteOfflineBill(bill.id);
        } else {
          console.warn(`[Offline Sync] Failed to sync bill ${bill.id}:`, error);
        }
      } catch (err) {
        console.error(`[Offline Sync] Bill sync error:`, err);
      }
    }

    console.log('[Offline Sync] Sync completed successfully in the background.');
  } catch (err) {
    console.error('[Offline Sync] Synchronization error:', err);
  } finally {
    isSyncing = false;
    if (onProgress) {
      const remainingOps = await getQueuedOperations();
      const remainingBills = await getOfflineBills();
      onProgress(remainingOps.length + remainingBills.length);
    }
  }
}
