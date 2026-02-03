// AuthContext - Manages authentication state across the app
// Provides user info, login/logout functions, and admin status

import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, ADMIN_EMAILS, MASTER_ADMIN_EMAIL } from '../firebase/firebase';

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
    const [isMasterAdmin, setIsMasterAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check if email is in admin whitelist
    const checkAdminStatus = (email) => {
        if (!email) return false;
        const normalizedEmail = email.toLowerCase();
        return ADMIN_EMAILS.some(e => e.toLowerCase() === normalizedEmail) ||
            normalizedEmail === MASTER_ADMIN_EMAIL.toLowerCase();
    };

    // Check if email is master admin
    const checkMasterAdminStatus = (email) => {
        if (!email) return false;
        return email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
    };

    // Save or update user in Firestore
    const saveUserToFirestore = async (firebaseUser) => {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        const isUserAdmin = checkAdminStatus(firebaseUser.email);
        const isUserMasterAdmin = checkMasterAdminStatus(firebaseUser.email);

        const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isAdmin: isUserAdmin,
            isMasterAdmin: isUserMasterAdmin,
            lastLogin: new Date().toISOString()
        };

        if (!userSnap.exists()) {
            userData.createdAt = new Date().toISOString();
        }

        await setDoc(userRef, userData, { merge: true });
        return { isAdmin: isUserAdmin, isMasterAdmin: isUserMasterAdmin };
    };

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const { isAdmin: adminStatus, isMasterAdmin: masterStatus } = await saveUserToFirestore(firebaseUser);
                    setUser(firebaseUser);
                    setIsAdmin(adminStatus);
                    setIsMasterAdmin(masterStatus);
                } catch (error) {
                    console.error('Error saving user:', error);
                    setUser(firebaseUser);
                    setIsAdmin(checkAdminStatus(firebaseUser.email));
                    setIsMasterAdmin(checkMasterAdminStatus(firebaseUser.email));
                }
            } else {
                setUser(null);
                setIsAdmin(false);
                setIsMasterAdmin(false);
            }
            setLoading(false);
        });

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
        isMasterAdmin,
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

