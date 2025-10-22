import React from 'react';

export const RepostIcon: React.FC<{className?: string}> = ({ className = "w-6 h-6" }) => {
    return (
        <svg aria-label="Repost" className={className} color="currentColor" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
            <path d="M19.998 9.497a1 1 0 0 0-1 1v4.228a3.274 3.274 0 0 1-3.27 3.27h-5.313l1.791-1.787a1 1 0 0 0-1.412-1.416L7.29 18.287a1.004 1.004 0 0 0 0 1.414l3.298 3.298a1 1 0 1 0 1.414-1.414l-1.83-1.829h5.314a5.277 5.277 0 0 0 5.27-5.27V10.5a1 1 0 0 0-1-1.003Zm-15.999-4.99a1 1 0 0 0 1-1V3.273a3.274 3.274 0 0 1 3.27-3.27h5.313l-1.791 1.787a1 1 0 1 0 1.412 1.416l3.29-3.297a1.004 1.004 0 0 0 0-1.414L13.71.293a1 1 0 1 0-1.414 1.414l1.83 1.829H7.272a5.277 5.277 0 0 0-5.27 5.27v4.228a1 1 0 0 0 2 0V8.503Z"></path>
        </svg>
    );
};
