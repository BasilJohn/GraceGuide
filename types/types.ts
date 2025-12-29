export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  isPremium?: boolean;
  premiumExpiresAt?: string | null; // ISO date string
  subscriptionTier?: "free" | "premium" | null;
  subscriptionStatus?: "active" | "expired" | "cancelled" | null;
  revenueCatUserId?: string | null;
}

export interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  signIn: (user: User, tokens: AuthTokens) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

export type GoogleAuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export interface AppleAuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    appleId?: string; // optional unique identifier from Apple
  };
  accessToken: string;
  refreshToken?: string;
}

// Check-In Types
export type Emotion = 
  | 'loneliness'
  | 'fear'
  | 'anxiety'
  | 'guilt'
  | 'sadness'
  | 'anger'
  | 'grief'
  | 'relationships';

export type Tone = 'biblical' | 'balanced' | 'gentle';

export interface CheckInRequest {
  emotions: Emotion[];
  tone: Tone;
  timestamp?: string;
}

export interface CheckInResponse {
  success: boolean;
  checkInId: string;
  message: string;
}

export interface CheckIn {
  id: string;
  emotions: Emotion[];
  tone: Tone;
  timestamp: string;
}

export interface CheckInsListResponse {
  checkIns: CheckIn[];
  total: number;
  limit: number;
  offset: number;
}

// Chat Types
export interface ChatMessageRequest {
  message: string;
  conversationId?: string;
  includeContext?: boolean;
}

export interface BibleVerse {
  reference: string;
  text: string;
  translation: string;
}

export interface ChatMessageResponse {
  response: {
    id: string;
    text: string;
    verse?: BibleVerse;
    timestamp: string;
  };
  conversationId: string;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  verse?: BibleVerse;
  timestamp: string;
}

export interface ConversationHistoryResponse {
  conversationId: string;
  messages: Message[];
  hasMore: boolean;
}

export interface ConversationPreview {
  id: string;
  preview: string;
  lastMessageAt: string;
  messageCount: number;
}

export interface ConversationsListResponse {
  conversations: ConversationPreview[];
  total: number;
  limit: number;
  offset: number;
}

// Daily Scripture Types
export interface DailyScriptureResponse {
  date: string; // YYYY-MM-DD format
  reference: string;
  text: string;
  translation: string;
  devotional?: string;
}

export interface DailyVerseResponse {
  date: string;
  reference: string;
  text: string;
  translation: string;
}

export interface DailyDevotionalResponse {
  date: string;
  reference: string;
  devotional: string;
}

