import React from 'react';
export const ReelsIcon: React.FC<{className?: string}> = ({ className = "w-6 h-6" }) => (
     <svg aria-label="Reels" className={className} fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
        <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
        <polygon fill="none" points="10.26 16.95 17.5 12.5 10.26 8.05 10.26 16.95" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
    </svg>
);