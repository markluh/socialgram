import React from 'react';

export const CommentIcon: React.FC<{className?: string}> = ({ className = "w-6 h-6" }) => {
    return (
        <svg aria-label="Comment" className={className} color="currentColor" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
            <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
        </svg>
    );
};