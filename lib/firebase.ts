import { initializeApp, getApp, getApps } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, Auth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app: any;
let auth: Auth;
let storage: any;
let db: any;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  storage = getStorage(app);
  db = getFirestore(app);
} else {
  app = getApp();
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
  storage = getStorage(app);
  db = getFirestore(app);
}

export { app, auth, storage, db };
