import React from 'react';
import { Post } from '../types';
import { ExploreGridItem } from '../components/ExploreGridItem';
import { BookmarkIcon } from '../components/icons/BookmarkIcon';

interface SavedPageProps {
    posts: Post[];
    onPostClick: (post: Post) => void;
}

export const SavedPage: React.FC<SavedPageProps> = ({ posts, onPostClick }) => {
    return (
        <main className="w-full max-w-[935px] pt-16 md:pt-8">
            <div className="px-4 md:px-0 mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Saved Posts</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Only you can see what you've saved</p>
            </div>
            {posts.length > 0 ? (
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                    {posts.map(post => (
                        <ExploreGridItem key={post.id} post={post} onClick={() => onPostClick(post)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <div className="inline-block p-4 border-2 border-gray-800 dark:border-gray-200 rounded-full mb-4">
                        <BookmarkIcon isFilled className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-semibold">Save</h2>
                    <p>Save photos and videos that you want to see again.</p>
                </div>
            )}
        </main>
    );
};
