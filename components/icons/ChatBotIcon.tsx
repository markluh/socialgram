import React from 'react';

export const ChatBotIcon: React.FC<{className?: string}> = ({ className = "w-6 h-6" }) => {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={className} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            aria-label="Gemini Assistant"
        >
            <path d="M12 8V4H8" />
            <path d="M12 17.5a2.5 2.5 0 01-5 0" />
            <path d="M12 17.5a2.5 2.5 0 005 0" />
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path d="M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );
};
