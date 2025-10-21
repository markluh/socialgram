import React from 'react';
import { Notification } from '../types';
import { VideoPostIcon } from './icons/VideoPostIcon';

interface NotificationItemProps {
    notification: Notification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
    
    const renderContent = () => {
        switch (notification.type) {
            case 'like':
                return (
                    <p>
                        <span className="font-semibold">{notification.user.username}</span> liked your post.
                        <span className="text-gray-500 dark:text-gray-400"> {notification.timestamp}</span>
                    </p>
                );
            case 'comment':
                return (
                    <p>
                        <span className="font-semibold">{notification.user.username}</span> commented: "{notification.commentText}"
                        <span className="text-gray-500 dark:text-gray-400"> {notification.timestamp}</span>
                    </p>
                );
            case 'follow':
                return (
                     <p>
                        <span className="font-semibold">{notification.user.username}</span> started following you.
                        <span className="text-gray-500 dark:text-gray-400"> {notification.timestamp}</span>
                    </p>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
            {!notification.isRead && (
                 <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
            )}
            <img 
                src={notification.user.avatarUrl} 
                alt={notification.user.username} 
                className="w-10 h-10 rounded-full mr-3 flex-shrink-0"
            />
            <div className="flex-grow text-sm text-gray-900 dark:text-gray-100">
                {renderContent()}
            </div>
            {notification.post && (
                <div className="relative w-10 h-10 ml-3 flex-shrink-0">
                    {notification.post.mediaType === 'image' ? (
                        <img 
                            src={notification.post.mediaUrl} 
                            alt="Post thumbnail" 
                            className="w-full h-full object-cover rounded-md"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                           <VideoPostIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                    )}
                </div>
            )}
            {notification.type === 'follow' && (
                 <button className="text-sm font-semibold text-white bg-blue-500 px-4 py-1 rounded-lg hover:bg-blue-600 ml-3 flex-shrink-0">
                    Follow
                </button>
            )}
        </div>
    );
};