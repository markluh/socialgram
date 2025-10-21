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

    const toggleTheme = useCallback(() => {
      setTheme(currentTheme => currentTheme === 'light' ? 'dark' : 'light');
    }, []);

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
            try {
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
                    api.getSuggestions(),
                    api.getReels(),
                    api.getNotifications(),
                    api.getExplorePosts(),
                    api.getUserPosts(currentUser.username),
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
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                showNotification("Could not load data. Please refresh.");
            } finally {
                setIsLoading(false);
            }
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
    
    const updatePostById = useCallback((postId: string, updateFn: (post: Post) => Post) => {
        const updater = (posts: Post[]) => posts.map(p => p.id === postId ? updateFn(p) : p);
        setPosts(updater);
        setExplorePosts(updater);
        setProfilePosts(updater);
        if (selectedPost && selectedPost.id === postId) {
            setSelectedPost(updateFn(selectedPost));
        }
    }, [selectedPost]);

    const handleLikeToggle = useCallback(async (postId: string) => {
        const post = posts.find(p => p.id === postId) || explorePosts.find(p => p.id === postId) || profilePosts.find(p => p.id === postId) || (selectedPost?.id === postId ? selectedPost : null);
        if (!post) return;

        const wasLiked = post.isLiked;
        
        updatePostById(postId, p => ({
            ...p,
            isLiked: !p.isLiked,
            likes: p.isLiked ? p.likes - 1 : p.likes + 1,
        }));

        try {
            if (wasLiked) {
                await api.unlikePost(postId);
            } else {
                await api.likePost(postId);
            }
        } catch (error) {
            console.error('Failed to update like status:', error);
            showNotification("Couldn't update like status. Please try again.");
            updatePostById(postId, p => ({
                ...p,
                isLiked: wasLiked,
                likes: wasLiked ? p.likes + 1 : p.likes - 1,
            }));
        }
    }, [posts, explorePosts, profilePosts, selectedPost, updatePostById]);

     const handleLikeReelToggle = useCallback(async (reelId: string) => {
        const reel = reels.find(r => r.id === reelId);
        if (!reel) return;

        const wasLiked = reel.isLiked;

        setReels(prevReels =>
            prevReels.map(r =>
                r.id === reelId ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 } : r
            )
        );

        try {
            if (wasLiked) {
                await api.unlikeReel(reelId);
            } else {
                await api.likeReel(reelId);
            }
        } catch (error) {
            console.error('Failed to update reel like status:', error);
            showNotification("Couldn't update like status.");
            setReels(prevReels =>
                prevReels.map(r =>
                    r.id === reelId ? { ...r, isLiked: wasLiked, likes: wasLiked ? r.likes + 1 : r.likes - 1 } : r
                )
            );
        }
    }, [reels]);

    const handleAddComment = useCallback(async (postId: string, commentText: string) => {
        if (!commentText.trim() || !currentUser) return;
        try {
            const newComment = await api.addComment(postId, commentText);
            updatePostById(postId, post => ({
                ...post,
                comments: [...post.comments, { ...newComment, isNew: true }]
            }));
        } catch (error) {
            console.error('Failed to add comment:', error);
            showNotification("Couldn't add comment. Please try again.");
        }
    }, [currentUser, updatePostById]);
    
    const handleAddReelComment = useCallback(async (reelId: string, commentText: string) => {
        if (!commentText.trim() || !currentUser) return;
        try {
            const newComment = await api.addReelComment(reelId, commentText);
            setReels(prevReels =>
                prevReels.map(reel =>
                    reel.id === reelId ? { ...reel, comments: [...reel.comments, { ...newComment, isNew: true }] } : reel
                )
            );
        } catch (error) {
            console.error('Failed to add reel comment:', error);
            showNotification("Couldn't add comment.");
        }
    }, [currentUser]);

    const handleCreatePost = useCallback(async (formData: FormData) => {
        if (!currentUser) return;
        try {
            const newPost = await api.createPost(formData);
            setPosts(prevPosts => [newPost, ...prevPosts]);
            setExplorePosts(prev => [newPost, ...prev]);
            setProfilePosts(prev => [newPost, ...prev]);
            setIsModalOpen(false);
            showNotification("Post shared successfully!");
        } catch (error) {
            console.error("Failed to create post:", error);
            showNotification("Error: Could not share post.");
        }
    }, [currentUser]);

    const handleCreateStory = useCallback(async (formData: FormData) => {
        if (!currentUser) return;
        try {
            const newStory = await api.createStory(formData);
            setStories(prevStories => [newStory, ...prevStories]);
            setIsCreateStoryModalOpen(false);
            showNotification("Story added successfully!");
        } catch (error) {
            console.error("Failed to create story:", error);
            showNotification("Error: Could not add story.");
        }
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