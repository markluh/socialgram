import React, { useState } from 'react';
import { LoginPage } from './LoginPage';
import { SignUpPage } from './SignUpPage';

export const AuthPage: React.FC = () => {
    const [showLogin, setShowLogin] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm">
                 <h1 className="text-4xl text-center font-serif font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6">Socialgram</h1>
                {showLogin ? (
                    <LoginPage onSwitchToSignUp={() => setShowLogin(false)} />
                ) : (
                    <SignUpPage onSwitchToLogin={() => setShowLogin(true)} />
                )}
            </div>
        </div>
    );
};
