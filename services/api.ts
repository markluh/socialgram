import { Post, Comment, User, Story, Conversation, Message, Reel, Notification, NotificationType, ChatMessage } from '../types';

// --- MOCK DATABASE & CONSTANTS ---

const FAKE_USERNAMES = [
    'photoFanatic', 'travelExplorer', 'foodieAdventures', 'artLover', 'natureWhisperer',
    'urbanJungle', 'styleMaven', 'codeWizard', 'fitnessFreak', 'bookwormBites',
    'creativeCoder', 'pixelPerfect', 'designDiva', 'wanderlustSoul', 'gourmetGuru'
];

const MOCK_USERS: { [key: string]: { password?: string, user: User } } = {
    'currentUser': {
        password: 'password123',
        user: {
            username: "currentUser",
            avatarUrl: "https://i.pravatar.cc/150?u=currentUser",
            fullName: "Alex Doe",
            bio: "Just sharing my journey, one snapshot at a time 📸✨\nLover of coffee, code, and clear skies.",
            postsCount: 20,
            followers: 1450,
            following: 210,
        }
    }
};

FAKE_USERNAMES.forEach(username => {
    MOCK_USERS[username] = {
        user: {
            username,
            avatarUrl: `https://i.pravatar.cc/150?u=${username}`
        }
    };
});

// --- UTILITY FUNCTIONS ---

// A simple delay to simulate network latency
const apiDelay = () => new Promise(res => setTimeout(res, Math.random() * 500 + 200));

function getRandomUser(excludeUsername?: string): User {
    let username;
    do {
        username = FAKE_USERNAMES[Math.floor(Math.random() * FAKE_USERNAMES.length)];
    } while (username === excludeUsername);
    
    return MOCK_USERS[username].user;
}


// --- AUTHENTICATION API ---

export const loginUser = async (username: string, password_unused: string): Promise<User | null> => {
    await apiDelay();
    if (MOCK_USERS[username]) {
        return MOCK_USERS[username].user;
    }
    // For demo, allow login with any FAKE_USERNAME
    if (FAKE_USERNAMES.includes(username)) {
         return {
            username,
            avatarUrl: `https://i.pravatar.cc/150?u=${username}`,
            fullName: username,
            bio: "A default bio for a cool user.",
            postsCount: 10,
            followers: 100,
            following: 50,
        };
    }
    return null;
};

export const signUpUser = async (details: { username: string; fullName: string; email: string; password: string }): Promise<User | null> => {
    await apiDelay();
    if (MOCK_USERS[details.username] || FAKE_USERNAMES.includes(details.username)) {
        return null; // User already exists
    }
    const newUser: User = {
        username: details.username,
        fullName: details.fullName,
        avatarUrl: `https://i.pravatar.cc/150?u=${details.username}`,
        bio: "Just joined Socialgram! Excited to connect.",
        postsCount: 0,
        followers: 0,
        following: 0,
    };
    MOCK_USERS[details.username] = { user: newUser };
    return newUser;
};

export const getUserProfile = async (username: string): Promise<User | null> => {
    await apiDelay();
    if (MOCK_USERS[username]) {
        return MOCK_USERS[username].user;
    }
    return null;
}

// --- API FUNCTIONS ---

const POST_VIDEO_URLS = [
    'https://videos.pexels.com/video-files/3214441/3214441-sd_640_360_25fps.mp4',
    'https://videos.pexels.com/video-files/3840441/3840441-sd_540_960_30fps.mp4',
    'https://videos.pexels.com/video-files/5589146/5589146-sd_540_960_25fps.mp4',
    'https://videos.pexels.com/video-files/4493547/4493547-sd_540_960_25fps.mp4',
    'https://videos.pexels.com/video-files/8086279/8086279-sd_540_960_25fps.mp4',
];

