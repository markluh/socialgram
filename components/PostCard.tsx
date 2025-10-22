import React, { useState, useRef, useEffect } from 'react';
import { Post, User } from '../types';
import { HeartIcon } from './icons/HeartIcon';
import { CommentIcon } from './icons/CommentIcon';
import { SendIcon } from './icons/SendIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { MoreIcon } from './icons/MoreIcon';
import { PlayIcon } from './icons/PlayIcon';
import { RepostIcon } from './icons/RepostIcon';
import { TextWithMentions } from './TextWithMentions';
import { useAuth } from '../contexts/AuthContext';

interface PostCardProps {
    post: Post;
    onLikeToggle: (postId: string) => void;
    onAddComment: (postId: string, commentText: string) => void;
    onShowNotification: (message: string) => void;
    onRepost: (post: Post) => void;
    onNavigate: (page: 'profile', username: string) => void;
    onFollowToggle: (username: string, isFollowing: boolean) => void;
}

const PostHeader: React.FC<{ user: User, onNavigate: PostCardProps['onNavigate'], onFollowToggle: PostCardProps['onFollowToggle']}> = ({ user, onNavigate, onFollowToggle }) => {
    const { currentUser } = useAuth();
    const isCurrentUser = currentUser?.username === user.username;

    return (
        <div className="flex items-center p-3">
            <img 
                src={user.avatarUrl} 
                alt={user.username} 
                className="w-8 h-8 rounded-full cursor-pointer"
                onClick={() => onNavigate('profile', user.username)}
            />
            <span 
                className="font-semibold text-sm ml-3 cursor-pointer"
                onClick={() => onNavigate('profile', user.username)}
            >
                {user.username}
            </span>
            {!isCurrentUser && (
                <>
                    <span className="text-gray-500 dark:text-gray-400 mx-2">&bull;</span>
                    <button 
                        onClick={() => onFollowToggle(user.username, !!user.isFollowing)}
                        className="text-sm font-semibold text-blue-500 hover:text-gray-900 dark:hover:text-blue-400 dark:hover:text-white"
                    >
                        {user.isFollowing ? 'Following' : 'Follow'}
                    </button>
                </>
            )}
            <button className="ml-auto">
                <MoreIcon />
            </button>
        </div>
    );
};

