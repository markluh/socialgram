import React, { useState, useEffect, useCallback } from 'react';
import { Post, Comment, Story, User } from './types';
import * as api from './services/api';
import { Header } from './components/Header';
import { PostCard } from './components/PostCard';
import { CreatePostModal } from './components/CreatePostModal';
import { Stories } from './components/Stories';
import { StoryViewer } from './components/StoryViewer';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { MessagesPage } from './pages/MessagesPage';

type Theme = 'light' | 'dark';
type Page = 'home' | 'messages';

const App: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [stories, setStories] = useState<Story[]>([]);
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
    const [page, setPage] = useState<Page>('home');
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
    
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [initialPosts, initialStories, initialSuggestions] = await Promise.all([
                api.getPosts(),
                api.getStories(),
                api.getSuggestions()
            ]);
            setPosts(initialPosts);
            setStories(initialStories);
            setSuggestions(initialSuggestions);
            setIsLoading(false);
        };
        fetchData();
    }, []);

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

    const handleLikeToggle = useCallback((postId: string) => {
        setPosts(prevPosts =>
            prevPosts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        isLiked: !post.isLiked,
                        likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                    };
                }
                return post;
            })
        );
    }, []);

    const handleAddComment = useCallback((postId: string, commentText: string) => {
        if (!commentText.trim()) return;

        const newComment: Comment = {
            id: `comment-${Date.now()}`,
            user: api.currentUser,
            text: commentText,
            isNew: true,
        };

        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
            )
        );
    }, []);
    
    const handleCreatePost = useCallback((imageUrl: string, caption: string) => {
        const newPost: Post = {
            id: `post-${Date.now()}`,
            user: api.currentUser,
            imageUrl,
            caption,
            likes: 0,
            comments: [],
            isLiked: false,
        };
        setPosts(prevPosts => [newPost, ...prevPosts]);
        setIsModalOpen(false);
    }, []);
    
    const renderPage = () => {
        if (page === 'messages') {
            return <MessagesPage />;
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
                            <Stories stories={stories} onStoryClick={handleStoryClick} />
                            <div className="space-y-4">
                                {posts.map(post => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onLikeToggle={handleLikeToggle}
                                        onAddComment={handleAddComment}
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
            <Header onNewPost={() => setIsModalOpen(true)} onNavigate={setPage} theme={theme} toggleTheme={toggleTheme} />

            <div className="container mx-auto flex flex-row justify-center">
                <div className="hidden md:block w-[240px] flex-shrink-0">
                    <LeftSidebar onNewPost={() => setIsModalOpen(true)} onNavigate={setPage} theme={theme} toggleTheme={toggleTheme} />
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
            {activeStoryIndex !== null && (
                <StoryViewer 
                    stories={stories}
                    currentIndex={activeStoryIndex}
                    onClose={handleCloseStoryViewer}
                    onNext={handleNextStory}
                    onPrev={handlePrevStory}
                />
            )}
        </div>
    );
};

export default App;
