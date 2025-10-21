import React from 'react';

export const VideoPostIcon: React.FC<{className?: string}> = ({ className = "w-6 h-6" }) => {
    return (
       <svg aria-label="Video post" className={className} color="currentColor" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-2 17.5v-11l9 5.5-9 5.5z"></path>
       </svg>
    );
};