import React from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { ExploreIcon } from './icons/ExploreIcon';
import { ReelsIcon } from './icons/ReelsIcon';
import { MessagesIcon } from './icons/MessagesIcon';
import { HeartIcon } from './icons/HeartIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { ChatBotIcon } from './icons/ChatBotIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { useAuth } from '../contexts/AuthContext';

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, onClick }) => (
    <a href="#" onClick={(e) => { e.preventDefault(); onClick?.(); }} className="flex items-center p-3 my-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
        <div className="w-6 h-6 transform transition-transform group-hover:scale-110">{icon}</div>
        <span className="ml-4 font-semibold text-base text-gray-900 dark:text-gray-100">{label}</span>
    </a>
);

interface LeftSidebarProps {
    onNewPost: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onNavigate: (page: 'home' | 'messages' | 'reels' | 'notifications' | 'explore' | 'profile', username?: string) => void;
    hasUnreadNotifications?: boolean;
    onOpenChat: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ onNewPost, theme, toggleTheme, onNavigate, hasUnreadNotifications, onOpenChat }) => {
    const { currentUser, logout } = useAuth();
    
    return (
        <aside className="h-screen sticky top-0 w-full border-r border-gray-200 dark:border-gray-700 p-2 flex flex-col">
            <div className="py-6 px-3">
                 <h1 className="text-3xl font-serif font-bold tracking-tight text-gray-900 dark:text-gray-100 cursor-pointer" onClick={() => onNavigate('home')}>Socialgram</h1>
            </div>
            <nav className="flex flex-col h-full">
                <div className="flex-grow">
                    <NavItem icon={<HomeIcon />} label="Home" onClick={() => onNavigate('home')} />
                    <NavItem icon={<ExploreIcon />} label="Explore" onClick={() => onNavigate('explore')} />
                    <NavItem icon={<ReelsIcon />} label="Reels" onClick={() => onNavigate('reels')} />
                    {currentUser && (
                        <>
                            <NavItem icon={<MessagesIcon />} label="Messages" onClick={() => onNavigate('messages')} />
                            <NavItem icon={<HeartIcon isFilled={hasUnreadNotifications} />} label="Notifications" onClick={() => onNavigate('notifications')} />
                            <NavItem icon={<PlusIcon />} label="Create" onClick={onNewPost} />
                            <NavItem icon={<ChatBotIcon />} label="Gemini Assistant" onClick={onOpenChat} />
                             <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('profile', currentUser.username); }} className="flex items-center p-3 my-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                                <img 
                                    src={currentUser?.avatarUrl} 
                                    alt="My profile" 
                                    className="w-6 h-6 rounded-full transform transition-transform group-hover:scale-110"
                                />
                                <span className="ml-4 font-semibold text-base text-gray-900 dark:text-gray-100">Profile</span>
                            </a>
                        </>
                    )}
                </div>
                <div className="mt-auto pb-4">
                     <NavItem 
                        icon={theme === 'light' ? <MoonIcon /> : <SunIcon />} 
                        label={theme === 'light' ? 'Dark mode' : 'Light mode'} 
                        onClick={toggleTheme}
                     />
                     {currentUser && <NavItem icon={<LogoutIcon />} label="Logout" onClick={logout} />}
                </div>
            </nav>
        </aside>
    );
};
