import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Reel } from '../types';
import { ReelCard } from '../components/ReelCard';

interface ReelsPageProps {
    reels: Reel[];
    onLikeToggle: (reelId: string) => void;
    onAddComment: (reelId: string, commentText: string) => void;
    onShowNotification: (message: string) => void;
}

export const ReelsPage: React.FC<ReelsPageProps> = ({ reels, onLikeToggle, onAddComment, onShowNotification }) => {
    const [visibleReelId, setVisibleReelId] = useState<string | null>(reels.length > 0 ? reels[0].id : null);
    const observer = useRef<IntersectionObserver | null>(null);
    const reelRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setVisibleReelId(entry.target.getAttribute('data-reel-id'));
            }
        });
    }, []);

    useEffect(() => {
        observer.current = new IntersectionObserver(observerCallback, {
            root: null,
            rootMargin: '0px',
            threshold: 0.6, // Fire when 60% of the item is visible
        });

        const currentRefs = reelRefs.current;
        currentRefs.forEach(reel => {
            observer.current?.observe(reel);
        });

        return () => {
            currentRefs.forEach(reel => {
                observer.current?.unobserve(reel);
            });
        };
    }, [reels, observerCallback]);


    return (
        <main className="w-full max-w-[470px] pt-16 md:pt-8 flex-grow">
            <div className="relative h-[calc(100vh-64px)] md:h-[calc(100vh-32px)] bg-black rounded-lg overflow-y-auto snap-y snap-mandatory">
                {reels.map(reel => (
                    <div 
                        key={reel.id} 
                        className="h-full w-full snap-start flex-shrink-0"
                        ref={el => {
                            if (el) reelRefs.current.set(reel.id, el);
                            else reelRefs.current.delete(reel.id);
                        }}
                        data-reel-id={reel.id}
                    >
                        <ReelCard 
                            reel={reel} 
                            onLikeToggle={onLikeToggle}
                            onAddComment={onAddComment}
                            onShowNotification={onShowNotification} 
                            isActive={visibleReelId === reel.id}
                        />
                    </div>
                ))}
            </div>
        </main>
    );
};