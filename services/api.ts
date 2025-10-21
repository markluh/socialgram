import { GoogleGenAI, Type } from "@google/genai";
import { Post, Comment, User, Story, Conversation, Message } from '../types';

// --- MOCK DATABASE & CONSTANTS ---

const FAKE_USERNAMES = [
    'photoFanatic', 'travelExplorer', 'foodieAdventures', 'artLover', 'natureWhisperer',
    'urbanJungle', 'styleMaven', 'codeWizard', 'fitnessFreak', 'bookwormBites',
    'creativeCoder', 'pixelPerfect', 'designDiva', 'wanderlustSoul', 'gourmetGuru'
];

export const currentUser: User = {
    username: "currentUser",
    avatarUrl: "https://i.pravatar.cc/150?u=currentUser"
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- UTILITY FUNCTIONS ---

// A simple delay to simulate network latency
const apiDelay = () => new Promise(res => setTimeout(res, Math.random() * 500 + 200));

function getRandomUser(excludeUsername?: string): User {
    let username;
    do {
        username = FAKE_USERNAMES[Math.floor(Math.random() * FAKE_USERNAMES.length)];
    } while (username === excludeUsername);
    
    return {
        username,
        avatarUrl: `https://i.pravatar.cc/150?u=${username}`
    };
}


// --- API FUNCTIONS ---

export const getPosts = async (): Promise<Post[]> => {
    await apiDelay();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Generate 5 realistic social media posts. For each post, provide a detailed description of an image for a placeholder, a creative and engaging caption with 2-3 hashtags, and a random number of likes between 10 and 1000. Also, generate between 2 and 4 comments for each post, with each comment having a username and some text. Format the entire output as a single JSON array.",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            imageDescription: { type: Type.STRING },
                            caption: { type: Type.STRING },
                            likes: { type: Type.INTEGER },
                            comments: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        username: { type: Type.STRING },
                                        text: { type: Type.STRING }
                                    },
                                    required: ['username', 'text']
                                }
                            }
                        },
                        required: ['imageDescription', 'caption', 'likes', 'comments']
                    }
                }
            }
        });

        const generatedData = JSON.parse(response.text);

        const posts: Post[] = generatedData.map((p: any, index: number) => ({
            id: `post-${Date.now()}-${index}`,
            user: getRandomUser(),
            imageUrl: `https://picsum.photos/600/600?random=${index}`,
            caption: p.caption,
            likes: p.likes,
            isLiked: false,
            comments: p.comments.map((c: any, cIndex: number) => ({
                id: `comment-${Date.now()}-${index}-${cIndex}`,
                user: { username: c.username, avatarUrl: `https://i.pravatar.cc/150?u=${c.username}` },
                text: c.text
            })),
        }));

        return posts;

    } catch (error) {
        console.error("Error generating initial feed:", error);
        return [
            {
                id: 'fallback-1',
                user: { username: 'ErrorUser', avatarUrl: 'https://i.pravatar.cc/150?u=error' },
                imageUrl: 'https://picsum.photos/600/600?random=error',
                caption: 'Could not load posts from Gemini. This is a fallback post!',
                likes: 42,
                isLiked: false,
                comments: [{ id: 'fc-1', user: { username: 'debugBot', avatarUrl: 'https://i.pravatar.cc/150?u=debug' }, text: 'Check the console for API errors.' }]
            }
        ];
    }
};

export const generateCaption = async (base64Image: string, mimeType: string): Promise<string> => {
    await apiDelay();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Image } },
                    { text: "You are a social media expert. Write a short, engaging, and creative Instagram-style caption for this image. Include 2-3 relevant hashtags. Keep it under 50 words." },
                ],
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating caption:", error);
        return "A beautiful moment captured.";
    }
};

export const getStories = async (): Promise<Story[]> => {
    await apiDelay();
    const storyUsers = FAKE_USERNAMES.slice(0, 10);
    return storyUsers.map((username, index) => ({
        id: `story-${Date.now()}-${index}`,
        user: { username, avatarUrl: `https://i.pravatar.cc/150?u=${username}` },
        imageUrl: `https://picsum.photos/1080/1920?random=story-${index}`,
        seen: Math.random() > 0.7,
    }));
};

export const getSuggestions = async (): Promise<User[]> => {
    await apiDelay();
    const suggestionUsernames = FAKE_USERNAMES.slice(10, 15);
    return suggestionUsernames.map(username => ({
        username,
        avatarUrl: `https://i.pravatar.cc/150?u=${username}`
    }));
};

export const getConversations = async (): Promise<Conversation[]> => {
    await apiDelay();
    const conversations: Conversation[] = [];
    const participants = FAKE_USERNAMES.slice(5, 10);

    for (let i = 0; i < participants.length; i++) {
        const otherUser = { username: participants[i], avatarUrl: `https://i.pravatar.cc/150?u=${participants[i]}` };
        conversations.push({
            id: `convo-${i}`,
            participants: [currentUser, otherUser],
            messages: [
                { id: `msg-${i}-1`, sender: otherUser, text: "Hey there! What's up?", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
                { id: `msg-${i}-2`, sender: currentUser, text: "Not much, just chilling.", timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString() },
            ]
        });
    }
    return conversations;
};

export const sendMessage = async (conversationId: string, text: string): Promise<{ userMessage: Message, replyMessage: Message }> => {
    await apiDelay();
    const userMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: currentUser,
        text,
        timestamp: new Date().toISOString()
    };
    
    // Generate a reply with Gemini
    let replyText = "That's cool!";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are the person the user is chatting with. Based on the last message: "${text}", write a short, conversational reply. Keep it under 20 words.`,
        });
        replyText = response.text.trim();
    } catch (error) {
        console.error("Error generating message reply:", error);
    }

    const replyMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: getRandomUser(currentUser.username), // This should be the other participant
        text: replyText,
        timestamp: new Date(Date.now() + 1000).toISOString()
    };
    
    return { userMessage, replyMessage };
};
