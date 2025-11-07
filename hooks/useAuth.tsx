import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail as fbSendPasswordResetEmail,
    confirmPasswordReset as fbConfirmPasswordReset,
    updateProfile,
    User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User, UserRole } from '../types';
import { allDemoUsers } from '../services/superAdminDemoData';
import { DEMO_USERS } from '../constants';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<User | null>;
    logout: () => Promise<void>;
    register: (personName: string, officeName: string, email: string, pass: string) => Promise<User | null>;
    updateUserContext: (data: Partial<User>) => Promise<void>;
    sendPasswordResetEmail: (email: string) => Promise<void>;
    confirmPasswordReset: (code: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to fetch user profile from Firestore
const getUserProfile = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    // For demo purposes, if the email matches a demo user, return that user's profile
    // This bypasses the need for Firestore to be populated with these users.
    const demoUser = allDemoUsers.find(u => u.email === firebaseUser.email);
    if (demoUser) {
        // For the guardian, we need to ensure the ID matches the one in demo data ('resp-01')
        // for relationships to work. For others, we can use the firebase UID for consistency.
        const id = demoUser.role === UserRole.RESPONSAVEL ? demoUser.id : firebaseUser.uid;
        
        // Return a complete User object. The `allDemoUsers` object is nearly complete.
        return {
            ...demoUser,
            id: id,
            email: firebaseUser.email || demoUser.email,
        };
    }

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const profileData = userDocSnap.data();
        return {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            ...profileData,
        } as User;
    }
    // If profile doesn't exist, maybe it's a new registration, create a basic one
    console.warn("User profile not found in Firestore for UID:", firebaseUser.uid);
    return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'Usuário',
        role: UserRole.ESCRITORIO, // default assumption
    }
};


export const AuthProvider = ({ children }: { children?: ReactNode }): React.ReactElement => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                try {
                    const userProfile = await getUserProfile(authUser);
                    setUser(userProfile);
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
             // Add a small delay to prevent UI flicker on fast reloads
            setTimeout(() => setLoading(false), 300);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, pass: string): Promise<User | null> => {
        // Check if it's a demo user login attempt
        const demoUserKey = (Object.keys(DEMO_USERS) as Array<keyof typeof DEMO_USERS>).find(
            key => DEMO_USERS[key].email === email
        );

        if (demoUserKey && DEMO_USERS[demoUserKey].password === pass) {
            // It's a valid demo user, bypass Firebase Auth
            const demoUserProfile = allDemoUsers.find(u => u.email === email);
            if (demoUserProfile) {
                // Manually set user state since onAuthStateChanged won't fire
                setUser(demoUserProfile);
                return demoUserProfile;
            }
            // This should not happen if data is consistent
            throw new Error('Demo user profile not found.');
        }

        // Original flow for non-demo users
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        if (userCredential.user) {
            // onAuthStateChanged will handle setting the user state.
            // We just need to return the profile to the caller.
            return await getUserProfile(userCredential.user);
        }
        return null;
    };

    const register = async (personName: string, officeName: string, email: string, pass: string): Promise<User | null> => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const firebaseUser = userCredential.user;

        if (firebaseUser) {
            // Update Firebase Auth profile
            await updateProfile(firebaseUser, { displayName: personName });

            // Create user profile in Firestore
            const newUserProfile: Omit<User, 'id'> = {
                name: personName,
                email: email,
                officeName,
                role: UserRole.ESCRITORIO, // Default role for new sign-ups
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), newUserProfile);

            return { id: firebaseUser.uid, ...newUserProfile };
        }
        return null;
    };
    
    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };
    
    const sendPasswordResetEmail = async (email: string) => {
        await fbSendPasswordResetEmail(auth, email);
    };

    const confirmPasswordReset = async (code: string, newPassword: string) => {
        await fbConfirmPasswordReset(auth, code, newPassword);
    };
    
    const updateUserContext = async (data: Partial<User>) => {
        if (user && auth.currentUser) {
            const userDocRef = doc(db, 'users', user.id);
            // Firestore doesn't like 'id' and 'email' field in the update data if they are also part of the object
            const updateData = { ...data };
            delete updateData.id;
            delete updateData.email;

            await updateDoc(userDocRef, updateData);
            
            // Re-fetch and update local user state to reflect changes
            const updatedUser = await getUserProfile(auth.currentUser);
            setUser(updatedUser);
        }
    };
    
    const value = { user, loading, login, logout, register, updateUserContext, sendPasswordResetEmail, confirmPasswordReset };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};