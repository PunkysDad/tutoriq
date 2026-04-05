export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN';
  gradeLevel?: string;
  subjectPreferences?: string[];
  subscriptionTier?: 'FREE_TRIAL' | 'BASIC' | 'PREMIUM';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'PARENT';
  gradeLevel?: string;
  subjectPreferences?: string[];
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  gradeLevel?: string;
  subjectPreferences?: string[];
}

export type SubscriptionTier = 'FREE_TRIAL' | 'BASIC' | 'PREMIUM';

export type FeatureKey =
  | 'AI_TUTOR'
  | 'CHAT_HISTORY'
  | 'SUMMARIZATION'
  | 'PROGRESS_DASHBOARD'
  | 'PARENT_PORTAL'
  | 'ANSWER_TAGGING'
  | 'FLASHCARDS';

export interface TutorSession {
  id: number;
  userId: number;
  title: string | null;
  subject: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: TutorMessage[];
}

export interface TutorMessage {
  id: number;
  sessionId: number;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface ChatHistoryEntry {
  sessionId: number;
  title: string | null;
  subject: string | null;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
}

export interface ChatSummaryRequest {
  sessionIds: number[];
}

export interface ChatSummaryResponse {
  summary: string;
  cached: boolean;
}

export interface Tag {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
}

export interface CreateTagRequest {
  name: string;
}

export interface AssignTagsRequest {
  tagIds: number[];
}

export interface FlashcardDeck {
  id: number;
  userId: number;
  title: string;
  subject: string | null;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
  cards?: FlashcardCard[];
}

export interface FlashcardCard {
  id: number;
  deckId: number;
  question: string;
  answer: string;
  createdAt: string;
}

export interface CreateDeckRequest {
  title: string;
  subject: string | null;
}

export interface CreateCardRequest {
  question: string;
  answer: string;
}

export interface UpdateCardRequest {
  question?: string;
  answer?: string;
}

export interface ProgressDashboard {
  totalSessions: number;
  totalMessages: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  subjectBreakdown: SubjectProgress[];
  recentActivity: RecentActivityEntry[];
}

export interface SubjectProgress {
  subject: string;
  sessionCount: number;
  messageCount: number;
  lastSessionAt: string | null;
}

export interface RecentActivityEntry {
  sessionId: number;
  subject: string | null;
  title: string | null;
  messageCount: number;
  date: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}
