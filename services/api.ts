import { Post, User, Story, Conversation, Message, Reel, Notification, ChatMessage, Comment } from '../types';
import * as geminiService from './geminiService';
import { GoogleGenAI } from "@google/genai";

// --- MOCK DATA AND STATE ---
let posts: Post[] = [];
let stories: Story[] = [];
let reels: Reel[] = [];
let users: User[] = [];
let conversations: Conversation[] = [];
let notifications: Notification[] = [];
let nextId = 100;
let currentUserFollowing: Set<string> = new Set(['art_by_leo', 'chloe.fit']);


const MOCK_USER_COUNT = 15;
const MOCK_POST_COUNT = 25;
const MOCK_REELS_COUNT = 5;

// Helper to get a random item from an array
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- CURRENT USER ---
const currentUserDetails: User = {
    username: 'currentUser',
    avatarUrl: 'https://i.pravatar.cc/150?u=currentUser',
    fullName: 'You',
    bio: 'Just trying to make it work. \nFollow me for more adventures!',
    followers: 42,
    following: 2,
};

// --- DATA CONTEXT HELPERS ---
const addUserContext = (user: User): User => {
    if (!user) return user;
    if (user.username === currentUserDetails.username) return currentUserDetails;
    return {
        ...user,
        isFollowing: currentUserFollowing.has(user.username)
    };
};

const decoratePost = (post: Post): Post => {
    if (!post) return post;
    const decoratedPost = {
        ...post,
        user: addUserContext(post.user),
        comments: post.comments.map(comment => ({
            ...comment,
            user: addUserContext(comment.user),
        })),
    };
    if (decoratedPost.repostOf) {
        decoratedPost.repostOf = {
            ...decoratedPost.repostOf,
            user: addUserContext(decoratedPost.repostOf.user),
        }
    }
    return decoratedPost;
};

const decorateReel = (reel: Reel): Reel => ({
    ...reel,
    user: addUserContext(reel.user),
    comments: reel.comments.map(comment => ({
        ...comment,
        user: addUserContext(comment.user),
    })),
});

// --- MOCK DATA GENERATION ---
const generateMockUsers = () => {
    const userList: User[] = [
        { username: 'travel_lover', avatarUrl: 'https://i.pravatar.cc/150?u=travel_lover', fullName: 'Alex Wander', bio: 'Exploring the world, one city at a time.', followers: 1205, following: 302 },
        { username: 'foodie_dave', avatarUrl: 'https://i.pravatar.cc/150?u=foodie_dave', fullName: 'Dave Cook', bio: 'Eating my way through life. 🍕🍔', followers: 2543, following: 105 },
        { username: 'art_by_leo', avatarUrl: 'https://i.pravatar.cc/150?u=art_by_leo', fullName: 'Leo Vinci', bio: 'Painter & Sculptor. DM for commissions.', followers: 10800, following: 50 },
        { username: 'chloe.fit', avatarUrl: 'https://i.pravatar.cc/150?u=chloe.fit', fullName: 'Chloe Smith', bio: 'Fitness coach and yoga enthusiast.', followers: 5600, following: 120 },
        { username: 'dev_humor', avatarUrl: 'https://i.pravatar.cc/150?u=dev_humor', fullName: 'Code Monkey', bio: '99 little bugs in the code...', followers: 42000, following: 1 },
        { username: 'sarah_reads', avatarUrl: 'https://i.pravatar.cc/150?u=sarah_reads', fullName: 'Sarah Jones', bio: 'Bookworm. Currently reading: The Midnight Library', followers: 890, following: 250 },
        { username: 'gaming_guru', avatarUrl: 'https://i.pravatar.cc/150?u=gaming_guru', fullName: 'Max Power', bio: 'Streaming on Twitch daily!', followers: 15000, following: 500 },
        { username: 'fashionista_mia', avatarUrl: 'https://i.pravatar.cc/150?u=fashionista_mia', fullName: 'Mia Chen', bio: 'Style blogger. OOTD everyday.', followers: 22000, following: 800 },
        { username: 'nature_nick', avatarUrl: 'https://i.pravatar.cc/150?u=nature_nick', fullName: 'Nick Green', bio: 'Hiking and wildlife photography.', followers: 7500, following: 400 },
        { username: 'music_maniac', avatarUrl: 'https://i.pravatar.cc/150?u=music_maniac', fullName: 'Melody Harmon', bio: 'Discovering new tunes.', followers: 4300, following: 600 },
    ];
    users = [currentUserDetails, ...userList];
};

