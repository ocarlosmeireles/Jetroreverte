import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../constants';
import { allDemoUsers } from '../services/superAdminDemoData';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<User | null>;
    logout: () => Promise<void>;
    register: (personName: string, officeName: string, email: string, pass: string) => Promise<User | null>;
    sendPasswordResetEmail: (email: string) => Promise<void>;
    updateUserContext: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }): React.ReactElement => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app with Firebase, you'd use `onAuthStateChanged` here.
        // For this demo, we just simulate checking a session.
        setTimeout(() => {
            // You could add logic here to check localStorage/sessionStorage for a mock session
            setLoading(false);
        }, 1000); 
    }, []);

    const login = async (email: string, pass: string): Promise<User | null> => {
        // Check if it's a demo user login attempt
        const demoUserKey = (Object.keys(DEMO_USERS) as Array<keyof typeof DEMO_USERS>).find(
            key => DEMO_USERS[key].email === email
        );

        if (demoUserKey && DEMO_USERS[demoUserKey].password === pass) {
            const demoUserProfile = allDemoUsers.find(u => u.email === email);
            if (demoUserProfile) {
                // In a real app, user data would come from Firestore after auth success
                setUser(demoUserProfile as User);
                return demoUserProfile as User;
            }
        }
        
        throw new Error('Credenciais inválidas.');
    };

    const register = async (personName: string, officeName: string, email: string, pass: string): Promise<User | null> => {
        // In this demo, we only have pre-defined users, so registration is simulated as an error.
        // In a real Firebase app, you would use `createUserWithEmailAndPassword`,
        // then create a user document in Firestore with the additional details.
        throw new Error('Cadastro não disponível no modo de demonstração.');
    };
    
    const logout = async () => {
        // In a real Firebase app, you would use `signOut(auth)`.
        setUser(null);
        // Optionally, clear any mock session from localStorage/sessionStorage.
    };
    
    const sendPasswordResetEmail = async (email: string) => {
        // In a real Firebase app, you'd use `sendPasswordResetEmail(auth, email)`.
        // For the demo, we just simulate success.
        console.log(`Password reset email sent to ${email} (simulation).`);
        return;
    };
    
    // Function to update the user context locally (for profile updates, etc.)
    const updateUserContext = async (data: Partial<User>) => {
        setUser(prevUser => prevUser ? { ...prevUser, ...data } : null);
        // In a real app, you would also update the user document in Firestore here.
        // e.g., await updateDoc(doc(db, "users", user.id), data);
        console.log("User context updated with:", data);
    };
    
    const value = { user, loading, login, logout, register, sendPasswordResetEmail, updateUserContext };

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