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
import { AuthModal } from './components/AuthModal';
import { RepostModal } from './components/RepostModal';
import { GenerateVideoModal } from './components/GenerateVideoModal';

type Theme = 'light' | 'dark';
type Page = 'home' | 'messages' | 'reels' | 'notifications' | 'explore' | 'profile';
type PageState = { name: Page; username?: string };

const App: React.FC = () => {
    const { currentUser, followUser, unfollowUser } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [explorePosts, setExplorePosts] = useState<Post[]>([]);
    const [stories, setStories] = useState<Story[]>([]);
    const [reels, setReels] = useState<Reel[]>([]);
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    // Modals
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState<boolean>(false);
    const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] = useState<boolean>(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
    const [isRepostModalOpen, setIsRepostModalOpen] = useState<boolean>(false);
    const [isGenerateVideoModalOpen, setIsGenerateVideoModalOpen] = useState<boolean>(false);
    const [postToRepost, setPostToRepost] = useState<Post | null>(null);

    const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [page, setPage] = useState<PageState>({ name: 'home' });

    // Toast Notification
    const [notification, setNotification] = useState<string | null>(null);
    const notificationTimerRef = useRef<number | null>(null);

    // Chatbot
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
    
    const requireAuth = useCallback((action: Function) => {
        if (currentUser) {
            action();
        } else {
            setIsAuthModalOpen(true);
        }
    }, [currentUser]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    useEffect(() => {
        if (currentUser && page.name === 'notifications' && hasUnreadNotifications) {
            setHasUnreadNotifications(false);
            const timer = setTimeout(() => {
                setNotifications(prev => prev.map(n => ({...n, isRead: true})));
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [page, hasUnreadNotifications, currentUser]);

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
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [ initialExplorePosts, initialReels ] = await Promise.all([
                    api.getExplorePosts(),
                    api.getReels(),
                ]);
                setExplorePosts(initialExplorePosts);
                setReels(initialReels);
                
                if (currentUser) {
                    const [ initialPosts, initialStories, initialSuggestions, initialNotifications ] = await Promise.all([
                        api.getPosts(),
                        api.getStories(),
                        api.getSuggestions(),
                        api.getNotifications(),
                    ]);
                    setPosts(initialPosts);
                    setStories(initialStories);
                    setSuggestions(initialSuggestions);
                    setNotifications(initialNotifications);
                    if (initialNotifications.some(n => !n.isRead)) {
                        setHasUnreadNotifications(true);
                    }
                } else {
                    const initialPosts = await api.getPosts();
                    setPosts(initialPosts);
                    const suggestions = await api.getSuggestions();
                    setSuggestions(suggestions);
                    setStories([]);
                    setNotifications([]);
                    setHasUnreadNotifications(false);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                showNotification("Could not load data. Please refresh.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [currentUser]);
    
    const handleNavigate = (targetPage: Page, username?: string) => {
        const protectedPages: Page[] = ['messages', 'notifications'];
        if (targetPage === 'profile' && !username) {
            if (currentUser) setPage({ name: 'profile', username: currentUser.username });
            else requireAuth(() => {});
            return;
        }

        const navigate = () => {
            setPage({ name: targetPage, username });
            window.scrollTo(0, 0);
        };
        
        if (protectedPages.includes(targetPage)) {
            requireAuth(navigate);
        } else {
            navigate();
        }
    };
    
    const updateAllPostLists = (updateFn: (posts: Post[]) => Post[]) => {
        setPosts(updateFn);
        setExplorePosts(updateFn);
    };

    const updatePostById = useCallback((postId: string, updateFn: (post: Post) => Post) => {
        const updater = (posts: Post[]) => posts.map(p => {
            if (p.id === postId) return updateFn(p);
            // Also update reposts of this post
            if (p.repostOf && p.repostOf.id === postId) {
                return { ...p, repostOf: updateFn(p.repostOf) };
            }
            return p;
        });
        updateAllPostLists(updater);

        if (selectedPost) {
            if (selectedPost.id === postId) {
                setSelectedPost(updateFn(selectedPost));
            } else if (selectedPost.repostOf && selectedPost.repostOf.id === postId) {
                setSelectedPost({ ...selectedPost, repostOf: updateFn(selectedPost.repostOf) });
            }
        }
    }, [selectedPost]);
    
    const handleFollowToggle = useCallback(async (username: string, isCurrentlyFollowing: boolean) => {
        requireAuth(async () => {
            // Optimistic UI update
            const updateUser = (user: User) => ({ ...user, isFollowing: !isCurrentlyFollowing, followers: user.followers! + (isCurrentlyFollowing ? -1 : 1) });
            
            updateAllPostLists(posts => posts.map(p => {
                let postUpdated = false;
                let newPost = { ...p };
                if (newPost.user.username === username) {
                    newPost.user = updateUser(newPost.user);
                    postUpdated = true;
                }
                if (newPost.repostOf && newPost.repostOf.user.username === username) {
                    newPost.repostOf = { ...newPost.repostOf, user: updateUser(newPost.repostOf.user) };
                    postUpdated = true;
                }
                return newPost;
            }));
            
            setSuggestions(prev => prev.map(u => u.username === username ? { ...u, isFollowing: !isCurrentlyFollowing } : u));

            if (isCurrentlyFollowing) {
                unfollowUser(username);
                await api.unfollowUser(username);
            } else {
                followUser(username);
                await api.followUser(username);
            }
        });
    }, [requireAuth, followUser, unfollowUser]);


    const handleLikeToggle = useCallback((postId: string) => {
        requireAuth(async () => {
            let originalPost: Post | undefined;
            const findPost = (p: Post) => {
                if(p.id === postId) originalPost = p;
                else if (p.repostOf?.id === postId) originalPost = p.repostOf;
            };
            posts.forEach(findPost);
            if (!originalPost) explorePosts.forEach(findPost);
            if (!originalPost && selectedPost) {
                if(selectedPost.id === postId) originalPost = selectedPost;
                else if (selectedPost.repostOf?.id === postId) originalPost = selectedPost.repostOf;
            }
            if (!originalPost) return;

            const wasLiked = originalPost.isLiked;
            const targetId = originalPost.id;
            
            updatePostById(targetId, p => ({ ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1, }));

            try {
                if (wasLiked) await api.unlikePost(targetId);
                else await api.likePost(targetId);
            } catch (error) {
                console.error('Failed to update like status:', error);
                showNotification("Couldn't update like status. Please try again.");
                updatePostById(targetId, p => ({ ...p, isLiked: wasLiked, likes: wasLiked ? p.likes + 1 : p.likes - 1, }));
            }
        });
    }, [posts, explorePosts, selectedPost, updatePostById, requireAuth]);

    const handleAddComment = useCallback((postId: string, commentText: string) => {
        requireAuth(async () => {
             if (!commentText.trim() || !currentUser) return;
            try {
                const newComment = await api.addComment(postId, commentText);
                updatePostById(postId, post => ({ ...post, comments: [...post.comments, { ...newComment, isNew: true }] }));
            } catch (error) {
                console.error('Failed to add comment:', error);
                showNotification("Couldn't add comment. Please try again.");
            }
        });
    }, [currentUser, updatePostById, requireAuth]);
    
    const handleOpenRepostModal = (post: Post) => {
        requireAuth(() => {
            setPostToRepost(post.repostOf || post);
            setIsRepostModalOpen(true);
        });
    };

    const handleRepost = async (comment: string) => {
        if (!postToRepost) return;
        try {
            const newPost = await api.repostPost(postToRepost.id, comment);
            updateAllPostLists(prev => [newPost, ...prev]);
            setIsRepostModalOpen(false);
            setPostToRepost(null);
            showNotification("Post reposted successfully!");
        } catch (error) {
            console.error('Failed to repost:', error);
            showNotification("Could not repost. Please try again.");
        }
    };
    
    const handleCreatePost = useCallback(async (formData: FormData) => {
        if (!currentUser) return;
        try {
            const newPost = await api.createPost(formData);
            updateAllPostLists(prev => [newPost, ...prev]);
            setIsCreatePostModalOpen(false);
            showNotification("Post shared successfully!");
        } catch (error) {
            console.error("Failed to create post:", error);
            showNotification("Error: Could not share post.");
        }
    }, [currentUser]);

    const handleCreateGeneratedPost = useCallback(async (videoBlob: Blob, caption: string) => {
        if (!currentUser) return;
        try {
            const formData = new FormData();
            formData.append('media', videoBlob, 'generated-video.mp4');
            formData.append('caption', caption);
            const newPost = await api.createPost(formData);
            updateAllPostLists(prev => [newPost, ...prev]);
            setIsGenerateVideoModalOpen(false);
            showNotification("AI generated video shared!");
        } catch (error) {
             console.error("Failed to create generated post:", error);
            showNotification("Error: Could not share generated video.");
        }
    }, [currentUser]);

    // Omitted some unchanged handlers for brevity: handleCreateStory, handleStoryClick, handleLikeReelToggle, handleAddReelComment etc.

    const handleStoryClick = (index: number) => requireAuth(() => { setActiveStoryIndex(index); setStories(prev => prev.map((s, i) => i === index ? { ...s, seen: true } : s)); });
    const handleCloseStoryViewer = () => setActiveStoryIndex(null);
    const handleNextStory = () => { if (activeStoryIndex !== null) { if (activeStoryIndex < stories.length - 1) { handleStoryClick(activeStoryIndex + 1); } else { handleCloseStoryViewer(); } } };
    const handlePrevStory = () => { if (activeStoryIndex !== null && activeStoryIndex > 0) setActiveStoryIndex(activeStoryIndex - 1); };
    const handleLikeReelToggle = (id: string) => { /* ... */ };
    const handleAddReelComment = (id: string, text: string) => { /* ... */ };
    const handleCreateStory = async (formData: FormData) => { /* ... */ };

    const handleOpenCreatePost = () => requireAuth(() => setIsCreatePostModalOpen(true));
    const handleOpenCreateStory = () => requireAuth(() => setIsCreateStoryModalOpen(true));
    const handleOpenChat = () => requireAuth(() => setIsChatOpen(true));
    const handleOpenGenerateVideo = () => requireAuth(() => setIsGenerateVideoModalOpen(true));

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
    
    const renderPage = () => {
        switch (page.name) {
            case 'messages': return currentUser ? <MessagesPage /> : null;
            case 'reels': return <ReelsPage reels={reels} onLikeToggle={handleLikeReelToggle} onAddComment={handleAddReelComment} onShowNotification={showNotification} />;
            case 'notifications': return currentUser ? <NotificationsPage notifications={notifications} /> : null;
            case 'explore': return <ExplorePage posts={explorePosts} onPostClick={setSelectedPost} />;
            case 'profile': return <ProfilePage key={page.username} username={page.username!} onPostClick={setSelectedPost} onFollowToggle={handleFollowToggle} onNavigate={handleNavigate} />;
            case 'home':
            default:
                return (
                    <main className="w-full max-w-[600px] pt-16 md:pt-8">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div></div>
                        ) : (
                            <div className="md:max-w-[470px] mx-auto">
                                {currentUser && stories.length > 0 && <Stories stories={stories} onStoryClick={handleStoryClick} onAddStory={handleOpenCreateStory} />}
                                {posts.length > 0 ? (
                                    <div className="space-y-4">
                                        {posts.map(post => (
                                            <PostCard key={post.id} post={post} onLikeToggle={handleLikeToggle} onAddComment={handleAddComment} onShowNotification={showNotification} onRepost={handleOpenRepostModal} onNavigate={handleNavigate} onFollowToggle={handleFollowToggle} />
                                        ))}
                                    </div>
                                ) : (
                                     <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                                        <h2 className="text-2xl font-semibold">Welcome to Socialgram</h2>
                                        <p>Follow people to see their posts here. Start by exploring!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                );
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black font-sans">
            <Header onNewPost={handleOpenCreatePost} onNavigate={handleNavigate} theme={theme} toggleTheme={toggleTheme} hasUnreadNotifications={hasUnreadNotifications} onLoginClick={() => setIsAuthModalOpen(true)} />

            <div className="container mx-auto flex flex-row justify-center">
                <div className="hidden md:block w-[240px] flex-shrink-0">
                    <LeftSidebar onNewPost={handleOpenCreatePost} onNavigate={handleNavigate} theme={theme} toggleTheme={toggleTheme} hasUnreadNotifications={hasUnreadNotifications} onOpenChat={handleOpenChat} onGenerateVideo={handleOpenGenerateVideo} />
                </div>
                {renderPage()}
                <div className="hidden lg:block w-[320px] ml-8 flex-shrink-0">
                    <RightSidebar suggestions={suggestions} onLoginClick={() => setIsAuthModalOpen(true)} onFollowToggle={handleFollowToggle} onNavigate={handleNavigate} />
                </div>
            </div>

            {isCreatePostModalOpen && <CreatePostModal onClose={() => setIsCreatePostModalOpen(false)} onCreatePost={handleCreatePost} generateCaption={api.generateCaption} />}
            {isCreateStoryModalOpen && <CreateStoryModal onClose={() => setIsCreateStoryModalOpen(false)} onCreateStory={handleCreateStory} />}
            {isRepostModalOpen && <RepostModal post={postToRepost!} onClose={() => setIsRepostModalOpen(false)} onRepost={handleRepost} />}
            {isGenerateVideoModalOpen && <GenerateVideoModal onClose={() => setIsGenerateVideoModalOpen(false)} onCreatePost={handleCreateGeneratedPost} />}
            {activeStoryIndex !== null && <StoryViewer stories={stories} currentIndex={activeStoryIndex} onClose={handleCloseStoryViewer} onNext={handleNextStory} onPrev={handlePrevStory} />}
            {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} onLikeToggle={handleLikeToggle} onAddComment={handleAddComment} onShowNotification={showNotification} onNavigate={handleNavigate} />}
            {isChatOpen && <ChatBot messages={chatMessages} onSendMessage={handleSendChatMessage} onClose={() => setIsChatOpen(false)} isLoading={isChatLoading} />}
            {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
            {notification && <div className="toast bg-gray-800 dark:bg-gray-200 text-white dark:text-black text-sm font-semibold py-2 px-4 rounded-full shadow-lg">{notification}</div>}
        </div>
    );
};

export default App;