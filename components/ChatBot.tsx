import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { SendIcon } from './icons/SendIcon';
import { useAuth } from '../contexts/AuthContext';

interface ChatBotProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    onClose: () => void;
    isLoading: boolean;
}

const MessageBubble: React.FC<{ message: ChatMessage; userAvatar?: string }> = ({ message, userAvatar }) => {
    const isUser = message.sender === 'user';
    return (
        <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                 <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8V4H8" /><path d="M12 17.5a2.5 2.5 0 01-5 0" /><path d="M12 17.5a2.5 2.5 0 005 0" /><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path d="M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
            )}
            <div
                className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                    isUser 
                        ? 'bg-blue-500 text-white rounded-br-none' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                }`}
            >
                <p className="text-sm">{message.text}</p>
            </div>
             {isUser && <img src={userAvatar} alt="User" className="w-8 h-8 rounded-full" />}
        </div>
    );
};


export const ChatBot: React.FC<ChatBotProps> = ({ messages, onSendMessage, onClose, isLoading }) => {
    const [text, setText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { currentUser } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim() && !isLoading) {
            onSendMessage(text);
            setText('');
        }
    };
    
    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow-lg w-full max-w-lg h-[80vh] m-4 flex flex-col transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                 <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-semibold">Gemini Assistant</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <CloseIcon />
                    </button>
                </div>

                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <MessageBubble key={index} message={msg} userAvatar={currentUser?.avatarUrl} />
                    ))}
                     {isLoading && (
                        <div className="flex items-end gap-2 justify-start">
                            <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8V4H8" /><path d="M12 17.5a2.5 2.5 0 01-5 0" /><path d="M12 17.5a2.5 2.5 0 005 0" /><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path d="M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gray-100 dark:bg-gray-700 rounded-bl-none">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
	                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
	                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t dark:border-gray-700">
                    <form onSubmit={handleSubmit} className="flex items-center border border-gray-300 dark:border-gray-600 rounded-full px-4 py-1 focus-within:ring-2 focus-within:ring-blue-500">
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Ask Gemini anything..."
                            className="w-full outline-none bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            disabled={isLoading}
                        />
                        <button type="submit" className="ml-2 p-2 rounded-full text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!text.trim() || isLoading}>
                            <SendIcon className="w-5 h-5"/>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