const generateMockPosts = () => {
    const postList: Post[] = [];
    for (let i = 0; i < MOCK_POST_COUNT; i++) {
        const user = getRandom(users.filter(u => u.username !== 'currentUser'));
        const hasVideo = Math.random() > 0.8;
        const post: Post = {
            id: `post-${i}`,
            user: user,
            mediaUrl: hasVideo ? `https://dummy-media.s3.us-west-2.amazonaws.com/video${(i % 5) + 1}.mp4` : `https://picsum.photos/seed/${i}/800/800`,
            mediaType: hasVideo ? 'video' : 'image',
            caption: `This is mock caption number ${i} from @${user.username}. What a beautiful day! #mock #socialgram`,
            likes: getRandomInt(10, 2500),
            comments: Array.from({ length: getRandomInt(0, 10) }).map((_, j) => ({
                id: `comment-${i}-${j}`,
                user: getRandom(users),
                text: `This is a mock comment! ${j}`,
            })),
            isLiked: Math.random() > 0.7,
        };
        postList.push(post);
    }
     // Add a few posts by the current user
    for (let i = 0; i < 3; i++) {
        postList.unshift({
            id: `post-currentUser-${i}`,
            user: currentUserDetails,
            mediaUrl: `https://picsum.photos/seed/currentUser${i}/800/800`,
            mediaType: 'image',
            caption: `My own post! #selfie`,
            likes: getRandomInt(5, 50),
            comments: [],
            isLiked: false,
        });
    }

    posts = postList;
};

const generateMockData = () => {
    generateMockUsers();
    generateMockPosts();
    // In a real app, you'd generate stories, reels, etc. too
    stories = users.slice(1, 7).map((user, i) => ({
        id: `story-${i}`,
        user,
        imageUrl: `https://picsum.photos/seed/story${i}/400/700`,
        seen: i > 2,
    }));
    reels = Array.from({ length: MOCK_REELS_COUNT }).map((_, i) => ({
        id: `reel-${i}`,
        user: getRandom(users),
        videoUrl: `https://dummy-media.s3.us-west-2.amazonaws.com/video${(i % 5) + 1}.mp4`,
        caption: `This is a cool reel! #trending`,
        likes: getRandomInt(100, 10000),
        comments: [],
        isLiked: Math.random() > 0.5,
    }));
    notifications = [
        { id: 'n1', type: 'like', user: users[1], post: { id: 'post-currentUser-0', mediaUrl: posts[0].mediaUrl, mediaType: 'image' }, timestamp: '2h', isRead: false },
        { id: 'n2', type: 'follow', user: users[2], timestamp: '1d', isRead: false },
        { id: 'n3', type: 'comment', user: users[3], post: { id: 'post-currentUser-1', mediaUrl: posts[1].mediaUrl, mediaType: 'image' }, commentText: 'Looks amazing!', timestamp: '3d', isRead: true },
    ];
};

// --- API FUNCTIONS ---
export const getPosts = async (): Promise<Post[]> => {
    await sleep(500);
    const followedUsernames = new Set(currentUserFollowing);
    followedUsernames.add(currentUserDetails.username);
    
    let feedPosts = posts.filter(p => followedUsernames.has(p.user.username));

    // If the user isn't following anyone, show some popular posts
    if (currentUserFollowing.size === 0) {
        feedPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 10);
    }
    
    return feedPosts.map(decoratePost);
};

export const getExplorePosts = async (): Promise<Post[]> => {
    await sleep(300);
    return posts.map(decoratePost);
};

export const getUserPosts = async (username: string): Promise<Post[]> => {
    await sleep(300);
    return posts.filter(p => p.user.username === username || p.repostOf?.user.username === username).map(decoratePost);
};

export const getUser = async (username: string): Promise<User | null> => {
    await sleep(100);
    const user = users.find(u => u.username === username);
    return user ? addUserContext(user) : null;
};

export const getStories = async (): Promise<Story[]> => {
    await sleep(100);
    return stories;
};

export const getReels = async (): Promise<Reel[]> => {
    await sleep(600);
    return reels.map(decorateReel);
};

