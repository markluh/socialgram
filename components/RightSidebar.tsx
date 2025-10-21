
import React from 'react';
import { User } from '../types';

interface RightSidebarProps {
    suggestions: User[];
}

const SuggestionItem: React.FC<{user: User}> = ({ user }) => (
    <div className="flex items-center py-2">
        <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 rounded-full" />
        <div className="ml-3 flex-grow">
            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{user.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Suggested for you</p>
        </div>
        <button className="text-xs font-semibold text-blue-500 hover:text-gray-900 dark:hover:text-gray-100">
            Follow
        </button>
    </div>
);


export const RightSidebar: React.FC<RightSidebarProps> = ({ suggestions }) => {
    return (
        <aside className="h-screen sticky top-0 w-full pt-8">
             <div className="flex items-center py-2 mb-4">
                <img src="https://i.pravatar.cc/150?u=currentUser" alt="currentUser" className="w-14 h-14 rounded-full" />
                <div className="ml-3 flex-grow">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">currentUser</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current User</p>
                </div>
                <button className="text-xs font-semibold text-blue-500 hover:text-gray-900 dark:hover:text-gray-100">
                    Switch
                </button>
            </div>
            
            <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-sm text-gray-500 dark:text-gray-400">Suggestions for you</p>
                <a href="#" className="text-xs font-semibold text-gray-900 dark:text-gray-100 hover:opacity-60">See All</a>
            </div>

            <div className="space-y-2">
                {suggestions.map(user => <SuggestionItem key={user.username} user={user} />)}
            </div>

             <footer className="text-xs text-gray-400 dark:text-gray-500 mt-8 absolute bottom-4">
                <p>&copy; {new Date().getFullYear()} SOCIALGRAM</p>
            </footer>
        </aside>
    );
}