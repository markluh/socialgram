import React, { useState, useRef, useEffect } from 'react';
import { Post, Comment } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { HeartIcon } from './icons/HeartIcon';
import { CommentIcon } from './icons/CommentIcon';
import { SendIcon } from './icons/SendIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { MoreIcon } from './icons/MoreIcon';
import { PlayIcon } from './icons/PlayIcon';
import { TextWithMentions } from './TextWithMentions';

interface PostDetailModalProps {
    post: Post;
    onClose: () => void;
    onLikeToggle: (postId: string) => void;
    onAddComment: (postId: string, commentText: string) => void;
    onShowNotification: (message: string) => void;
    onNavigate: (page: 'profile', username: string) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose, onLikeToggle, onAddComment, onShowNotification, onNavigate }) => {
    const [comment, setComment] = useState('');
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isAnimatingLike, setIsAnimatingLike] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const commentsContainerRef = useRef<HTMLDivElement>(null);

    const isRepost = !!post.repostOf;
    const postData = isRepost ? post.repostOf! : post;

     useEffect(() => {
        if (commentsContainerRef.current) {
            commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
        }
    }, [postData.comments.length]);
    
     const handleVideoClick = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play(); setIsPlaying(true);
            } else {
                videoRef.current.pause(); setIsPlaying(false);
            }
        }
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddComment(postData.id, comment);
        setComment('');
    };

    const handleLikeClick = () => {
        if (!postData.isLiked) setIsAnimatingLike(true);
        onLikeToggle(postData.id);
    };
    
    const handleShare = async () => {
        const postUrl = `${window.location.origin}/#post/${postData.id}`;
        try {
            await navigator.clipboard.writeText(postUrl);
            onShowNotification('Link copied to clipboard!');
        } catch (err) {
            onShowNotification('Could not copy link.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center" onClick={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white">
                <CloseIcon className="w-8 h-8"/>
            </button>
            <div 
                className="bg-white dark:bg-gray-800 w-full max-w-4xl h-full max-h-[90vh] flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden m-4"
                onClick={e => e.stopPropagation()}
            >
                {/* Media Side */}
                <div className="w-full md:w-1/2 bg-black flex items-center justify-center">
                    {postData.mediaType === 'image' ? (
                        <img src={postData.mediaUrl} alt={postData.caption} className="max-h-full w-auto object-contain" />
                    ) : (
                         <div className="relative w-full h-full">
                            <video ref={videoRef} src={postData.mediaUrl} className="w-full h-full object-contain" loop playsInline onClick={handleVideoClick} autoPlay />
                             {!isPlaying && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 pointer-events-none"><PlayIcon className="w-20 h-20 text-white opacity-80" /></div>}
                        </div>
                    )}
                </div>

                {/* Info & Comments Side */}
                <div className="w-full md:w-1/2 flex flex-col text-gray-900 dark:text-gray-100">
                    <div className="flex items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
                        <img src={post.user.avatarUrl} alt={post.user.username} className="w-8 h-8 rounded-full cursor-pointer" onClick={() => onNavigate('profile', post.user.username)}/>
                        <span className="font-semibold text-sm ml-3 cursor-pointer" onClick={() => onNavigate('profile', post.user.username)}>{post.user.username}</span>
                        <button className="ml-auto"><MoreIcon /></button>
                    </div>

                    <div ref={commentsContainerRef} className="flex-grow p-4 overflow-y-auto">
                        <div className="flex items-start space-x-3 mb-4">
                           <img src={postData.user.avatarUrl} alt={postData.user.username} className="w-8 h-8 rounded-full cursor-pointer" onClick={() => onNavigate('profile', postData.user.username)} />
                            <div className="text-sm">
                                <span className="font-semibold mr-2 cursor-pointer" onClick={() => onNavigate('profile', postData.user.username)}>{postData.user.username}</span>
                                <TextWithMentions text={postData.caption} onNavigate={onNavigate} />
                            </div>
                        </div>
                        <div className="space-y-4">
                        {postData.comments.map(c => (
                            <div key={c.id} className={`flex items-start space-x-3 text-sm ${c.isNew ? 'comment-fade-in' : ''}`}>
                                <img src={c.user.avatarUrl} alt={c.user.username} className="w-8 h-8 rounded-full cursor-pointer" onClick={() => onNavigate('profile', c.user.username)}/>
                                <div>
                                    <span className="font-semibold mr-2 cursor-pointer" onClick={() => onNavigate('profile', c.user.username)}>{c.user.username}</span>
                                    <TextWithMentions text={c.text} onNavigate={onNavigate} />
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                    
                    <div className="p-4 border-t dark:border-gray-700 flex-shrink-0">
                         <div className="flex items-center space-x-4 mb-2">
                            <button onClick={handleLikeClick} onAnimationEnd={() => setIsAnimatingLike(false)} className={isAnimatingLike ? 'animate-like' : ''}><HeartIcon isFilled={postData.isLiked} /></button>
                            <button><CommentIcon /></button>
                            <button onClick={handleShare}><SendIcon /></button>
                            <button className="ml-auto" onClick={() => setIsBookmarked(!isBookmarked)}><BookmarkIcon isFilled={isBookmarked} /></button>
                        </div>
                        <p className="font-semibold text-sm">{postData.likes.toLocaleString()} likes</p>
                    </div>

                    <form onSubmit={handleCommentSubmit} className="border-t dark:border-gray-700 p-4 flex-shrink-0">
                        <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." className="w-full outline-none bg-transparent text-sm" />
                    </form>
                </div>
            </div>
        </div>
    );
};