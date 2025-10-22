import React, { useState } from 'react';
import { LoginPage } from './LoginPage';
import { SignUpPage } from './SignUpPage';

interface AuthPageProps {
    onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
    const [showLogin, setShowLogin] = useState(true);

    return (
        <div className="w-full max-w-sm">
            <h1 className="text-4xl text-center font-serif font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6">Socialgram</h1>
            {showLogin ? (
                <LoginPage onSwitchToSignUp={() => setShowLogin(false)} onSuccess={onSuccess} />
            ) : (
                <SignUpPage onSwitchToLogin={() => setShowLogin(true)} onSuccess={onSuccess} />
            )}
        </div>
    );
};