export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
}

export interface QuestionOption {
  id: string;
  text: string;
  order: number;
  _count?: { answers: number };
}

export interface Question {
  id: string;
  text: string;
  isRequired: boolean;
  order: number;
  options: QuestionOption[];
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  shareToken: string;
  isAnonymous: boolean;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CLOSED';
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
  _count?: { responses: number };
}

export interface AnalyticsOption {
  id: string;
  text: string;
  count: number;
  percentage: number;
}

export interface AnalyticsQuestion {
  id: string;
  text: string;
  isRequired: boolean;
  totalAnswers: number;
  options: AnalyticsOption[];
}

export interface AnalyticsData {
  pollId: string;
  pollTitle: string;
  pollStatus: 'ACTIVE' | 'EXPIRED' | 'CLOSED';
  isPublished: boolean;
  totalResponses: number;
  questions: AnalyticsQuestion[];
}

export interface ResponseNewEvent {
  totalResponses: number;
  questionUpdates: {
    questionId: string;
    optionId: string;
    newCount: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export type EditPollFormValues = any; // Placeholder or remove if not needed elsewhere
