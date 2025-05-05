import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import type { CreatedCoin } from './types'; // Assuming CreatedCoin type is exported from store

// Replace these with your own Firebase config values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "tknz-2a8a2.firebaseapp.com",
  projectId: "tknz-2a8a2",
  storageBucket: "tknz-2a8a2.firebasestorage.app",
  messagingSenderId: "873604371090",
  appId: "1:873604371090:web:dd6da28ca38c434eaecc4b",
  measurementId: "G-TDBT55JLRL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const storage = getStorage(app);

/**
 * Simple helper function to log event data into Firestore.
 */
export async function logEventToFirestore(eventName: string, data: Record<string, any>) {
  try {
    await addDoc(collection(db, 'events'), {
      eventName,
      ...data,
      timestamp: new Date() // Use client-side timestamp for events
    });
  } catch (error) {
    console.error('Error logging event to Firestore:', error);
  }
}

/**
 * Fetches created coins for a specific wallet address from Firestore.
 */
export async function getCreatedCoins(walletAddress: string): Promise<CreatedCoin[]> {
  try {
    const coinsRef = collection(db, 'createdCoins');
    const q = query(coinsRef, where('walletAddress', '==', walletAddress));
    const querySnapshot = await getDocs(q);
    const coins: CreatedCoin[] = [];
    querySnapshot.forEach((doc) => {
      // We assume the document data matches the CreatedCoin structure
      // Perform type assertion carefully, or add validation
      coins.push(doc.data() as CreatedCoin);
    });
    return coins;
  } catch (error) {
    console.error('Error fetching created coins from Firestore:', error);
    // Return empty array or re-throw, depending on desired error handling
    return []; 
  }
}

/**
 * Adds a newly created coin record to Firestore.
 */
export async function addCreatedCoinToFirestore(walletAddress: string, coin: CreatedCoin): Promise<void> {
  try {
    await addDoc(collection(db, 'createdCoins'), {
      walletAddress, // Store the wallet address with the coin data
      ...coin,
      createdAt: serverTimestamp() // Use server-side timestamp for creation time
    });
  } catch (error) {
    console.error('Error adding created coin to Firestore:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Uploads an image file to Firebase Storage
 * @param file The file to upload
 * @param onProgress Progress callback function
 * @returns Promise with download URL
 */
export const uploadImageToFirebase = async (
  file: File, 
  onProgress: (progress: number) => void
): Promise<string> => {
  try {
    // Create a unique file name
    const fileName = `token_images/${uuidv4()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, fileName);
    
    // Start upload with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Track upload progress
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          onProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          reject(error);
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            console.error("Failed to get download URL:", error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error("Upload setup failed:", error);
    throw error;
  }
};

export default storage; 