import React from 'react';
import { Post } from '../types';
import { HeartIcon } from './icons/HeartIcon';
import { CommentIcon } from './icons/CommentIcon';
import { VideoPostIcon } from './icons/VideoPostIcon';

interface ExploreGridItemProps {
    post: Post;
    onClick: () => void;
}

export const ExploreGridItem: React.FC<ExploreGridItemProps> = ({ post, onClick }) => {
    return (
        <div 
            className="relative aspect-square cursor-pointer group"
            onClick={onClick}
        >
            {post.mediaType === 'image' ? (
                <img src={post.mediaUrl} alt={post.caption} className="w-full h-full object-cover" />
            ) : (
                <video src={post.mediaUrl} className="w-full h-full object-cover" muted loop playsInline />
            )}
            
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex justify-center items-center">
                 <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white flex items-center space-x-4">
                    <div className="flex items-center">
                        <HeartIcon isFilled className="w-5 h-5" />
                        <span className="ml-1 font-bold text-sm">{post.likes.toLocaleString()}</span>
                    </div>
                     <div className="flex items-center">
                        <CommentIcon className="w-5 h-5" />
                        <span className="ml-1 font-bold text-sm">{post.comments.length.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {post.mediaType === 'video' && (
                <div className="absolute top-2 right-2 text-white">
                   <VideoPostIcon />
                </div>
            )}
        </div>
    );
};