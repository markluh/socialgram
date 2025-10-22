import React, { useState } from 'react';
import { Post } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { useAuth } from '../contexts/AuthContext';
import { TextWithMentions } from './TextWithMentions';

interface RepostModalProps {
    post: Post;
    onClose: () => void;
    onRepost: (comment: string) => void;
}

export const RepostModal: React.FC<RepostModalProps> = ({ post, onClose, onRepost }) => {
    const [comment, setComment] = useState('');
    const { currentUser } = useAuth();

    const handleRepost = () => {
        onRepost(comment);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow-lg w-full max-w-md m-4 transform transition-all">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-semibold">Repost</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-4 space-y-4">
                    <div className="flex items-center">
                        <img src={currentUser?.avatarUrl} alt="Your avatar" className="w-10 h-10 rounded-full mr-3" />
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full h-20 p-2 border dark:border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                            autoFocus
                        />
                    </div>
                    
                    {/* Original Post Preview */}
                    <div className="border dark:border-gray-700 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                             <img src={post.user.avatarUrl} alt={post.user.username} className="w-6 h-6 rounded-full" />
                             <span className="font-semibold text-sm ml-2">{post.user.username}</span>
                        </div>
                        <div className="flex space-x-3">
                            {post.mediaUrl && (
                                <img src={post.mediaUrl} alt="Original post media" className="w-20 h-20 object-cover rounded" />
                            )}
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                <TextWithMentions text={post.caption} onNavigate={() => {}} />
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t dark:border-gray-700">
                    <button 
                        onClick={handleRepost}
                        className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                       Share
                    </button>
                </div>
            </div>
        </div>
    );
};
