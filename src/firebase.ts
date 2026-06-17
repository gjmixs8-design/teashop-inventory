/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, set, remove, runTransaction } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: "https://tea-shop-a9560-default-rtdb.firebaseio.com/",
};

export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app;
export let db: any = null;
export let auth: any = null;
export let storage: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getDatabase(app);
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Firebase services initialization failed:", error);
  }
}

// --- Local Storage Backup Helper Functions ---

const getLocalCollection = (collectionName: string): any[] => {
  const localKey = `tea_${collectionName}`;
  const local = localStorage.getItem(localKey);
  return local ? JSON.parse(local) : [];
};

const saveLocalCollection = (collectionName: string, data: any[]) => {
  const localKey = `tea_${collectionName}`;
  localStorage.setItem(localKey, JSON.stringify(data));
};

const writeLocalStorageBackup = (collectionName: string, id: string, data: any) => {
  const list = getLocalCollection(collectionName);
  const index = list.findIndex((item) => item.id === id);
  const updatedItem = { ...data, id };
  
  if (index >= 0) {
    list[index] = updatedItem;
  } else {
    list.push(updatedItem);
  }
  
  saveLocalCollection(collectionName, list);
  
  window.dispatchEvent(new StorageEvent("storage", {
    key: `tea_${collectionName}`,
    newValue: JSON.stringify(list)
  }));
};

const deleteLocalStorageBackup = (collectionName: string, id: string) => {
  const list = getLocalCollection(collectionName);
  const filtered = list.filter((item) => item.id !== id);
  saveLocalCollection(collectionName, filtered);
  
  window.dispatchEvent(new StorageEvent("storage", {
    key: `tea_${collectionName}`,
    newValue: JSON.stringify(filtered)
  }));
};

// --- Offline Outbox Sync Queue (Outbox Pattern) ---

interface OutboxItem {
  id: string;
  action: "write" | "delete";
  collection: string;
  docId: string;
  data?: any;
}

const getOfflineOutbox = (): OutboxItem[] => {
  try {
    const outbox = localStorage.getItem("tea_offline_outbox");
    return outbox ? JSON.parse(outbox) : [];
  } catch {
    return [];
  }
};

const saveOfflineOutbox = (outbox: OutboxItem[]) => {
  try {
    localStorage.setItem("tea_offline_outbox", JSON.stringify(outbox));
  } catch (e) {
    console.warn("Outbox persistence failed:", e);
  }
};

