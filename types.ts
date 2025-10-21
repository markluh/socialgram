export interface User {
  username: string;
  avatarUrl: string;
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
  imageUrl: string;
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
