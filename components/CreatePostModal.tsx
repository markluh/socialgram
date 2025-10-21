import React, { useState, useCallback, useRef } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { PlusIcon } from './icons/PlusIcon';
import { useAuth } from '../contexts/AuthContext';

interface CreatePostModalProps {
    onClose: () => void;
    onCreatePost: (formData: FormData) => void;
    generateCaption: (base64Media: string, mimeType: string) => Promise<string>;
}

const fileToBas64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onCreatePost, generateCaption }) => {
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [caption, setCaption] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { currentUser } = useAuth();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setMediaFile(file);
            const previewUrl = URL.createObjectURL(file);
            setMediaPreview(previewUrl);
            setMediaType(file.type.startsWith('video') ? 'video' : 'image');
            
            setIsGenerating(true);
            try {
                const base64Media = await fileToBas64(file);
                const generatedCaption = await generateCaption(base64Media, file.type);
                setCaption(generatedCaption);
            } catch (error) {
                console.error("Error processing file or generating caption:", error);
                setCaption("Could not generate a caption for this media.");
            } finally {
                setIsGenerating(false);
            }
        }
    };

    const handleCreate = () => {
        if (mediaFile && caption) {
            const formData = new FormData();
            formData.append('media', mediaFile);
            formData.append('caption', caption);
            onCreatePost(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow-lg w-full max-w-md m-4 transform transition-all">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-semibold">Create new post</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-4">
                    {!mediaPreview ? (
                        <div 
                            className="bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-64 flex flex-col justify-center items-center cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <PlusIcon />
                            <p className="mt-2 text-gray-600 dark:text-gray-300">Select photo or video</p>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange} 
                                accept="image/png, image/jpeg, image/gif, video/mp4" 
                                className="hidden" 
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                             {mediaType === 'image' ? (
                                <img src={mediaPreview} alt="Selected preview" className="w-full max-h-80 object-contain rounded-lg"/>
                            ) : (
                                <video src={mediaPreview} controls className="w-full max-h-80 object-contain rounded-lg" />
                            )}
                             <div className="flex items-center">
                                <img src={currentUser?.avatarUrl} alt="Your avatar" className="w-8 h-8 rounded-full mr-3" />
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder={isGenerating ? "Generating caption..." : "Write a caption..."}
                                    className="w-full h-24 p-2 border dark:border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                                    disabled={isGenerating}
                                />
                            </div>
                             {isGenerating && (
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100 mr-2"></div>
                                    Gemini is thinking...
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t dark:border-gray-700">
                    <button 
                        onClick={handleCreate}
                        disabled={!mediaFile || !caption || isGenerating}
                        className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg disabled:bg-blue-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                    >
                       Share
                    </button>
                </div>
            </div>
        </div>
    );
};