const generatePosts = async (count: number, prompt: string, forUser?: User): Promise<Post[]> => {
    try {
        const response = await fetch('/api/generate-posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count, prompt, forUser }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const generatedData = await response.json();

        const posts: Post[] = generatedData.slice(0, count).map((p: any, index: number) => {
            const mediaType = p.mediaType as 'image' | 'video';
            const mediaUrl = mediaType === 'video' 
                ? POST_VIDEO_URLS[index % POST_VIDEO_URLS.length]
                : `https://picsum.photos/600/600?random=${Date.now()}-${index}`;

            return {
                id: `post-${Date.now()}-${index}`,
                user: forUser || getRandomUser(),
                mediaUrl,
                mediaType,
                caption: p.caption,
                likes: p.likes,
                isLiked: false,
                comments: p.comments.map((c: any, cIndex: number) => ({
                    id: `comment-${Date.now()}-${index}-${cIndex}`,
                    user: { username: c.username, avatarUrl: `https://i.pravatar.cc/150?u=${c.username}` },
                    text: c.text
                })),
            };
        });
        return posts;
    } catch (error) {
        console.error("Error generating posts:", error);
        return [
            {
                id: 'fallback-1',
                user: { username: 'ErrorUser', avatarUrl: 'https://i.pravatar.cc/150?u=error' },
                mediaUrl: 'https://picsum.photos/600/600?random=error',
                mediaType: 'image',
                caption: 'Could not load posts. This is a fallback post!',
                likes: 42,
                isLiked: false,
                comments: [{ id: 'fc-1', user: { username: 'debugBot', avatarUrl: 'https://i.pravatar.cc/150?u=debug' }, text: 'Check the server logs for API errors.' }]
            }
        ];
    }
};

export const getPosts = async (): Promise<Post[]> => {
    await apiDelay();
    const prompt = `Generate 5 realistic social media posts. Create a mix of 'image' and 'video' media types. For each post, provide a detailed description of the media, the mediaType, a creative and engaging caption with 2-3 hashtags, a random number of likes between 10 and 1000, and 2-4 comments. Format the entire output as a single JSON array.`
    return generatePosts(5, prompt);
};

export const getExplorePosts = async (): Promise<Post[]> => {
    await apiDelay();
    const prompt = `Generate 15 diverse and engaging social media posts for an "Explore" page. Ensure a good mix of 'image' and 'video' media types. For each post, provide a description of the media, the mediaType, a compelling caption, a random number of likes (50-5000), and 1-3 comments. Format as a single JSON array.`
    return generatePosts(15, prompt);
};

export const getUserPosts = async(user: User): Promise<Post[]> => {
    await apiDelay();
    const count = user.postsCount || 10;
     const prompt = `Generate ${count} realistic social media posts for a user named ${user.username}. Their bio is "${user.bio}". Create a mix of 'image' and 'video' media types that fit their personality. For each post, provide a detailed description of the media, the mediaType, a creative caption, a random number of likes, and a few comments. Format the entire output as a single JSON array.`
    return generatePosts(count, prompt, user);
}

export const generateCaption = async (base64Media: string, mimeType: string): Promise<string> => {
    await apiDelay();
    try {
        const response = await fetch('/api/generate-caption', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Media, mimeType }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.caption.trim();
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

export const getSuggestions = async (currentUser: User): Promise<User[]> => {
    await apiDelay();
    return FAKE_USERNAMES.slice(10, 15)
        .filter(username => username !== currentUser.username)
        .map(username => ({
            username,
            avatarUrl: `https://i.pravatar.cc/150?u=${username}`
        }));
};

export const getConversations = async (currentUser: User): Promise<Conversation[]> => {
    await apiDelay();
    const conversations: Conversation[] = [];
    const participants = FAKE_USERNAMES.slice(5, 10).filter(u => u !== currentUser.username);

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

export const sendMessage = async (currentUser: User, otherUser: User, text: string): Promise<{ userMessage: Message, replyMessage: Message }> => {
    await apiDelay();
    const userMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: currentUser,
        text,
        timestamp: new Date().toISOString()
    };
    
    let replyText = "That's cool!";
    try {
        const response = await fetch('/api/generate-reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentUser, otherUser, text }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        replyText = data.reply.trim();
    } catch (error) {
        console.error("Error generating message reply:", error);
    }

    const replyMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: otherUser,
        text: replyText,
        timestamp: new Date(Date.now() + 1000).toISOString()
    };
    
    return { userMessage, replyMessage };
};

export const getReels = async (): Promise<Reel[]> => {
    await apiDelay();
     try {
        const response = await fetch('/api/generate-reels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const generatedData = await response.json();

        const videoUrls = [
            'https://videos.pexels.com/video-files/853824/853824-hd_720_1366_25fps.mp4',
            'https://videos.pexels.com/video-files/4434242/4434242-hd_720_1366_25fps.mp4',
            'https://videos.pexels.com/video-files/4690326/4690326-hd_720_1366_30fps.mp4',
            'https://videos.pexels.com/video-files/5594518/5594518-hd_720_1366_25fps.mp4',
            'https://videos.pexels.com/video-files/7578544/7578544-hd_720_1366_24fps.mp4',
        ];

        return generatedData.map((r: any, index: number) => ({
            id: `reel-${Date.now()}-${index}`,
            user: getRandomUser(),
            videoUrl: videoUrls[index % videoUrls.length],
            caption: r.caption,
            likes: r.likes,
            comments: r.comments.map((c: any, cIndex: number) => ({
                id: `comment-reel-${Date.now()}-${index}-${cIndex}`,
                user: { username: c.username, avatarUrl: `https://i.pravatar.cc/150?u=${c.username}` },
                text: c.text
            })),
            isLiked: false,
        }));

    } catch (error) {
        console.error("Error generating reels:", error);
        return [];
    }
};


export const getNotifications = async (): Promise<Notification[]> => {
    await apiDelay();
    try {
        const response = await fetch('/api/generate-notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const generatedData = await response.json();

        const notifications: Notification[] = generatedData.map((n: any, index: number) => ({
            id: `notif-${Date.now()}-${index}`,
            type: n.type as NotificationType,
            user: { username: n.username, avatarUrl: `https://i.pravatar.cc/150?u=${n.username}`},
            post: n.postId ? { 
                id: n.postId, 
                mediaUrl: n.mediaType === 'video' ? POST_VIDEO_URLS[0] : `https://picsum.photos/200/200?random=post-${n.postId}`,
                mediaType: n.mediaType || 'image'
            } : undefined,
            commentText: n.commentText,
            timestamp: n.timestamp,
            isRead: Math.random() > 0.5, // Randomly mark some as read
        }));

        return notifications;

    } catch (error) {
        console.error("Error generating notifications:", error);
        return [
             {
                id: 'fallback-notif-1',
                type: 'like',
                user: { username: 'debugBot', avatarUrl: 'https://i.pravatar.cc/150?u=debug' },
                post: { id: 'fallback-post-1', mediaUrl: 'https://picsum.photos/200/200?random=fallback', mediaType: 'image' },
                timestamp: 'Just now',
                isRead: false,
             }
        ];
    }
};

// --- CHATBOT ---
export const getChatbotResponse = async (history: ChatMessage[]): Promise<string> => {
    try {
        const response = await fetch('/api/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.reply.trim();
    } catch (error) {
        console.error("Error getting chatbot response:", error);
        return "Sorry, I'm having a little trouble thinking right now. Please try again later.";
    }
};