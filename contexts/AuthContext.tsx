import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import * as api from '../services/api';

interface AuthContextType {
    currentUser: User | null;
    login: (username: string, password: string) => Promise<User | null>;
    signup: (details: { username: string; fullName: string; email: string; password:string }) => Promise<User | null>;
    logout: () => void;
    isLoading: boolean;
    followUser: (username: string) => void;
    unfollowUser: (username: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const updateUserInStorage = (user: User | null) => {
        if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            sessionStorage.removeItem('currentUser');
        }
    };
    
    const login = async (username: string, password: string) => {
        setIsLoading(true);
        const user = await api.loginUser(username, password);
        if (user) {
            setCurrentUser(user);
            updateUserInStorage(user);
        }
        setIsLoading(false);
        return user;
    };

    const signup = async (details: { username: string; fullName: string; email: string; password: string }) => {
        setIsLoading(true);
        const user = await api.signUpUser(details);
        if (user) {
            setCurrentUser(user);
            updateUserInStorage(user);
        }
        setIsLoading(false);
        return user;
    };

    const logout = () => {
        setCurrentUser(null);
        updateUserInStorage(null);
    };

    const followUser = (username: string) => {
        setCurrentUser(prevUser => {
            if (!prevUser) return null;
            const updatedUser = { ...prevUser, following: (prevUser.following || 0) + 1 };
            updateUserInStorage(updatedUser);
            return updatedUser;
        });
    };
    
    const unfollowUser = (username: string) => {
        setCurrentUser(prevUser => {
            if (!prevUser) return null;
            const updatedUser = { ...prevUser, following: (prevUser.following || 0) - 1 };
            updateUserInStorage(updatedUser);
            return updatedUser;
        });
    };

    const value = {
        currentUser,
        login,
        signup,
        logout,
        isLoading,
        followUser,
        unfollowUser
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
