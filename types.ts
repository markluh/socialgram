export interface User {
  username: string;
  avatarUrl: string;
  fullName?: string;
  bio?: string;
  postsCount?: number;
  followers?: number;
  following?: number;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  isNew?: boolean;
}

export interface Post {
  id: string;
  user: User;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
}

export interface Story {
  id: string;
  user: User;
  imageUrl: string;
  seen: boolean;
}

export interface Reel {
  id: string;
  user: User;
  videoUrl: string;
  caption: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
}

export interface Message {
  id: string;
  sender: User;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
}

export type NotificationType = 'like' | 'comment' | 'follow';

export interface Notification {
  id: string;
  type: NotificationType;
  user: User;
  post?: {
    id: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
  };
  commentText?: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}