export const addToOutbox = (action: "write" | "delete", collection: string, docId: string, data?: any) => {
  const outbox = getOfflineOutbox();
  // Filter out redundant operations on the same docId
  const filtered = outbox.filter(item => !(item.collection === collection && item.docId === docId));
  filtered.push({
    id: `outbox-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    action,
    collection,
    docId,
    data,
  });
  saveOfflineOutbox(filtered);
};

export const syncOfflineOutbox = async () => {
  if (!isFirebaseConfigured || !db || !navigator.onLine) return;
  const outbox = getOfflineOutbox();
  if (outbox.length === 0) return;

  console.log(`Syncing ${outbox.length} offline operations to Firebase...`);
  const remaining: OutboxItem[] = [];

  for (const item of outbox) {
    try {
      if (item.action === "write") {
        const nodeRef = ref(db, `${item.collection}/${item.docId}`);
        const cleanedData = JSON.parse(JSON.stringify(item.data, (_, value) => {
          return value === undefined ? null : value;
        }));
        await set(nodeRef, cleanedData);
      } else if (item.action === "delete") {
        const nodeRef = ref(db, `${item.collection}/${item.docId}`);
        await remove(nodeRef);
      }
    } catch (error) {
      console.error(`Offline sync failed for item ${item.docId} in ${item.collection}:`, error);
      remaining.push(item);
    }
  }

  saveOfflineOutbox(remaining);
  console.log(`Offline sync complete. ${remaining.length} items remaining in outbox.`);
};

// Listen to network status changes to auto-sync offline cache
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    syncOfflineOutbox().catch(err => console.error("Auto outbox sync failed:", err));
  });
  
  // Trigger a check shortly after initial load
  setTimeout(() => {
    syncOfflineOutbox().catch(err => console.error("Initial outbox sync failed:", err));
  }, 4000);
}

// --- Core DB Sync Operations ---

/**
 * Syncs a path in real-time. Calls onUpdate whenever data changes.
 * Returns unsubscribe function.
 */
export const syncCollection = (
  collectionName: string,
  onUpdate: (data: any[]) => void,
  initialFallback: any[] = []
) => {
  if (isFirebaseConfigured && db) {
    const pathRef = ref(db, collectionName);
    return onValue(
      pathRef,
      (snapshot) => {
        const val = snapshot.val();
        let list: any[] = [];
        
        if (val) {
          list = Object.entries(val).map(([key, item]: [string, any]) => ({
            ...item,
            id: key,
          }));
        }
        
        // Seed default fallback data if path is empty
        if (list.length === 0 && initialFallback.length > 0) {
          onUpdate(initialFallback);
          initialFallback.forEach((item) => {
            writeDocument(collectionName, item.id, item).catch(err => 
              console.warn("Seeding Realtime Database node failed:", err)
            );
          });
        } else {
          onUpdate(list);
        }
      },
      (error) => {
        console.error(`Error syncing RTDB path ${collectionName}:`, error);
        onUpdate(getLocalCollection(collectionName));
      }
    );
  } else {
    // Local offline storage simulation
    const loadLocal = () => {
      const list = getLocalCollection(collectionName);
      if (list.length === 0 && initialFallback.length > 0) {
        saveLocalCollection(collectionName, initialFallback);
        return initialFallback;
      }
      return list;
    };

    onUpdate(loadLocal());

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `tea_${collectionName}`) {
        onUpdate(loadLocal());
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }
};

/**
 * Writes or updates a node in the database.
 */
export const writeDocument = async (
  collectionName: string,
  id: string,
  data: any
) => {
  // Always write locally first to keep UI snappy
  writeLocalStorageBackup(collectionName, id, data);

  if (isFirebaseConfigured && db && navigator.onLine) {
    try {
      const nodeRef = ref(db, `${collectionName}/${id}`);
      const cleanedData = JSON.parse(JSON.stringify(data, (_, value) => {
        return value === undefined ? null : value;
      }));
      await set(nodeRef, cleanedData);
    } catch (error) {
      console.warn(`Write to RTDB failed for ${collectionName}/${id}, queuing in outbox:`, error);
      addToOutbox("write", collectionName, id, data);
    }
  } else if (isFirebaseConfigured) {
    // Firebase is configured but offline
    addToOutbox("write", collectionName, id, data);
  }
};

/**
 * Deletes a node from the database.
 */
export const deleteDocument = async (collectionName: string, id: string) => {
  deleteLocalStorageBackup(collectionName, id);

  if (isFirebaseConfigured && db && navigator.onLine) {
    try {
      const nodeRef = ref(db, `${collectionName}/${id}`);
      await remove(nodeRef);
    } catch (error) {
      console.warn(`Delete from RTDB failed for ${collectionName}/${id}, queuing in outbox:`, error);
      addToOutbox("delete", collectionName, id);
    }
  } else if (isFirebaseConfigured) {
    addToOutbox("delete", collectionName, id);
  }
};

/**
 * Increment a centralized numeric counter atomically in the database (or locally).
 */
export const incrementCounter = async (counterPath: string): Promise<number> => {
  if (isFirebaseConfigured && db && navigator.onLine) {
    try {
      const counterRef = ref(db, counterPath);
      let nextVal = 1;
      const result = await runTransaction(counterRef, (currentValue) => {
        if (currentValue === null) {
          return 1;
        }
        return currentValue + 1;
      });
      if (result.committed) {
        nextVal = result.snapshot.val();
      }
      return nextVal;
    } catch (err) {
      console.warn(`Atomic transaction for ${counterPath} failed, returning local count:`, err);
    }
  }
  
  // Local offline counter fallback
  const localKey = `tea_counter_${counterPath.replace(/\//g, "_")}`;
  const current = localStorage.getItem(localKey);
  const nextVal = current ? parseInt(current) + 1 : 1;
  localStorage.setItem(localKey, nextVal.toString());
  return nextVal;
};

/**
 * Decrement or increment stock of an item (product or raw material) atomically.
 */
export const adjustStockTransaction = async (
  itemType: "products" | "raw_materials",
  itemId: string,
  quantityChange: number
): Promise<number> => {
  if (isFirebaseConfigured && db && navigator.onLine) {
    try {
      const stockRef = ref(db, `${itemType}/${itemId}/stock`);
      const result = await runTransaction(stockRef, (currentStock) => {
        if (currentStock === null) {
          return 0;
        }
        return Math.max(0, Number((currentStock + quantityChange).toFixed(3)));
      });
      return result.committed ? result.snapshot.val() : 0;
    } catch (err) {
      console.warn(`Atomic stock adjustment failed for ${itemType}/${itemId}, falling back to local edit:`, err);
    }
  }
  
  // Local offline adjust fallback
  const localKey = `tea_${itemType}`;
  const local = localStorage.getItem(localKey);
  const list = local ? JSON.parse(local) : [];
  const idx = list.findIndex((x: any) => x.id === itemId);
  let nextStock = 0;
  if (idx >= 0) {
    nextStock = Math.max(0, Number(((list[idx].stock || 0) + quantityChange).toFixed(3)));
    list[idx].stock = nextStock;
    localStorage.setItem(localKey, JSON.stringify(list));
    window.dispatchEvent(new StorageEvent("storage", {
      key: localKey,
      newValue: JSON.stringify(list)
    }));
  }
  return nextStock;
};

// --- Firebase Storage Image Upload Helper ---

/**
 * Uploads a file to Firebase Storage under the specified folder and filename.
 * Falls back gracefully to return a Base64 string on error or if Storage is unconfigured.
 */
export const uploadImageToStorage = async (
  folderPath: string,
  fileName: string,
  file: File
): Promise<string> => {
  if (isFirebaseConfigured && storage && navigator.onLine) {
    try {
      const cleanFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const fileRef = storageRef(storage, `${folderPath}/${cleanFileName}`);
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);
      return downloadUrl;
    } catch (err) {
      console.error("Firebase Storage upload failed, falling back to Base64:", err);
    }
  }

  // Base64 fallback for local/offline modes
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(new Error("File reading failed: " + e.target?.error));
    reader.readAsDataURL(file);
  });
};
