import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Replace these with your own Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyCFBjnGN4PVQAGGcpX-eh_z4Prj1otfRI0",
  authDomain: "tknz-2a8a2.firebaseapp.com",
  projectId: "tknz-2a8a2",
  storageBucket: "tknz-2a8a2.firebasestorage.app",
  messagingSenderId: "873604371090",
  appId: "1:873604371090:web:dd6da28ca38c434eaecc4b",
  measurementId: "G-TDBT55JLRL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Simple helper function to log event data into Firestore.
 */
export async function logEventToFirestore(eventName: string, data: Record<string, any>) {
  try {
    await addDoc(collection(db, 'events'), {
      eventName,
      ...data,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error logging event to Firestore:', error);
  }
} 