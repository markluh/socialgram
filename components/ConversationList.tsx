import React from 'react';
import { Conversation } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ConversationListProps {
    conversations: Conversation[];
    selectedConversationId: string | null;
    onSelectConversation: (id: string) => void;
}

const formatConversationTimestamp = (isoString?: string): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSeconds < 60) return `Just now`;
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const ConversationList: React.FC<ConversationListProps> = ({ conversations, selectedConversationId, onSelectConversation }) => {
    const { currentUser } = useAuth();
    return (
        <div className="w-full md:w-1/3 border-r border-gray-300 dark:border-gray-700 flex-shrink-0">
            <div className="p-4 border-b border-gray-300 dark:border-gray-700">
                <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100 text-center">Chats</h2>
            </div>
            <div className="overflow-y-auto h-[calc(100%-65px)]">
                {conversations.map(convo => {
                    const otherUser = convo.participants.find(p => p.username !== currentUser?.username);
                    if (!otherUser) return null;
                    const lastMessage = convo.messages[convo.messages.length - 1];
                    const isSelected = convo.id === selectedConversationId;

                    return (
                        <div
                            key={convo.id}
                            onClick={() => onSelectConversation(convo.id)}
                            className={`flex items-center p-3 cursor-pointer transition-colors ${
                                isSelected ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            <img src={otherUser.avatarUrl} alt={otherUser.username} className="w-12 h-12 rounded-full" />
                            <div className="ml-3 overflow-hidden">
                                <div className="flex justify-between items-baseline">
                                     <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate pr-2">{otherUser.username}</p>
                                     <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{formatConversationTimestamp(lastMessage?.timestamp)}</p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{lastMessage?.text}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};