// firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase client configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: 'portfolio-70fd7.firebaseapp.com',
  projectId: 'portfolio-70fd7',
  storageBucket: 'portfolio-70fd7.appspot.com',
  messagingSenderId: '102211109135048835745',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Messaging with check
export const initializeMessaging = async () => {
  try {
    const isSupportedBrowser = await isSupported();
    if (isSupportedBrowser) {
      return getMessaging(app);
    }
    return null;
  } catch (error) {
    console.log('Messaging not supported in this environment:', error);
    return null;
  }
};
