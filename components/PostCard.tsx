import React, { useState, useRef } from 'react';
import { Post } from '../types';
import { HeartIcon } from './icons/HeartIcon';
import { CommentIcon } from './icons/CommentIcon';
import { SendIcon } from './icons/SendIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { MoreIcon } from './icons/MoreIcon';

interface PostCardProps {
    post: Post;
    onLikeToggle: (postId: string) => void;
    onAddComment: (postId: string, commentText: string) => void;
    onShowNotification: (message: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLikeToggle, onAddComment, onShowNotification }) => {
    const [comment, setComment] = useState('');
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showAllComments, setShowAllComments] = useState(false);
    const [isAnimatingLike, setIsAnimatingLike] = useState(false);
    const commentInputRef = useRef<HTMLInputElement>(null);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddComment(post.id, comment);
        setComment('');
    };
    
    const handleCommentIconClick = () => {
        commentInputRef.current?.focus();
    };
    
    const handleLikeClick = () => {
        if (!post.isLiked) {
            setIsAnimatingLike(true);
        }
        onLikeToggle(post.id);
    };

    const handleShare = async () => {
        const postUrl = `${window.location.origin}/#post/${post.id}`;
        const shareData = {
            title: 'Check out this post on Socialgram!',
            text: post.caption,
            url: postUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                throw new Error('Web Share API not supported');
            }
        } catch (err) {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(postUrl);
                onShowNotification('Link copied to clipboard!');
            } catch (copyErr) {
                onShowNotification('Could not copy link.');
            }
        }
    };

    const commentsToShow = showAllComments ? post.comments : post.comments.slice(0, 2);

    return (
        <article className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden text-gray-900 dark:text-gray-100">
            {/* Post Header */}
            <div className="flex items-center p-3">
                <img src={post.user.avatarUrl} alt={post.user.username} className="w-8 h-8 rounded-full" />
                <span className="font-semibold text-sm ml-3">{post.user.username}</span>
                <button className="ml-auto">
                    <MoreIcon />
                </button>
            </div>

            {/* Post Image */}
            <img src={post.imageUrl} alt="Post content" className="w-full object-cover" />

            {/* Post Actions */}
            <div className="p-3">
                <div className="flex items-center space-x-4 mb-2">
                    <button
                        onClick={handleLikeClick}
                        onAnimationEnd={() => setIsAnimatingLike(false)}
                        className={isAnimatingLike ? 'animate-like' : ''}
                        aria-label={post.isLiked ? 'Unlike' : 'Like'}
                    >
                        <HeartIcon isFilled={post.isLiked} />
                    </button>
                    <button onClick={handleCommentIconClick} aria-label="Comment">
                        <CommentIcon />
                    </button>
                    <button onClick={handleShare} aria-label="Share post">
                        <SendIcon />
                    </button>
                    <button className="ml-auto" onClick={() => setIsBookmarked(!isBookmarked)} aria-label="Save post">
                       <BookmarkIcon isFilled={isBookmarked} />
                    </button>
                </div>

                {/* Likes Count */}
                <p className="font-semibold text-sm">{post.likes.toLocaleString()} likes</p>
                
                {/* Comment Count Indicator */}
                {post.comments.length > 2 ? (
                     <button
                        onClick={() => setShowAllComments(prev => !prev)}
                        className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:underline focus:outline-none mt-1"
                    >
                       {showAllComments ? 'Hide comments' : `View all ${post.comments.length} comments`}
                    </button>
                ) : post.comments.length > 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {post.comments.length === 1 ? `1 comment` : `${post.comments.length} comments`}
                    </p>
                ) : null}

                {/* Caption */}
                <div className="text-sm my-2">
                    <span className="font-semibold mr-2">{post.user.username}</span>
                    <span>{post.caption}</span>
                </div>

                {/* Comments */}
                <div className="space-y-1">
                    {commentsToShow.map(c => (
                        <div key={c.id} className={`text-sm ${c.isNew ? 'comment-fade-in' : ''}`}>
                            <span className="font-semibold mr-2">{c.user.username}</span>
                            <span>{c.text}</span>
                        </div>
                    ))}
                </div>
            </div>

             {/* Add Comment Form */}
            <form onSubmit={handleCommentSubmit} className="border-t border-gray-200 dark:border-gray-700 px-3 py-2">
                 <input
                    ref={commentInputRef}
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full outline-none bg-transparent text-sm placeholder-gray-500 dark:placeholder-gray-400"
                />
            </form>
        </article>
    );
};