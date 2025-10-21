import React from 'react';

export const PlusIcon: React.FC<{className?: string}> = ({ className = "w-6 h-6" }) => {
    return (
        <svg aria-label="New post" className={className} color="currentColor" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
            <path d="M2 12h20M12 2v20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
        </svg>
    );
};