import React, { useState, useRef } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { PlusIcon } from './icons/PlusIcon';

interface CreateStoryModalProps {
    onClose: () => void;
    onCreateStory: (imageUrl: string) => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ onClose, onCreateStory }) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleCreate = () => {
        if (imagePreview) {
            onCreateStory(imagePreview);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow-lg w-full max-w-md m-4 transform transition-all">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-semibold">Create new story</h2>
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
                            <p className="mt-2 text-gray-600 dark:text-gray-300">Select photo for your story</p>
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
                        </div>
                    )}
                </div>
                <div className="p-4 border-t dark:border-gray-700">
                    <button 
                        onClick={handleCreate}
                        disabled={!imagePreview}
                        className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg disabled:bg-blue-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                    >
                       Add to your story
                    </button>
                </div>
            </div>
        </div>
    );
};