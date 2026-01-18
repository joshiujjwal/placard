import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

// Firebase configuration using environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase and export the services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const appId = import.meta.env.VITE_FIREBASE_APP_ID;

// Set persistence explicitly
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error setting persistence:', error);
});

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });
// 1. Specialized Model for Image Generation & High-Fidelity Editing (Nano Banana)
// This model supports specific "image-to-image" tasks and character consistency.
export const model = getGenerativeModel(ai, { 
  model: "gemini-2.5-flash-image" 
});

// 2. Vision & Reasoning Model
export const visionModel = getGenerativeModel(ai, {
  model: "gemini-2.5-flash"
});

// 3. Recommended: Dedicated Virtual Try-On API (Vertex AI)
// If your project supports Vertex AI endpoints, use the purpose-built VTO model
// which accepts separate 'personImage' and 'productImage' inputs.
export const vtoModel = "virtual-try-on-preview-08-04";
