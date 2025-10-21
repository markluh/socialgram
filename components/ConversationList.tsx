import React from 'react';
import { Conversation } from '../types';
import { currentUser } from '../services/api';

interface ConversationListProps {
    conversations: Conversation[];
    selectedConversationId: string | null;
    onSelectConversation: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({ conversations, selectedConversationId, onSelectConversation }) => {
    return (
        <div className="w-full md:w-1/3 border-r border-gray-300 dark:border-gray-700 flex-shrink-0">
            <div className="p-4 border-b border-gray-300 dark:border-gray-700">
                <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100 text-center">Chats</h2>
            </div>
            <div className="overflow-y-auto h-[calc(100%-65px)]">
                {conversations.map(convo => {
                    const otherUser = convo.participants.find(p => p.username !== currentUser.username);
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
                                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{otherUser.username}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{lastMessage?.text}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
