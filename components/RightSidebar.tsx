import React from 'react';
import { User } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface RightSidebarProps {
    suggestions: User[];
    onLoginClick: () => void;
    onFollowToggle: (username: string, isFollowing: boolean) => void;
    onNavigate: (page: 'profile', username: string) => void;
}

const SuggestionItem: React.FC<{
    user: User;
    onFollowToggle: (username: string, isFollowing: boolean) => void;
    onNavigate: (page: 'profile', username: string) => void;
}> = ({ user, onFollowToggle, onNavigate }) => (
    <div className="flex items-center py-2">
        <img 
            src={user.avatarUrl} 
            alt={user.username} 
            className="w-8 h-8 rounded-full cursor-pointer"
            onClick={() => onNavigate('profile', user.username)}
        />
        <div className="ml-3 flex-grow">
            <p 
                className="font-semibold text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
                onClick={() => onNavigate('profile', user.username)}
            >
                {user.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Suggested for you</p>
        </div>
        <button 
            onClick={() => onFollowToggle(user.username, !!user.isFollowing)}
            className={`text-xs font-semibold ${user.isFollowing ? 'text-gray-900 dark:text-gray-100' : 'text-blue-500'} hover:opacity-70`}
        >
            {user.isFollowing ? 'Following' : 'Follow'}
        </button>
    </div>
);


export const RightSidebar: React.FC<RightSidebarProps> = ({ suggestions, onLoginClick, onFollowToggle, onNavigate }) => {
    const { currentUser, logout } = useAuth();

    return (
        <aside className="h-screen sticky top-0 w-full pt-8">
            {currentUser ? (
                <div className="flex items-center py-2 mb-4">
                    <img 
                        src={currentUser?.avatarUrl} 
                        alt={currentUser?.username} 
                        className="w-14 h-14 rounded-full cursor-pointer"
                        onClick={() => onNavigate('profile', currentUser.username)}
                    />
                    <div className="ml-3 flex-grow">
                        <p 
                            className="font-semibold text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
                            onClick={() => onNavigate('profile', currentUser.username)}
                        >
                            {currentUser?.username}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.fullName}</p>
                    </div>
                    <button onClick={logout} className="text-xs font-semibold text-blue-500 hover:text-gray-900 dark:hover:text-gray-100">
                        Logout
                    </button>
                </div>
            ) : (
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center mb-6 bg-white dark:bg-gray-800">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Welcome to Socialgram</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 my-2">Log in to like posts, comment, and see your friends' stories.</p>
                    <button onClick={onLoginClick} className="w-full bg-blue-500 text-white text-sm font-semibold py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        Log In or Sign Up
                    </button>
                </div>
            )}
            
            {suggestions.length > 0 && (
                 <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-sm text-gray-500 dark:text-gray-400">Suggestions for you</p>
                    <a href="#" className="text-xs font-semibold text-gray-900 dark:text-gray-100 hover:opacity-60">See All</a>
                </div>
            )}

            <div className="space-y-2">
                {suggestions.map(user => <SuggestionItem key={user.username} user={user} onFollowToggle={onFollowToggle} onNavigate={onNavigate} />)}
            </div>

             <footer className="text-xs text-gray-400 dark:text-gray-500 mt-8 absolute bottom-4">
                <p>&copy; {new Date().getFullYear()} SOCIALGRAM</p>
            </footer>
        </aside>
    );
}
