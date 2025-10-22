import React, { useState, useEffect } from 'react';
import { Post, User } from '../types';
import * as api from '../services/api';
import { ExploreGridItem } from '../components/ExploreGridItem';
import { GridIcon } from '../components/icons/GridIcon';
import { useAuth } from '../contexts/AuthContext';

interface ProfilePageProps {
    username: string;
    onPostClick: (post: Post) => void;
    onFollowToggle: (username: string, isFollowing: boolean) => void;
    onNavigate: (page: 'profile', username: string) => void;
}

const StatItem: React.FC<{ value?: number; label: string }> = ({ value = 0, label }) => (
    <div className="text-center md:text-left">
        <span className="font-bold text-gray-900 dark:text-gray-100">{value.toLocaleString()}</span>
        <span className="text-gray-600 dark:text-gray-400"> {label}</span>
    </div>
);

export const ProfilePage: React.FC<ProfilePageProps> = ({ username, onPostClick, onFollowToggle }) => {
    const { currentUser } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const isCurrentUserProfile = currentUser?.username === username;

    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                const [userData, userPosts] = await Promise.all([
                    api.getUser(username),
                    api.getUserPosts(username)
                ]);
                setUser(userData);
                setPosts(userPosts);
            } catch (error) {
                console.error("Failed to fetch profile data:", error);
                setUser(null); // Handle user not found
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfileData();
    }, [username]);

    const handleFollowClick = () => {
        if (user) {
            onFollowToggle(user.username, !!user.isFollowing);
            // Optimistic update for the local user object
            setUser(prevUser => prevUser ? {
                ...prevUser,
                isFollowing: !prevUser.isFollowing,
                followers: (prevUser.followers || 0) + (prevUser.isFollowing ? -1 : 1)
            } : null);
        }
    };
    
    if (isLoading) {
        return (
            <main className="w-full max-w-[935px] pt-16 md:pt-8 px-4 flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </main>
        );
    }
    
    if (!user) {
         return (
            <main className="w-full max-w-[935px] pt-16 md:pt-8 px-4 text-center">
                <h1 className="text-2xl font-bold">User not found.</h1>
                <p>Sorry, this user doesn't exist.</p>
            </main>
        );
    }

    const renderFollowButton = () => {
        if (isCurrentUserProfile) {
            return <button className="bg-gray-200 dark:bg-gray-700 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 w-full md:w-auto">Edit Profile</button>;
        }
        if (user.isFollowing) {
            return <button onClick={handleFollowClick} className="bg-gray-200 dark:bg-gray-700 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 w-full md:w-auto">Following</button>;
        }
        return <button onClick={handleFollowClick} className="bg-blue-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-600 w-full md:w-auto">Follow</button>;
    };

    return (
        <main className="w-full max-w-[935px] pt-16 md:pt-8 px-4">
            <header className="mb-8 md:mb-12">
                <div className="flex flex-col md:flex-row items-center">
                    <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 mb-4 md:mb-0">
                        <img src={user.avatarUrl} alt={user.username} className="w-full h-full rounded-full object-cover p-1 border-2 border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="md:ml-16 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 mb-4">
                            <h1 className="text-2xl font-light text-gray-800 dark:text-gray-200">{user.username}</h1>
                            {renderFollowButton()}
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
                <div className="md:hidden flex justify-around items-center border-t border-b border-gray-300 dark:border-gray-700 mt-4 py-2">
                    <StatItem value={posts.length} label="posts" />
                    <StatItem value={user.followers} label="followers" />
                    <StatItem value={user.following} label="following" />
                </div>
            </header>

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
