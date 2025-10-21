import React from 'react';
import { Post, User } from '../types';
import { ExploreGridItem } from '../components/ExploreGridItem';
import { GridIcon } from '../components/icons/GridIcon';

interface ProfilePageProps {
    user: User;
    posts: Post[];
    onPostClick: (post: Post) => void;
}

const StatItem: React.FC<{ value?: number; label: string }> = ({ value = 0, label }) => (
    <div className="text-center md:text-left">
        <span className="font-bold text-gray-900 dark:text-gray-100">{value.toLocaleString()}</span>
        <span className="text-gray-600 dark:text-gray-400"> {label}</span>
    </div>
);

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, posts, onPostClick }) => {
    return (
        <main className="w-full max-w-[935px] pt-16 md:pt-8 px-4">
            {/* Profile Header */}
            <header className="mb-8 md:mb-12">
                <div className="flex flex-col md:flex-row items-center">
                    <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 mb-4 md:mb-0">
                        <img src={user.avatarUrl} alt={user.username} className="w-full h-full rounded-full object-cover p-1 border-2 border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="md:ml-16 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                            <h1 className="text-2xl font-light text-gray-800 dark:text-gray-200">{user.username}</h1>
                            <button className="bg-gray-200 dark:bg-gray-700 text-sm font-semibold px-4 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Edit Profile</button>
                        </div>
                        <div className="hidden md:flex items-center space-x-8 mb-4">
                            <StatItem value={posts.length} label="posts" />
                            <StatItem value={user.followers} label="followers" />
                            <StatItem value={user.following} label="following" />
                        </div>
                         <div className="text-gray-900 dark:text-gray-100">
                            <p className="font-semibold">{user.fullName}</p>
                            <p className="text-sm whitespace-pre-line">{user.bio}</p>
                        </div>
                    </div>
                </div>
                {/* Mobile Stats */}
                 <div className="md:hidden flex justify-around items-center border-t border-b border-gray-300 dark:border-gray-700 mt-4 py-2">
                    <StatItem value={posts.length} label="posts" />
                    <StatItem value={user.followers} label="followers" />
                    <StatItem value={user.following} label="following" />
                </div>
            </header>

            {/* Posts Grid */}
            <div className="border-t border-gray-300 dark:border-gray-700">
                <div className="flex justify-center -mt-px">
                    <button className="flex items-center gap-2 py-3 border-t border-gray-900 dark:border-gray-100 text-sm font-semibold tracking-widest">
                        <GridIcon />
                        POSTS
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                    {posts.map(post => (
                        <ExploreGridItem key={post.id} post={post} onClick={() => onPostClick(post)} />
                    ))}
                </div>
                {posts.length === 0 && (
                     <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        <h2 className="text-2xl font-semibold">No Posts Yet</h2>
                        <p>When {user.username} shares photos, they will appear here.</p>
                    </div>
                )}
            </div>
        </main>
    );
};
