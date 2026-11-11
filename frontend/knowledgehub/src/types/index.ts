export type KnowledgeItemType =
  | 'NOTE'
  | 'WEBSITE'
  | 'ARTICLE'
  | 'DOCUMENTATION'
  | 'VIDEO'
  | 'BOOK'
  | 'CODE_SNIPPET'
  | 'PAPER';

export type KnowledgeItemStatus = 'INBOX' | 'LEARNING' | 'COMPLETED' | 'ARCHIVED';

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface KnowledgeItem {
  id: string | number;
  title: string;
  url?: string;
  content?: string;
  type: KnowledgeItemType | string;
  status: KnowledgeItemStatus;
  difficulty?: DifficultyLevel | string | null;
  rating?: number | null; // 1-5
  topic?: string | null;
  topicId?: string | number | null;
  tags: string[];
  progress?: number; // 0-100 for learning items
  createdAt: string;
  updatedAt?: string;
}

export interface CreateKnowledgeItemRequest {
  title: string;
  url?: string;
  content?: string;
  type?: string;
  status?: KnowledgeItemStatus;
  difficulty?: DifficultyLevel | string | null;
  rating?: number | null;
  topic?: string | null;
  tags?: string[];
}

export interface UpdateKnowledgeItemRequest {
  title?: string;
  url?: string;
  content?: string;
  type?: string;
  status?: KnowledgeItemStatus;
  difficulty?: DifficultyLevel | string | null;
  rating?: number | null;
  topic?: string | null;
  tags?: string[];
}

export interface KnowledgeItemQueryParams {
  keyword?: string;
  status?: string;
  type?: string;
  difficulty?: string;
  topicId?: string | number;
  topic?: string;
  tagName?: string;
  tag?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface User {
  id?: string | number;
  email: string;
  fullName?: string;
  name?: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: User;
  email?: string;
  fullName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface DashboardStats {
  totalItems: number;
  thisWeekCount: number;
  inboxCount: number;
  learningCount: number;
  completedCount: number;
}
