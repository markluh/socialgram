import React from 'react';

interface TextWithMentionsProps {
    text: string;
    onNavigate: (page: 'profile', username: string) => void;
}

export const TextWithMentions: React.FC<TextWithMentionsProps> = ({ text, onNavigate }) => {
    if (!text) return null;

    const mentionRegex = /@(\w+)/g;
    const parts = text.split(mentionRegex);

    return (
        <span>
            {parts.map((part, index) => {
                if (index % 2 === 1) { // It's a username
                    return (
                        <span
                            key={index}
                            className="text-blue-500 dark:text-blue-400 cursor-pointer hover:underline"
                            onClick={(e) => {
                                e.stopPropagation();
                                onNavigate('profile', part);
                            }}
                        >
                            @{part}
                        </span>
                    );
                }
                return <React.Fragment key={index}>{part}</React.Fragment>;
            })}
        </span>
    );
};
