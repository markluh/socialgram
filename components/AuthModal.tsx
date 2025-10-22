import React, { useState } from 'react';
import { LoginPage } from '../pages/LoginPage';
import { SignUpPage } from '../pages/SignUpPage';
import { CloseIcon } from './icons/CloseIcon';

interface AuthModalProps {
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [showLogin, setShowLogin] = useState(true);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center" onClick={onClose}>
            <div 
                className="relative"
                onClick={e => e.stopPropagation()}
            >
                 <button onClick={onClose} className="absolute -top-12 right-0 text-white p-2 z-10">
                    <CloseIcon className="w-8 h-8"/>
                </button>
                 <div className="w-full max-w-sm">
                    {showLogin ? (
                        <LoginPage onSwitchToSignUp={() => setShowLogin(false)} onSuccess={onClose} />
                    ) : (
                        <SignUpPage onSwitchToLogin={() => setShowLogin(true)} onSuccess={onClose} />
                    )}
                </div>
            </div>
        </div>
    );
};
