import React, { useState, useCallback, useRef } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { PlusIcon } from './icons/PlusIcon';

interface CreatePostModalProps {
    onClose: () => void;
    onCreatePost: (imageUrl: string, caption: string) => void;
    generateCaption: (base64Image: string, mimeType: string) => Promise<string>;
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
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [caption, setCaption] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            
            setIsGenerating(true);
            try {
                const base64Image = await fileToBas64(file);
                const generatedCaption = await generateCaption(base64Image, file.type);
                setCaption(generatedCaption);
            } catch (error) {
                console.error("Error processing file or generating caption:", error);
                setCaption("Could not generate a caption for this image.");
            } finally {
                setIsGenerating(false);
            }
        }
    };

    const handleCreate = () => {
        if (imagePreview && caption) {
            onCreatePost(imagePreview, caption);
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
                    {!imagePreview ? (
                        <div 
                            className="bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-64 flex flex-col justify-center items-center cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <PlusIcon />
                            <p className="mt-2 text-gray-600 dark:text-gray-300">Select photo to upload</p>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange} 
                                accept="image/png, image/jpeg, image/gif" 
                                className="hidden" 
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <img src={imagePreview} alt="Selected preview" className="w-full max-h-80 object-contain rounded-lg"/>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder={isGenerating ? "Generating caption..." : "Write a caption..."}
                                className="w-full h-24 p-2 border dark:border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                                disabled={isGenerating}
                            />
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
                        disabled={!imagePreview || !caption || isGenerating}
                        className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg disabled:bg-blue-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                    >
                       Share
                    </button>
                </div>
            </div>
        </div>
    );
};