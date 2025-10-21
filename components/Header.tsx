import React from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';
import { MessagesIcon } from './icons/MessagesIcon';
import { ReelsIcon } from './icons/ReelsIcon';
import { HeartIcon } from './icons/HeartIcon';
import { ExploreIcon } from './icons/ExploreIcon';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
    onNewPost: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onNavigate: (page: 'home' | 'messages' | 'reels' | 'notifications' | 'explore' | 'profile') => void;
    hasUnreadNotifications?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNewPost, theme, toggleTheme, onNavigate, hasUnreadNotifications }) => {
    const { currentUser } = useAuth();
    return (
        <header className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 z-10">
            <div className="container mx-auto px-4 h-14 flex justify-between items-center max-w-4xl">
                <h1 className="text-2xl font-serif font-bold tracking-tight text-gray-900 dark:text-gray-100 cursor-pointer" onClick={() => onNavigate('home')}>Socialgram</h1>
                <div className="flex items-center space-x-4">
                     <button
                        onClick={toggleTheme}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Toggle theme"
                    >
                       {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </button>
                    <button
                        onClick={() => onNavigate('explore')}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Explore"
                    >
                        <ExploreIcon />
                    </button>
                    <button
                        onClick={() => onNavigate('reels')}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Reels"
                    >
                        <ReelsIcon />
                    </button>
                    <button
                        onClick={() => onNavigate('notifications')}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Notifications"
                    >
                        <HeartIcon isFilled={hasUnreadNotifications} />
                    </button>
                    <button
                        onClick={() => onNavigate('messages')}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Messages"
                    >
                        <MessagesIcon />
                    </button>
                     <button
                        onClick={onNewPost}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Create new post"
                    >
                        <PlusIcon />
                    </button>
                    <img 
                        src={currentUser?.avatarUrl} 
                        alt="My profile" 
                        className="w-8 h-8 rounded-full cursor-pointer"
                        onClick={() => onNavigate('profile')}
                    />
                </div>
            </div>
        </header>
    );
};
