// AuthContext - Manages authentication state across the app
// Provides user info, login/logout functions, and admin status

import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, ADMIN_EMAILS } from '../firebase/firebase';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use auth context easily
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth Provider Component - Wraps the entire app
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check if email is in admin whitelist
    const checkAdminStatus = (email) => {
        return ADMIN_EMAILS.includes(email?.toLowerCase());
    };

    // Save or update user in Firestore
    const saveUserToFirestore = async (firebaseUser) => {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        const isUserAdmin = checkAdminStatus(firebaseUser.email);

        const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isAdmin: isUserAdmin,
            lastLogin: new Date().toISOString()
        };

        if (!userSnap.exists()) {
            // New user - add createdAt
            userData.createdAt = new Date().toISOString();
        }

        await setDoc(userRef, userData, { merge: true });
        return isUserAdmin;
    };

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in
                try {
                    const adminStatus = await saveUserToFirestore(firebaseUser);
                    setUser(firebaseUser);
                    setIsAdmin(adminStatus);
                } catch (error) {
                    console.error('Error saving user:', error);
                    setUser(firebaseUser);
                    setIsAdmin(checkAdminStatus(firebaseUser.email));
                }
            } else {
                // User is signed out
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    // Google Sign In function
    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    };

    // Sign Out function
    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    };

    // Context value - what we expose to the app
    const value = {
        user,
        isAdmin,
        loading,
        signInWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
