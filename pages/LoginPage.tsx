import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
    onSwitchToSignUp: () => void;
    onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignUp, onSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await login(username, password);
            if (user) {
                onSuccess?.();
            } else {
                setError('Invalid username or password. Try "currentUser" / "password123".');
            }
        } catch (err) {
            setError('Failed to log in. Please try again.');
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg disabled:bg-blue-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                >
                    {isLoading ? 'Logging In...' : 'Log In'}
                </button>
            </form>
            <div className="mt-6 text-center text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <button onClick={onSwitchToSignUp} className="font-semibold text-blue-500 hover:underline">
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    );
};