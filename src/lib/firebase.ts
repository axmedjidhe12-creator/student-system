/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInAnonymously } from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  getDoc,
  onSnapshot
} from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

let firebaseAppInstance: FirebaseApp | null = null;
let firestoreDbInstance: Firestore | null = null;
let firebaseAuthInstance: Auth | null = null;

// Helper to check if a valid Firebase config exists in LocalStorage
export function getSavedFirebaseConfig(): any | null {
  try {
    const configStr = localStorage.getItem('school_firebase_config');
    if (configStr) {
      const config = JSON.parse(configStr);
      if (config && config.apiKey && config.projectId) {
        return config;
      }
    }
  } catch (e) {
    console.error("Failed to parse saved Firebase config", e);
  }
  return null;
}

// Save Firebase config to localStorage
export function saveFirebaseConfig(config: any): boolean {
  try {
    if (config && config.apiKey && config.projectId) {
      localStorage.setItem('school_firebase_config', JSON.stringify(config));
      return true;
    }
  } catch (e) {
    console.error("Failed to save Firebase config", e);
  }
  return false;
}

// Remove Firebase config to de-provision or revert to local-only
export function clearFirebaseConfig() {
  localStorage.removeItem('school_firebase_config');
}

// Dynamically initialize of Firebase App & Services
export function getFirebaseInstance(): { app: FirebaseApp | null; db: Firestore | null; auth: Auth | null } {
  if (firestoreDbInstance) {
    return { app: firebaseAppInstance, db: firestoreDbInstance, auth: firebaseAuthInstance };
  }

  const config = getSavedFirebaseConfig();
  if (!config) {
    return { app: null, db: null, auth: null };
  }

  try {
    // Prevent re-creating existing app if initialized under same alias
    if (getApps().length > 0) {
      firebaseAppInstance = getApp();
    } else {
      firebaseAppInstance = initializeApp(config);
    }
    
    // Check if direct database id or default
    firestoreDbInstance = getFirestore(firebaseAppInstance, config.firestoreDatabaseId || undefined);
    firebaseAuthInstance = getAuth(firebaseAppInstance);
    
    return { app: firebaseAppInstance, db: firestoreDbInstance, auth: firebaseAuthInstance };
  } catch (err) {
    console.error("Firebase dynamic initialization failed", err);
    return { app: null, db: null, auth: null };
  }
}

// Error logger mirroring strict system skill requirements
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const { auth } = getFirebaseInstance();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  console.error('Firestore Error Payload: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Clean and validate document IDs targeting Cloud firestore format constraints
export function sanitizeDocId(id: string): string {
  // Regex pattern matching letter, digits, dashes, and underscores (max 128 chars)
  const sanitized = id.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 128);
  return sanitized || `doc_${Math.random().toString(36).substr(2, 9)}`;
}

// --- Bulk/Collection synchronization helpers ---

// Upload a single record
export async function uploadRecordToFirestore(collectionName: string, docId: string, payload: any) {
  const { db, auth } = getFirebaseInstance();
  if (!db) return;

  // Make sure authenticated if config active
  if (auth && !auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.warn("Firebase Anonymous Sign-In failed, continuing using local policy:", e);
    }
  }

  const cleanId = sanitizeDocId(docId);
  const path = `${collectionName}/${cleanId}`;
  try {
    // Filter optional undefined values which cause Firestore serialization errors
    const cleanedPayload = JSON.parse(JSON.stringify(payload));
    // Add timestamps
    cleanedPayload.updatedAt = new Date().toISOString();
    await setDoc(doc(db, collectionName, cleanId), cleanedPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete a single record
export async function deleteRecordFromFirestore(collectionName: string, docId: string) {
  const { db } = getFirebaseInstance();
  if (!db) return;

  const cleanId = sanitizeDocId(docId);
  const path = `${collectionName}/${cleanId}`;
  try {
    await deleteDoc(doc(db, collectionName, cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Sync whole collection (upload bulk helper)
export async function uploadCollectionToFirestore(collectionName: string, records: any[], onProgress?: (percent: number) => void) {
  const { db, auth } = getFirebaseInstance();
  if (!db) throw new Error("Firebase database connection is offline");

  if (auth && !auth.currentUser) {
    await signInAnonymously(auth);
  }

  const batchSize = 450; // Firestore max is 500
  let batchCount = 0;
  let processed = 0;
  
  while (processed < records.length) {
    const batch = writeBatch(db);
    const chunk = records.slice(processed, processed + batchSize);
    
    chunk.forEach(record => {
      if (!record.id) return;
      const cleanId = sanitizeDocId(record.id);
      const docRef = doc(db, collectionName, cleanId);
      
      const cleanedRecord = JSON.parse(JSON.stringify(record));
      cleanedRecord.updatedAt = new Date().toISOString();
      batch.set(docRef, cleanedRecord);
    });

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${collectionName} (batch #${batchCount})`);
    }

    processed += chunk.length;
    batchCount++;
    if (onProgress) {
      onProgress(Math.floor((processed / records.length) * 100));
    }
  }
}

// Pull all data back down from Firestore
export async function downloadCollectionFromFirestore(collectionName: string): Promise<any[]> {
  const { db, auth } = getFirebaseInstance();
  if (!db) return [];

  if (auth && !auth.currentUser) {
    await signInAnonymously(auth);
  }

  try {
    const qSnapshot = await getDocs(collection(db, collectionName));
    const results: any[] = [];
    qSnapshot.forEach(docSnap => {
      results.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    return results;
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, collectionName);
  }
}