export const PostCard: React.FC<PostCardProps> = ({ post, onLikeToggle, onAddComment, onShowNotification, onRepost, onNavigate, onFollowToggle }) => {
    const { currentUser } = useAuth();
    const [comment, setComment] = useState('');
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showAllComments, setShowAllComments] = useState(false);
    const [isAnimatingLike, setIsAnimatingLike] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const commentInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const prevCommentsLengthRef = useRef<number>(post.comments.length);

    const isRepost = !!post.repostOf;
    const postData = isRepost ? post.repostOf! : post;

    useEffect(() => {
        if (postData.comments.length > prevCommentsLengthRef.current) {
            setShowAllComments(true);
        }
        prevCommentsLengthRef.current = postData.comments.length;
    }, [postData.comments.length]);
    
    const handleVideoClick = () => { if (videoRef.current) { if (videoRef.current.paused) videoRef.current.play(); else videoRef.current.pause(); } };
    useEffect(() => {
        const videoElement = videoRef.current; if (!videoElement) return;
        const onPlay = () => setIsPlaying(true); const onPause = () => setIsPlaying(false);
        videoElement.addEventListener('play', onPlay); videoElement.addEventListener('pause', onPause);
        return () => { videoElement.removeEventListener('play', onPlay); videoElement.removeEventListener('pause', onPause); };
    }, []);

    const handleCommentSubmit = (e: React.FormEvent) => { e.preventDefault(); onAddComment(postData.id, comment); setComment(''); };
    const handleCommentIconClick = () => { if (currentUser) commentInputRef.current?.focus(); else onAddComment(postData.id, ''); };
    const handleLikeClick = () => { if (!postData.isLiked) setIsAnimatingLike(true); onLikeToggle(postData.id); };

    const handleShare = async () => {
        const postUrl = `${window.location.origin}/#post/${postData.id}`;
        try { if (navigator.share) await navigator.share({ title: 'Check out this post!', text: postData.caption, url: postUrl }); else throw new Error(); } 
        catch (err) { try { await navigator.clipboard.writeText(postUrl); onShowNotification('Link copied to clipboard!'); } catch (copyErr) { onShowNotification('Could not copy link.'); } }
    };
    const handleBookmark = () => { if (currentUser) setIsBookmarked(!isBookmarked); else onLikeToggle(postData.id); };
    
    const commentsToShow = showAllComments ? postData.comments : postData.comments.slice(0, 2);

    return (
        <article className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden text-gray-900 dark:text-gray-100">
            {isRepost && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 p-3 pt-2 pb-0">
                    <RepostIcon className="w-4 h-4 mr-2" />
                    <span 
                        className="font-semibold cursor-pointer hover:underline"
                        onClick={() => onNavigate('profile', post.user.username)}
                    >
                        {post.user.username}
                    </span>
                    <span className="ml-1">reposted</span>
                </div>
            )}
            <PostHeader user={isRepost ? postData.user : post.user} onNavigate={onNavigate} onFollowToggle={onFollowToggle} />
            {isRepost && post.caption && (
                 <div className="px-3 pb-2 text-sm">
                    <TextWithMentions text={post.caption} onNavigate={onNavigate} />
                 </div>
            )}
            {postData.mediaUrl && (
                <div className="relative">
                     {postData.mediaType === 'image' ? (
                        <img src={postData.mediaUrl} alt="Post content" className="w-full object-cover" />
                    ) : (
                        <div className="relative"><video ref={videoRef} src={postData.mediaUrl} className="w-full object-cover" loop playsInline onClick={handleVideoClick} />
                             {!isPlaying && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 pointer-events-none"><PlayIcon className="w-20 h-20 text-white opacity-80" /></div>}
                        </div>
                    )}
                </div>
            )}
            <div className="p-3">
                <div className="flex items-center space-x-4 mb-2">
                    <button onClick={handleLikeClick} onAnimationEnd={() => setIsAnimatingLike(false)} className={isAnimatingLike ? 'animate-like' : ''} aria-label="Like"><HeartIcon isFilled={postData.isLiked} /></button>
                    <button onClick={handleCommentIconClick} aria-label="Comment"><CommentIcon /></button>
                    <button onClick={() => onRepost(post)} aria-label="Repost"><RepostIcon /></button>
                    <button onClick={handleShare} aria-label="Share post" className="ml-0 mr-auto"><SendIcon /></button>
                    <button onClick={handleBookmark} aria-label="Save post"><BookmarkIcon isFilled={isBookmarked} /></button>
                </div>
                <p className="font-semibold text-sm">{postData.likes.toLocaleString()} likes</p>
                <div className="text-sm my-2">
                    <span className="font-semibold mr-2 cursor-pointer" onClick={() => onNavigate('profile', postData.user.username)}>{postData.user.username}</span>
                    <TextWithMentions text={postData.caption} onNavigate={onNavigate} />
                </div>
                {postData.comments.length > 0 && (
                    <div className="space-y-1">
                        {commentsToShow.map(c => (
                            <div key={c.id} className={`text-sm ${c.isNew ? 'comment-fade-in' : ''}`}>
                                <span className="font-semibold mr-2 cursor-pointer" onClick={() => onNavigate('profile', c.user.username)}>{c.user.username}</span>
                                <TextWithMentions text={c.text} onNavigate={onNavigate} />
                            </div>
                        ))}
                    </div>
                )}
                {postData.comments.length > 2 && <button onClick={() => setShowAllComments(p => !p)} className="text-sm text-gray-500 dark:text-gray-400 mt-1">{showAllComments ? 'Hide comments' : `View all ${postData.comments.length} comments`}</button>}
            </div>
             {currentUser && (
                <form onSubmit={handleCommentSubmit} className="border-t border-gray-200 dark:border-gray-700 px-3 py-2">
                    <input ref={commentInputRef} type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." className="w-full outline-none bg-transparent text-sm" />
                </form>
             )}
        </article>
    );
};
