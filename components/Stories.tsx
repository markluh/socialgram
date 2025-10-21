
import React from 'react';
import { Story } from '../types';

interface StoriesProps {
    stories: Story[];
    onStoryClick: (index: number) => void;
}

export const Stories: React.FC<StoriesProps> = ({ stories, onStoryClick }) => {
    return (
        <section className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 mb-4">
            <div className="flex space-x-4 overflow-x-auto pb-2 -mb-2">
                {stories.map((story, index) => (
                    <div key={story.id} className="flex-shrink-0 text-center cursor-pointer group" onClick={() => onStoryClick(index)}>
                        <div className={`relative rounded-full p-0.5 w-16 h-16 flex items-center justify-center
                            ${!story.seen ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <div className="bg-white dark:bg-gray-800 p-0.5 rounded-full">
                                <img 
                                    src={story.user.avatarUrl} 
                                    alt={story.user.username} 
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                        </div>
                        <p className="text-xs mt-1 truncate w-16 text-gray-800 dark:text-gray-200 group-hover:underline">{story.user.username}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};
