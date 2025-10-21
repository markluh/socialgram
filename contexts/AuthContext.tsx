import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import * as api from '../services/api';

interface AuthContextType {
    currentUser: User | null;
    login: (username: string, password: string) => Promise<User | null>;
    signup: (details: { username: string; fullName: string; email: string; password: string }) => Promise<User | null>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // This is where you might check for a session token in localStorage
        // For this mock app, we'll just start logged out
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        const user = await api.loginUser(username, password);
        if (user) {
            setCurrentUser(user);
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        }
        setIsLoading(false);
        return user;
    };

    const signup = async (details: { username: string; fullName: string; email: string; password: string }) => {
        setIsLoading(true);
        const user = await api.signUpUser(details);
        if (user) {
            setCurrentUser(user);
             sessionStorage.setItem('currentUser', JSON.stringify(user));
        }
        setIsLoading(false);
        return user;
    };

    const logout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUser');
    };

    const value = {
        currentUser,
        login,
        signup,
        logout,
        isLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};