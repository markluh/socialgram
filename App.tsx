import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Post, Comment, Story, User, Reel, Notification, ChatMessage } from './types';
import * as api from './services/api';
import { Header } from './components/Header';
import { PostCard } from './components/PostCard';
import { CreatePostModal } from './components/CreatePostModal';
import { CreateStoryModal } from './components/CreateStoryModal';
import { Stories } from './components/Stories';
import { StoryViewer } from './components/StoryViewer';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { MessagesPage } from './pages/MessagesPage';
import { ReelsPage } from './pages/ReelsPage';
import { ExplorePage } from './pages/ExplorePage';
import { ProfilePage } from './pages/ProfilePage';
import { PostDetailModal } from './components/PostDetailModal';
import { NotificationsPage } from './pages/NotificationsPage';
import { ChatBot } from './components/ChatBot';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';

type Theme = 'light' | 'dark';
type Page = 'home' | 'messages' | 'reels' | 'notifications' | 'explore' | 'profile';

const App: React.FC = () => {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [explorePosts, setExplorePosts] = useState<Post[]>([]);
    const [profilePosts, setProfilePosts] = useState<Post[]>([]);
    const [stories, setStories] = useState<Story[]>([]);
    const [reels, setReels] = useState<Reel[]>([]);
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] = useState<boolean>(false);
    const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [page, setPage] = useState<Page>('home');
    const [notification, setNotification] = useState<string | null>(null);
    const notificationTimerRef = useRef<number | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { sender: 'ai', text: "Hi there! I'm the Gemini Assistant. How can I help you today?" }
    ]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        return savedTheme || 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    useEffect(() => {
        if (page === 'notifications' && hasUnreadNotifications) {
            setHasUnreadNotifications(false);
            const timer = setTimeout(() => {
                setNotifications(prev => prev.map(n => ({...n, isRead: true})));
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [page, hasUnreadNotifications]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const showNotification = (message: string) => {
        if (notificationTimerRef.current) {
            clearTimeout(notificationTimerRef.current);
        }
        setNotification(message);
        notificationTimerRef.current = window.setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    useEffect(() => {
        if (!currentUser) return;
        const fetchData = async () => {
            setIsLoading(true);
            const [
                initialPosts, 
                initialStories, 
                initialSuggestions, 
                initialReels, 
                initialNotifications,
                initialExplorePosts,
                initialProfilePosts,
            ] = await Promise.all([
                api.getPosts(),
                api.getStories(),
                api.getSuggestions(currentUser),
                api.getReels(),
                api.getNotifications(),
                api.getExplorePosts(),
                api.getUserPosts(currentUser),
            ]);
            setPosts(initialPosts);
            setStories(initialStories);
            setSuggestions(initialSuggestions);
            setReels(initialReels);
            setNotifications(initialNotifications);
            setExplorePosts(initialExplorePosts);
            setProfilePosts(initialProfilePosts);
            if (initialNotifications.some(n => !n.isRead)) {
                setHasUnreadNotifications(true);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [currentUser]);

    const handleStoryClick = (index: number) => {
        setActiveStoryIndex(index);
        setStories(prevStories => 
            prevStories.map((story, i) => i === index ? { ...story, seen: true } : story)
        );
    };

    const handleCloseStoryViewer = () => {
        setActiveStoryIndex(null);
    };

    const handleNextStory = () => {
        if (activeStoryIndex === null) return;
        if (activeStoryIndex < stories.length - 1) {
            handleStoryClick(activeStoryIndex + 1);
        } else {
            handleCloseStoryViewer();
        }
    };

    const handlePrevStory = () => {
        if (activeStoryIndex !== null && activeStoryIndex > 0) {
            setActiveStoryIndex(activeStoryIndex - 1);
        }
    };
    
    const updatePostById = (postId: string, updateFn: (post: Post) => Post) => {
        const updater = (posts: Post[]) => posts.map(p => p.id === postId ? updateFn(p) : p);
        setPosts(updater);
        setExplorePosts(updater);
        setProfilePosts(updater);
        if (selectedPost && selectedPost.id === postId) {
            setSelectedPost(updateFn(selectedPost));
        }
    };

    const handleLikeToggle = useCallback((postId: string) => {
        updatePostById(postId, post => ({
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        }));
    }, [selectedPost]);

     const handleLikeReelToggle = useCallback((reelId: string) => {
        setReels(prevReels =>
            prevReels.map(reel => {
                if (reel.id === reelId) {
                    return {
                        ...reel,
                        isLiked: !reel.isLiked,
                        likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1,
                    };
                }
                return reel;
            })
        );
    }, []);

    const handleAddComment = useCallback((postId: string, commentText: string) => {
        if (!commentText.trim() || !currentUser) return;
        const newComment: Comment = {
            id: `comment-${Date.now()}`,
            user: currentUser,
            text: commentText,
            isNew: true,
        };
        updatePostById(postId, post => ({
            ...post,
            comments: [...post.comments, newComment]
        }));
    }, [currentUser, selectedPost]);
    
    const handleAddReelComment = useCallback((reelId: string, commentText: string) => {
        if (!commentText.trim() || !currentUser) return;

        const newComment: Comment = {
            id: `comment-reel-${Date.now()}`,
            user: currentUser,
            text: commentText,
            isNew: true,
        };

        setReels(prevReels =>
            prevReels.map(reel =>
                reel.id === reelId ? { ...reel, comments: [...reel.comments, newComment] } : reel
            )
        );
    }, [currentUser]);

    const handleCreatePost = useCallback((mediaUrl: string, mediaType: 'image' | 'video', caption: string) => {
        if (!currentUser) return;
        const newPost: Post = {
            id: `post-${Date.now()}`,
            user: currentUser,
            mediaUrl,
            mediaType,
            caption,
            likes: 0,
            comments: [],
            isLiked: false,
        };
        setPosts(prevPosts => [newPost, ...prevPosts]);
        setExplorePosts(prev => [newPost, ...prev]);
        setProfilePosts(prev => [newPost, ...prev]);
        setIsModalOpen(false);
    }, [currentUser]);

     const handleCreateStory = useCallback((imageUrl: string) => {
        if (!currentUser) return;
        const newStory: Story = {
            id: `story-${Date.now()}`,
            user: currentUser,
            imageUrl,
            seen: true, 
        };
        setStories(prevStories => [newStory, ...prevStories]);
        setIsCreateStoryModalOpen(false);
    }, [currentUser]);

    const handleSendChatMessage = async (message: string) => {
        const newHistory: ChatMessage[] = [...chatMessages, { sender: 'user', text: message }];
        setChatMessages(newHistory);
        setIsChatLoading(true);
        try {
            const responseText = await api.getChatbotResponse(newHistory);
            setChatMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
        } catch (error) {
            console.error("Chatbot request failed:", error);
            setChatMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I couldn't get a response. Please try again." }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    if (!currentUser) {
        return <AuthPage />;
    }
    
    const renderPage = () => {
        if (page === 'messages') {
            return <MessagesPage />;
        }

        if (page === 'reels') {
            return <ReelsPage 
                        reels={reels} 
                        onLikeToggle={handleLikeReelToggle} 
                        onAddComment={handleAddReelComment}
                        onShowNotification={showNotification} 
                    />;
        }

        if (page === 'notifications') {
            return <NotificationsPage notifications={notifications} />;
        }
        
        if (page === 'explore') {
            return <ExplorePage posts={explorePosts} onPostClick={setSelectedPost} />;
        }
        
        if (page === 'profile') {
            return <ProfilePage user={currentUser} posts={profilePosts} onPostClick={setSelectedPost} />;
        }

        return (
             <main className="w-full max-w-[600px] pt-16 md:pt-8">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
                    </div>
                ) : (
                    <>
                        <div className="md:max-w-[470px] mx-auto">
                            <Stories stories={stories} onStoryClick={handleStoryClick} onAddStory={() => setIsCreateStoryModalOpen(true)} />
                            <div className="space-y-4">
                                {posts.map(post => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onLikeToggle={handleLikeToggle}
                                        onAddComment={handleAddComment}
                                        onShowNotification={showNotification}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </main>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black font-sans">
            <Header onNewPost={() => setIsModalOpen(true)} onNavigate={setPage} theme={theme} toggleTheme={toggleTheme} hasUnreadNotifications={hasUnreadNotifications} />

            <div className="container mx-auto flex flex-row justify-center">
                <div className="hidden md:block w-[240px] flex-shrink-0">
                    <LeftSidebar 
                        onNewPost={() => setIsModalOpen(true)} 
                        onNavigate={setPage} 
                        theme={theme} 
                        toggleTheme={toggleTheme} 
                        hasUnreadNotifications={hasUnreadNotifications}
                        onOpenChat={() => setIsChatOpen(true)}
                    />
                </div>
                
                {renderPage()}

                <div className="hidden lg:block w-[320px] ml-8 flex-shrink-0">
                    <RightSidebar suggestions={suggestions} />
                </div>
            </div>

            {isModalOpen && (
                <CreatePostModal 
                    onClose={() => setIsModalOpen(false)} 
                    onCreatePost={handleCreatePost}
                    generateCaption={api.generateCaption}
                />
            )}
            {isCreateStoryModalOpen && (
                <CreateStoryModal
                    onClose={() => setIsCreateStoryModalOpen(false)}
                    onCreateStory={handleCreateStory}
                />
            )}
            {activeStoryIndex !== null && (
                <StoryViewer
                    stories={stories}
                    currentIndex={activeStoryIndex}
                    onClose={handleCloseStoryViewer}
                    onNext={handleNextStory}
                    onPrev={handlePrevStory}
                />
            )}
            {selectedPost && (
                 <PostDetailModal 
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                    onLikeToggle={handleLikeToggle}
                    onAddComment={handleAddComment}
                    onShowNotification={showNotification}
                 />
            )}
            {isChatOpen && (
                <ChatBot 
                    messages={chatMessages}
                    onSendMessage={handleSendChatMessage}
                    onClose={() => setIsChatOpen(false)}
                    isLoading={isChatLoading}
                />
            )}
            {notification && (
                <div className="toast bg-gray-800 dark:bg-gray-200 text-white dark:text-black text-sm font-semibold py-2 px-4 rounded-full shadow-lg">
                    {notification}
                </div>
            )}
        </div>
    );
};

export default App;