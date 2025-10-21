
import React, { useEffect, useState } from 'react';
import { Story } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface StoryViewerProps {
    stories: Story[];
    currentIndex: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}

const STORY_DURATION = 5000; // 5 seconds

export const StoryViewer: React.FC<StoryViewerProps> = ({ stories, currentIndex, onClose, onNext, onPrev }) => {
    const [progress, setProgress] = useState(0);
    const story = stories[currentIndex];

    useEffect(() => {
        setProgress(0);
        const timer = setTimeout(onNext, STORY_DURATION);
        
        const interval = setInterval(() => {
            setProgress(p => p + (100 / (STORY_DURATION / 100)));
        }, 100);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [currentIndex, onNext]);

    if (!story) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center" onMouseDown={e => e.stopPropagation()}>
            <div className="relative w-full h-full max-w-md max-h-screen-sm flex flex-col items-center justify-center p-4">
                {/* Header */}
                <div className="absolute top-4 left-4 right-4 z-10">
                    <div className="w-full bg-gray-500 rounded-full h-1">
                        <div className="bg-white rounded-full h-1" style={{ width: `${progress}%`, transition: 'width 100ms linear' }}></div>
                    </div>
                    <div className="flex items-center mt-2 justify-between">
                         <div className="flex items-center">
                            <img src={story.user.avatarUrl} alt={story.user.username} className="w-8 h-8 rounded-full" />
                            <span className="text-white font-semibold text-sm ml-2">{story.user.username}</span>
                        </div>
                        <button onClick={onClose} className="text-white">
                            <CloseIcon className="w-8 h-8" />
                        </button>
                    </div>
                </div>
                
                {/* Image */}
                <img src={story.imageUrl} alt={`Story by ${story.user.username}`} className="max-h-full max-w-full object-contain rounded-lg" />

                {/* Navigation */}
                {currentIndex > 0 && (
                    <button onClick={onPrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75 transition-opacity">
                        <ChevronLeftIcon />
                    </button>
                )}
                {currentIndex < stories.length - 1 && (
                    <button onClick={onNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75 transition-opacity">
                        <ChevronRightIcon />
                    </button>
                )}
            </div>
        </div>
    );
};