export const getSuggestions = async (): Promise<User[]> => {
    await sleep(200);
    const followedUsernames = new Set(currentUserFollowing);
    return users.filter(u => u.username !== currentUserDetails.username && !followedUsernames.has(u.username)).slice(0, 5).map(addUserContext);
};

export const getNotifications = async (): Promise<Notification[]> => {
    await sleep(200);
    return notifications;
};

export const followUser = async (username: string): Promise<User> => {
    await sleep(300);
    currentUserFollowing.add(username);
    const user = users.find(u => u.username === username);
    if (user) {
        user.followers = (user.followers || 0) + 1;
        currentUserDetails.following = (currentUserDetails.following || 0) + 1;
        return addUserContext(user);
    }
    throw new Error("User not found");
};

export const unfollowUser = async (username: string): Promise<User> => {
    await sleep(300);
    currentUserFollowing.delete(username);
    const user = users.find(u => u.username === username);
    if (user) {
        user.followers = (user.followers || 0) - 1;
        currentUserDetails.following = (currentUserDetails.following || 0) - 1;
        return addUserContext(user);
    }
    throw new Error("User not found");
};

export const likePost = async (postId: string): Promise<void> => {
    await sleep(200);
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.isLiked = true;
        post.likes++;
    }
};

export const unlikePost = async (postId: string): Promise<void> => {
    await sleep(200);
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.isLiked = false;
        post.likes--;
    }
};

export const addComment = async (postId: string, text: string): Promise<Comment> => {
    await sleep(400);
    const post = posts.find(p => p.id === postId);
    if (!post) throw new Error("Post not found");
    const newComment: Comment = {
        id: `comment-new-${nextId++}`,
        user: addUserContext(currentUserDetails),
        text,
    };
    post.comments.push(newComment);

    // Simulate other users commenting
    setTimeout(async () => {
        const aiCommentText = await geminiService.generateAiComment(
            post.caption,
            post.comments.map(c => ({ user: c.user.username, text: c.text }))
        );
        const aiUser = getRandom(users.filter(u => u.username !== currentUserDetails.username));
        const aiComment: Comment = {
            id: `comment-ai-${nextId++}`,
            user: addUserContext(aiUser),
            text: aiCommentText,
        };
        const targetPost = posts.find(p => p.id === postId);
        targetPost?.comments.push(aiComment);
    }, 2000 + Math.random() * 3000);

    return newComment;
};

export const createPost = async (formData: FormData): Promise<Post> => {
    await sleep(1000);
    const caption = formData.get('caption') as string;
    const media = formData.get('media') as File;
    const newPost: Post = {
        id: `post-new-${nextId++}`,
        user: currentUserDetails,
        mediaUrl: URL.createObjectURL(media),
        mediaType: media.type.startsWith('video') ? 'video' : 'image',
        caption,
        likes: 0,
        comments: [],
        isLiked: false
    };
    posts.unshift(newPost);
    return decoratePost(newPost);
};

export const repostPost = async (postId: string, comment: string): Promise<Post> => {
    await sleep(500);
    const originalPost = posts.find(p => p.id === postId || p.repostOf?.id === postId);
    if (!originalPost) throw new Error("Original post not found");
    const newPost: Post = {
        id: `repost-new-${nextId++}`,
        user: currentUserDetails,
        mediaUrl: '',
        mediaType: 'image',
        caption: comment,
        likes: 0,
        comments: [],
        isLiked: false,
        repostOf: originalPost.repostOf || originalPost,
    };
    posts.unshift(newPost);
    return decoratePost(newPost);
};


export const createStory = async (formData: FormData): Promise<Story> => {
    await sleep(800);
    const image = formData.get('storyImage') as File;
    const newStory: Story = {
        id: `story-new-${nextId++}`,
        user: currentUserDetails,
        imageUrl: URL.createObjectURL(image),
        seen: false
    };
    stories.unshift(newStory);
    return newStory;
};

