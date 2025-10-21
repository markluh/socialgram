import { Post, User, Story, Conversation, Message, Reel, Notification, ChatMessage, Comment } from '../types';

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error Response:", errorBody);
        throw new Error(`HTTP error! status: ${response.status} at ${endpoint}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return null; 
};


// --- AUTHENTICATION API ---
export const loginUser = (username: string, password: string): Promise<User> => {
    return apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
};

export const signUpUser = (details: { username: string; fullName: string; email: string; password: string }): Promise<User> => {
    return apiFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(details),
    });
};

export const getUserProfile = (username: string): Promise<User> => {
    return apiFetch(`/api/users/${username}`);
}


// --- DATA FETCHING API ---
export const getPosts = (): Promise<Post[]> => apiFetch('/api/posts');
export const getExplorePosts = (): Promise<Post[]> => apiFetch('/api/posts/explore');
export const getUserPosts = (username: string): Promise<Post[]> => apiFetch(`/api/users/${username}/posts`);
export const getStories = (): Promise<Story[]> => apiFetch('/api/stories');
export const getSuggestions = (): Promise<User[]> => apiFetch('/api/users/suggestions');
export const getConversations = (): Promise<Conversation[]> => apiFetch('/api/conversations');
export const getReels = (): Promise<Reel[]> => apiFetch('/api/reels');
export const getNotifications = (): Promise<Notification[]> => apiFetch('/api/notifications');


// --- DATA MUTATION & GENERATION API ---
export const generateCaption = async (base64Media: string, mimeType: string): Promise<string> => {
    const data = await apiFetch('/api/generate-caption', {
        method: 'POST',
        body: JSON.stringify({ base64Media, mimeType }),
    });
    return data.caption.trim();
};

export const createPost = async (formData: FormData): Promise<Post> => {
    const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const createStory = async (formData: FormData): Promise<Story> => {
    const response = await fetch('/api/stories', {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const likePost = (postId: string): Promise<void> => {
    return apiFetch(`/api/posts/${postId}/like`, { method: 'POST' });
};

export const unlikePost = (postId: string): Promise<void> => {
    return apiFetch(`/api/posts/${postId}/like`, { method: 'DELETE' });
};

export const addComment = (postId: string, text: string): Promise<Comment> => {
    return apiFetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
    });
};

export const likeReel = (reelId: string): Promise<void> => {
    return apiFetch(`/api/reels/${reelId}/like`, { method: 'POST' });
};

export const unlikeReel = (reelId: string): Promise<void> => {
    return apiFetch(`/api/reels/${reelId}/like`, { method: 'DELETE' });
};

export const addReelComment = (reelId: string, text: string): Promise<Comment> => {
    return apiFetch(`/api/reels/${reelId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
    });
};

export const sendMessage = (recipientUsername: string, text: string): Promise<{ userMessage: Message, replyMessage: Message }> => {
    return apiFetch(`/api/messages`, {
        method: 'POST',
        body: JSON.stringify({ recipientUsername, text }),
    });
};

// --- CHATBOT ---
export const getChatbotResponse = async (history: ChatMessage[]): Promise<string> => {
    try {
        const data = await apiFetch('/api/chatbot', {
            method: 'POST',
            body: JSON.stringify({ history }),
        });
        return data.reply.trim();
    } catch (error) {
        console.error("Error getting chatbot response:", error);
        return "Sorry, I'm having a little trouble thinking right now. Please try again later.";
    }
};