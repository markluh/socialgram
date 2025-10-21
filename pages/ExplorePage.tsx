import React from 'react';
import { Post } from '../types';
import { ExploreGridItem } from '../components/ExploreGridItem';

interface ExplorePageProps {
    posts: Post[];
    onPostClick: (post: Post) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ posts, onPostClick }) => {
    return (
        <main className="w-full max-w-[935px] pt-16 md:pt-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 px-4 md:px-0">Explore</h1>
            <div className="grid grid-cols-3 gap-1 md:gap-4">
                {posts.map(post => (
                    <ExploreGridItem key={post.id} post={post} onClick={() => onPostClick(post)} />
                ))}
            </div>
        </main>
    );
};