export const generateVideo = async (
    prompt: string,
    aspectRatio: '16:9' | '9:16',
    resolution: '720p' | '1080p',
    onProgress: (message: string) => void
): Promise<{ videoBlob: Blob }> => {
    // 1. Create a new instance to get latest key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 2. Start generation
    onProgress('Starting video generation...');
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: {
            numberOfVideos: 1,
            resolution,
            aspectRatio,
        }
    });

    // 3. Poll for result
    const progressMessages = [
        "Warming up the AI...",
        "Composing the scene...",
        "Gathering visual elements...",
        "Rendering initial frames...",
        "Adding final touches...",
        "Almost there! This can take a few minutes."
    ];
    let messageIndex = 0;

    while (!operation.done) {
        onProgress(progressMessages[messageIndex % progressMessages.length]);
        messageIndex++;
        await sleep(10000); // Poll every 10 seconds
        try {
            operation = await ai.operations.getVideosOperation({ operation });
        } catch (e: any) {
            // Handle API key error during polling
            if (e.message?.includes('Requested entity was not found')) {
                throw new Error('API_KEY_INVALID');
            }
            throw e;
        }
    }

    onProgress('Video generated successfully! Downloading...');

    // 4. Fetch video
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error('Video generation failed to produce a download link.');
    }

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error('Failed to download the generated video.');
    }
    const videoBlob = await response.blob();

    return { videoBlob };
};

// ... other functions like likeReel, addReelComment etc. would go here ...
export const likeReel = async (reelId: string) => { /* ... */ };
export const unlikeReel = async (reelId: string) => { /* ... */ };
export const addReelComment = async (reelId: string, text: string) => { /* ... */ return { id: `reel-comment-${nextId++}`, user: currentUserDetails, text } as Comment; };

// FIX: Re-export Gemini service functions so they can be called via the api service.
export const generateCaption = geminiService.generateCaption;
export const getChatbotResponse = geminiService.getChatbotResponse;

// --- Authentication ---
export const loginUser = async (username: string, password: string): Promise<User | null> => {
    await sleep(500);
    if (username === 'currentUser' && password === 'password123') {
        return currentUserDetails;
    }
    return null;
}

export const signUpUser = async (details: { username: string, fullName: string, email: string, password: string }): Promise<User | null> => {
    await sleep(700);
    if (users.some(u => u.username === details.username)) {
        return null;
    }
    const newUser: User = {
        username: details.username,
        fullName: details.fullName,
        avatarUrl: `https://i.pravatar.cc/150?u=${details.username}`,
        bio: '',
        followers: 0,
        following: 0,
    };
    users.push(newUser);
    currentUserDetails.username = newUser.username;
    currentUserDetails.fullName = newUser.fullName;
    currentUserDetails.avatarUrl = newUser.avatarUrl;
    currentUserDetails.followers = 0;
    currentUserDetails.following = 0;
    return currentUserDetails;
}

// --- Messages ---
export const getConversations = async (): Promise<Conversation[]> => {
    // Generate mock conversations if they don't exist
    if (conversations.length === 0) {
        conversations = users.slice(1, 6).map((user, i) => ({
            id: `convo-${i}`,
            participants: [currentUserDetails, user],
            messages: [
                { id: `msg-${i}-1`, sender: user, text: `Hey, how's it going? This is message ${i}`, timestamp: new Date(Date.now() - (i+1) * 3600000).toISOString() },
                { id: `msg-${i}-2`, sender: currentUserDetails, text: 'Doing great, thanks for asking!', timestamp: new Date(Date.now() - i * 3600000).toISOString() },
            ],
        }));
    }
    return conversations;
};

export const sendMessage = async (recipientUsername: string, text: string): Promise<{userMessage: Message, replyMessage: Message}> => {
    await sleep(300);
    let convo = conversations.find(c => c.participants.some(p => p.username === recipientUsername));
    if (!convo) throw new Error("Conversation not found");

    const userMessage: Message = {
        id: `msg-new-${nextId++}`,
        sender: currentUserDetails,
        text,
        timestamp: new Date().toISOString(),
    };
    convo.messages.push(userMessage);

    const aiReplyText = await geminiService.generateAiReply(
        convo.messages.map(m => ({ sender: m.sender.username, text: m.text }))
    );
    
    const replyMessage: Message = {
        id: `msg-ai-${nextId++}`,
        sender: convo.participants.find(p => p.username === recipientUsername)!,
        text: aiReplyText,
        timestamp: new Date(Date.now() + 1000).toISOString(),
    };
    convo.messages.push(replyMessage);

    return { userMessage, replyMessage };
};

// Initialize mock data
generateMockData();