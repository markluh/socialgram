import React from 'react';

interface IconProps {
    isFilled?: boolean;
    className?: string;
}

export const BookmarkIcon: React.FC<IconProps> = ({ isFilled = false, className = "w-6 h-6" }) => {
    if (isFilled) {
        return (
            <svg aria-label="Remove" className={className} color="currentColor" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                <path d="M20 22a.999.999 0 0 1-.649-.23l-7.351-5.94-7.351 5.94A1 1 0 0 1 3 21V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v17a1 1 0 0 1-.351.77Z"></path>
            </svg>
        );
    }
    return (
        <svg aria-label="Save" className={className} color="currentColor" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
            <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
        </svg>
    );
};