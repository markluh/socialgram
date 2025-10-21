import React, { useState, useRef, useEffect } from 'react';
import { Reel } from '../types';
import { HeartIcon } from './icons/HeartIcon';
import { CommentIcon } from './icons/CommentIcon';
import { SendIcon } from './icons/SendIcon';
import { MoreIcon } from './icons/MoreIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { VolumeUpIcon } from './icons/VolumeUpIcon';
import { VolumeOffIcon } from './icons/VolumeOffIcon';
import { ReelCommentsModal } from './ReelCommentsModal';

interface ReelCardProps {
    reel: Reel;
    onLikeToggle: (reelId: string) => void;
    onAddComment: (reelId: string, commentText: string) => void;
    onShowNotification: (message: string) => void;
    isActive: boolean;
}

export const ReelCard: React.FC<ReelCardProps> = ({ reel, onLikeToggle, onAddComment, onShowNotification, isActive }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [volume, setVolume] = useState(0.5);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            if (isActive) {
                videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            } else {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
                setIsPlaying(false);
            }
        }
    }, [isActive]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
            videoRef.current.volume = volume;
        }
    }, [isMuted, volume]);

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };
    
    const toggleMute = () => {
        setIsMuted(prev => !prev);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (newVolume > 0 && isMuted) {
            setIsMuted(false);
        } else if (newVolume === 0 && !isMuted) {
            setIsMuted(true);
        }
    };

    const handleShare = async () => {
        const reelUrl = `${window.location.origin}/#reel/${reel.id}`;
        try {
            await navigator.clipboard.writeText(reelUrl);
            onShowNotification('Link copied to clipboard!');
        } catch (err) {
            onShowNotification('Could not copy link.');
        }
    };

    return (
        <>
            <div className="w-full h-full relative rounded-lg overflow-hidden bg-black group">
                <video
                    ref={videoRef}
                    src={reel.videoUrl}
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    onClick={togglePlayPause}
                />
                
                {!isPlaying && (
                    <div 
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 pointer-events-none"
                    >
                        <PlayIcon className="w-20 h-20 text-white opacity-80" />
                    </div>
                )}
                
                {/* Info and Actions Overlay */}
                <div className="absolute bottom-16 md:bottom-20 left-0 right-0 text-white p-4 bg-gradient-to-t from-black/50 to-transparent">
                    <div className="flex items-end">
                        {/* Left Side: Info */}
                        <div className="flex-grow">
                            <div className="flex items-center mb-2">
                                <img src={reel.user.avatarUrl} alt={reel.user.username} className="w-8 h-8 rounded-full border-2 border-white" />
                                <span className="font-bold text-sm ml-2">{reel.user.username}</span>
                            </div>
                            <p className="text-sm">{reel.caption}</p>
                        </div>
                        {/* Right Side: Actions */}
                        <div className="flex flex-col items-center space-y-4">
                            <button onClick={() => onLikeToggle(reel.id)} className="flex flex-col items-center">
                                <HeartIcon isFilled={reel.isLiked} className="w-8 h-8" />
                                <span className="text-xs font-semibold">{reel.likes.toLocaleString()}</span>
                            </button>
                             <button className="flex flex-col items-center" onClick={() => setIsCommentsOpen(true)}>
                                <CommentIcon className="w-8 h-8" />
                                <span className="text-xs font-semibold">{reel.comments.length.toLocaleString()}</span>
                            </button>
                            <button onClick={handleShare}>
                                <SendIcon className="w-8 h-8" />
                            </button>
                            <button>
                                <MoreIcon className="w-8 h-8" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Video Controls Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-16 md:h-20 bg-black/30 group-hover:bg-black/50 transition-colors duration-300 flex items-center px-4">
                    <div className="flex items-center gap-4 text-white w-full">
                        <button onClick={togglePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
                            {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                        </button>
                        <button onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
                            {isMuted ? <VolumeOffIcon className="w-7 h-7" /> : <VolumeUpIcon className="w-7 h-7" />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-24 h-1 accent-white cursor-pointer"
                            aria-label="Volume control"
                        />
                    </div>
                </div>
            </div>
            {isCommentsOpen && (
                <ReelCommentsModal
                    reel={reel}
                    onClose={() => setIsCommentsOpen(false)}
                    onAddComment={onAddComment}
                />
            )}
        </>
    );
};