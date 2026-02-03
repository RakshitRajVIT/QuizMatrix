// Firebase configuration and initialization
// Matrix Club Quiz Platform - Firebase Setup

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, serverTimestamp } from 'firebase/firestore';

// =============================================================================
// FIREBASE CONFIGURATION
// Matrix Club Project Credentials
// =============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyC0sG0sflxbmlF70GiTl4xk7s4m6B42JGA",
  authDomain: "matrix-4bee5.firebaseapp.com",
  projectId: "matrix-4bee5",
  storageBucket: "matrix-4bee5.firebasestorage.app",
  messagingSenderId: "28740893438",
  appId: "1:28740893438:web:efa54bbcc8591344da43af",
  measurementId: "G-N9JQPLWHC9"
};

// =============================================================================
// MASTER ADMIN - Can manage admins and club settings
// =============================================================================
export const MASTER_ADMIN_EMAIL = "deepakshukla1508.i@gmail.com";

// =============================================================================
// DEFAULT ADMIN EMAIL WHITELIST (fallback if Firestore not loaded)
// =============================================================================
export const ADMIN_EMAILS = [
  "dipakshukla158@gmail.com",
  "bhumikaverma245@gmail.com",
  "anant.24bai10345@vitbhopal.ac.in",
  "deepakshukla1508.i@gmail.com",
];

// Default club name (can be changed by master admin)
export const DEFAULT_CLUB_NAME = "Matrix Club";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Auth Provider for Sign-In
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore Database
export const db = getFirestore(app);

// Server timestamp for synchronized timing
export const getServerTimestamp = () => serverTimestamp();

export default app;
