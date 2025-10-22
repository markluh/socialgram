import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

interface GenerateVideoModalProps {
    onClose: () => void;
    onCreatePost: (videoBlob: Blob, caption: string) => void;
}

type Status = 'initial' | 'needs_api_key' | 'generating' | 'preview' | 'error';
type AspectRatio = '9:16' | '16:9';
type Resolution = '720p' | '1080p';

export const GenerateVideoModal: React.FC<GenerateVideoModalProps> = ({ onClose, onCreatePost }) => {
    const { currentUser } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
    const [resolution, setResolution] = useState<Resolution>('720p');
    const [caption, setCaption] = useState('');

    const [status, setStatus] = useState<Status>('initial');
    const [progressMessage, setProgressMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [generatedVideoBlob, setGeneratedVideoBlob] = useState<Blob | null>(null);

    const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

    useEffect(() => {
        // @ts-ignore
        if (window.aistudio?.hasSelectedApiKey) {
            // @ts-ignore
            window.aistudio.hasSelectedApiKey().then(setHasApiKey);
        }
    }, []);

    const handleSelectKey = async () => {
        // @ts-ignore
        if (window.aistudio?.openSelectKey) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            // Optimistically assume key was selected
            setHasApiKey(true);
            setStatus('initial');
        }
    };
    
    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setErrorMessage('Please enter a prompt.');
            setStatus('error');
            return;
        }

        // @ts-ignore
        const keySelected = await window.aistudio?.hasSelectedApiKey();
        if (!keySelected) {
            setStatus('needs_api_key');
            return;
        }

        setStatus('generating');
        setProgressMessage('Waking up the AI...');
        setErrorMessage('');

        try {
            const { videoBlob } = await api.generateVideo(prompt, aspectRatio, resolution, setProgressMessage);
            const url = URL.createObjectURL(videoBlob);
            setGeneratedVideoUrl(url);
            setGeneratedVideoBlob(videoBlob);
            setStatus('preview');
        } catch (error: any) {
            console.error('Video generation failed:', error);
            if (error.message === 'API_KEY_INVALID') {
                setErrorMessage('Your API Key is invalid. Please select a valid key to continue.');
                setHasApiKey(false);
                setStatus('needs_api_key');
            } else {
                setErrorMessage(error.message || 'An unknown error occurred during video generation.');
                setStatus('error');
            }
        }
    };
    
    const handleShare = () => {
        if (generatedVideoBlob && caption) {
            onCreatePost(generatedVideoBlob, caption);
        }
    };
    
    const renderContent = () => {
        switch (status) {
            case 'needs_api_key':
                return (
                     <div className="text-center p-8">
                        <h3 className="text-lg font-semibold mb-2">API Key Required</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                           {errorMessage || "Video generation with Veo requires a personal API key."}
                        </p>
                        <button
                            onClick={handleSelectKey}
                            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Select API Key to Continue
                        </button>
                         <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:underline mt-4 block">
                            Learn about billing
                        </a>
                    </div>
                );
            case 'generating':
                return (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-gray-700 dark:text-gray-300">{progressMessage}</p>
                    </div>
                );
            case 'preview':
                return (
                    <div className="space-y-4">
                        <video src={generatedVideoUrl!} controls autoPlay loop className="w-full max-h-80 object-contain rounded-lg bg-black" />
                        <div className="flex items-center">
                            <img src={currentUser?.avatarUrl} alt="Your avatar" className="w-8 h-8 rounded-full mr-3" />
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Write a caption..."
                                className="w-full h-24 p-2 border dark:border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                            />
                        </div>
                    </div>
                );
             case 'error':
                 return (
                    <div className="text-center p-8">
                        <h3 className="text-lg font-semibold text-red-500 mb-2">Generation Failed</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{errorMessage}</p>
                        <button
                            onClick={() => setStatus('initial')}
                            className="w-full bg-gray-500 text-white font-semibold py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                 );
            case 'initial':
            default:
                return (
                    <div className="space-y-4">
                         <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="A cinematic shot of a hamster piloting a tiny spaceship..."
                            className="w-full h-28 p-2 border dark:border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Aspect Ratio</label>
                                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="w-full p-2 mt-1 border dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="9:16">Portrait (9:16)</option>
                                    <option value="16:9">Landscape (16:9)</option>
                                </select>
                            </div>
                             <div>
                                <label className="text-sm font-medium">Resolution</label>
                                <select value={resolution} onChange={(e) => setResolution(e.target.value as Resolution)} className="w-full p-2 mt-1 border dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="720p">720p (Fast)</option>
                                    <option value="1080p">1080p (High Quality)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
        }
    };
    
    const isInitial = status === 'initial';
    const isPreview = status === 'preview';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow-lg w-full max-w-md m-4 transform transition-all">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-blue-500" />
                        Generate Video with AI
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-4">
                    {renderContent()}
                </div>
                {(isInitial || isPreview) && (
                    <div className="p-4 border-t dark:border-gray-700">
                        <button 
                            onClick={isInitial ? handleGenerate : handleShare}
                            disabled={isPreview ? (!generatedVideoBlob || !caption) : !prompt}
                            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg disabled:bg-blue-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                        >
                           {isInitial ? 'Generate' : 'Share'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};