import React from 'react';

export const PlayIcon: React.FC<{className?: string}> = ({ className = "w-6 h-6" }) => (
    <svg 
        className={className} 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Play video"
    >
        <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
);