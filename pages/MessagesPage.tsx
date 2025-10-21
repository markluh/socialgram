import React, { useState, useEffect } from 'react';
import { Conversation, User, Message } from '../types';
import * as api from '../services/api';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { useAuth } from '../contexts/AuthContext';

export const MessagesPage: React.FC = () => {
    const { currentUser } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        const fetchConversations = async () => {
            setIsLoading(true);
            try {
                const convos = await api.getConversations();
                setConversations(convos);
                if (convos.length > 0) {
                    setSelectedConversationId(convos[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch conversations:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConversations();
    }, [currentUser]);

    const handleSendMessage = async (text: string) => {
        if (!selectedConversationId || !currentUser) return;
        const currentConvo = conversations.find(c => c.id === selectedConversationId);
        const otherUser = currentConvo?.participants.find(p => p.username !== currentUser.username);
        if (!otherUser) return;

        // Optimistic update for user's message
        const tempMessageId = `temp-${Date.now()}`;
        const userMessageOptimistic: Message = {
            id: tempMessageId,
            sender: currentUser,
            text: text,
            timestamp: new Date().toISOString(),
        };

        setConversations(prevConvos =>
            prevConvos.map(c =>
                c.id === selectedConversationId
                    ? { ...c, messages: [...c.messages, userMessageOptimistic] }
                    : c
            )
        );

        try {
            const { userMessage, replyMessage } = await api.sendMessage(otherUser.username, text);
            
            // Simulate the other user "typing"
            setTimeout(() => {
                setConversations(prevConvos => 
                    prevConvos.map(c => {
                        if (c.id === selectedConversationId) {
                            // Replace temp message with real one and add reply
                            const finalMessages = c.messages.filter(m => m.id !== tempMessageId);
                            return { ...c, messages: [...finalMessages, userMessage, replyMessage] };
                        }
                        return c;
                    })
                );
            }, 600);
        } catch (error) {
            console.error("Failed to send message:", error);
            // Revert optimistic update on failure
            setConversations(prevConvos =>
                prevConvos.map(c =>
                    c.id === selectedConversationId
                        ? { ...c, messages: c.messages.filter(m => m.id !== tempMessageId) }
                        : c
                )
            );
        }
    };
    
    const selectedConversation = conversations.find(c => c.id === selectedConversationId);

    return (
        <main className="w-full max-w-[935px] md:pt-8 flex flex-grow h-[calc(100vh-56px)] md:h-[calc(100vh-32px)]">
            <div className="flex w-full h-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                <ConversationList 
                    conversations={conversations}
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={setSelectedConversationId}
                />
                {isLoading ? (
                     <div className="flex-grow flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                     </div>
                ) : selectedConversation ? (
                    <ChatWindow 
                        conversation={selectedConversation}
                        onSendMessage={handleSendMessage}
                    />
                ) : (
                    <div className="flex-grow flex flex-col justify-center items-center text-gray-500 dark:text-gray-400">
                        <h2 className="text-2xl font-light">Your Messages</h2>
                        <p>Select a conversation to start chatting.</p>
                    </div>
                )}
            </div>
        </main>
    );
};