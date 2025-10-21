import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message } from '../types';
import { currentUser } from '../services/api';
import { SendIcon } from './icons/SendIcon';

interface ChatWindowProps {
    conversation: Conversation;
    onSendMessage: (text: string) => void;
}

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isCurrentUser = message.sender.username === currentUser.username;
    return (
        <div className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
             {!isCurrentUser && <img src={message.sender.avatarUrl} alt={message.sender.username} className="w-6 h-6 rounded-full" />}
            <div
                className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                    isCurrentUser 
                        ? 'bg-blue-500 text-white rounded-br-none' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-bl-none'
                }`}
            >
                <p className="text-sm">{message.text}</p>
            </div>
             {isCurrentUser && <img src={message.sender.avatarUrl} alt={message.sender.username} className="w-6 h-6 rounded-full" />}
        </div>
    );
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onSendMessage }) => {
    const [text, setText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const otherUser = conversation.participants.find(p => p.username !== currentUser.username);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation.messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSendMessage(text);
            setText('');
        }
    };

    if (!otherUser) {
        return <div className="flex-grow flex justify-center items-center"><p>Conversation partner not found.</p></div>
    }

    return (
        <div className="flex-grow flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center p-3 border-b border-gray-300 dark:border-gray-700">
                <img src={otherUser.avatarUrl} alt={otherUser.username} className="w-10 h-10 rounded-full" />
                <p className="ml-3 font-semibold text-gray-900 dark:text-gray-100">{otherUser.username}</p>
            </div>
            
            {/* Messages */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {conversation.messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-300 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="flex items-center border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Message..."
                        className="w-full outline-none bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <button type="submit" className="ml-2 text-blue-500 font-semibold disabled:opacity-50" disabled={!text.trim()}>
                        <SendIcon className="w-5 h-5"/>
                    </button>
                </form>
            </div>
        </div>
    );
};
