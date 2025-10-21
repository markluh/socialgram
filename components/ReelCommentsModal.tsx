import React, { useState, useEffect, useRef } from 'react';
import { Reel, Comment } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { useAuth } from '../contexts/AuthContext';

interface ReelCommentsModalProps {
    reel: Reel;
    onClose: () => void;
    onAddComment: (reelId: string, commentText: string) => void;
}

const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => (
    <div className={`flex items-start space-x-3 py-3 ${comment.isNew ? 'comment-fade-in' : ''}`}>
        <img src={comment.user.avatarUrl} alt={comment.user.username} className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="text-sm">
            <p>
                <span className="font-semibold mr-2">{comment.user.username}</span>
                {comment.text}
            </p>
        </div>
    </div>
);

export const ReelCommentsModal: React.FC<ReelCommentsModalProps> = ({ reel, onClose, onAddComment }) => {
    const [commentText, setCommentText] = useState('');
    const commentsContainerRef = useRef<HTMLDivElement>(null);
    const { currentUser } = useAuth();

    // Scroll to bottom when a new comment is added
    useEffect(() => {
        if (commentsContainerRef.current) {
            commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
        }
    }, [reel.comments.length]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddComment(reel.id, commentText);
        setCommentText('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-t-2xl w-full max-w-lg h-[70vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-center items-center p-4 border-b dark:border-gray-700 relative">
                    <h2 className="text-base font-semibold">Comments</h2>
                    <button onClick={onClose} className="absolute right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Comments List */}
                <div ref={commentsContainerRef} className="flex-grow p-4 overflow-y-auto">
                    {/* Original Caption */}
                    <div className="flex items-start space-x-3 pb-4 border-b dark:border-gray-700 mb-2">
                        <img src={reel.user.avatarUrl} alt={reel.user.username} className="w-8 h-8 rounded-full flex-shrink-0" />
                        <div className="text-sm">
                            <p>
                                <span className="font-semibold mr-2">{reel.user.username}</span>
                                {reel.caption}
                            </p>
                        </div>
                    </div>
                    {reel.comments.length > 0 ? (
                        reel.comments.map(comment => <CommentItem key={comment.id} comment={comment} />)
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No comments yet.</p>
                    )}
                </div>

                {/* Comment Input */}
                <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center space-x-3">
                     <img src={currentUser?.avatarUrl} alt={currentUser?.username} className="w-9 h-9 rounded-full" />
                     <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full outline-none bg-transparent text-sm placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2"
                        autoFocus
                    />
                     <button type="submit" className="text-blue-500 font-semibold disabled:opacity-50" disabled={!commentText.trim()}>
                        Post
                    </button>
                </form>
            </div>
        </div>
    );
};
