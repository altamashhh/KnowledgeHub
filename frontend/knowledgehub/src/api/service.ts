import { authApi } from './authApi';
import { knowledgeItemApi } from './knowledgeItemApi';
import {
  AuthResponse,
  CreateKnowledgeItemRequest,
  KnowledgeItem,
  KnowledgeItemQueryParams,
  LoginRequest,
  PageResponse,
  RegisterRequest,
  UpdateKnowledgeItemRequest,
} from '../types';
import { getLocalItems, saveLocalItems } from '../utils/mockStorage';

// Tracks whether live backend was reached or offline mode is active
let isBackendLive = true;
let connectionChecked = false;

export function getBackendStatus(): { isLive: boolean; checked: boolean } {
  return { isLive: isBackendLive, checked: connectionChecked };
}

export const apiService = {
  // --- AUTH METHODS ---
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const res = await authApi.login(credentials);
      isBackendLive = true;
      connectionChecked = true;
      return res;
    } catch (err: any) {
      if (err.message && (err.message.includes('Cannot connect') || err.message.includes('Network Error'))) {
        isBackendLive = false;
        connectionChecked = true;
        // Fallback for offline/preview demonstration
        const mockToken = 'demo-jwt-' + btoa(credentials.email) + '-' + Date.now();
        const user = {
          email: credentials.email,
          fullName: credentials.email.split('@')[0].replace('.', ' '),
        };
        return {
          token: mockToken,
          user,
          email: credentials.email,
          fullName: user.fullName,
        };
      }
      throw err;
    }
  },

  async register(data: RegisterRequest): Promise<{ message?: string; success: boolean }> {
    try {
      const res = await authApi.register(data);
      isBackendLive = true;
      connectionChecked = true;
      return res;
    } catch (err: any) {
      if (err.message && (err.message.includes('Cannot connect') || err.message.includes('Network Error'))) {
        isBackendLive = false;
        connectionChecked = true;
        return {
          message: 'Registration simulated in offline mode. You can now log in.',
          success: true,
        };
      }
      throw err;
    }
  },

  // --- KNOWLEDGE ITEMS METHODS ---
  async getItems(params: KnowledgeItemQueryParams = {}): Promise<PageResponse<KnowledgeItem>> {
    try {
      const res = await knowledgeItemApi.getItems(params);
      isBackendLive = true;
      connectionChecked = true;
      return res;
    } catch (err: any) {
      if (err.message && (err.message.includes('Cannot connect') || err.message.includes('Network Error'))) {
        isBackendLive = false;
        connectionChecked = true;
        
        // Execute filtering, search, sorting and pagination locally
        let items = getLocalItems();

        if (params.keyword && params.keyword.trim()) {
          const kw = params.keyword.toLowerCase().trim();
          items = items.filter(item => 
            item.title.toLowerCase().includes(kw) ||
            (item.content && item.content.toLowerCase().includes(kw)) ||
            (item.topic && item.topic.toLowerCase().includes(kw)) ||
            item.tags.some(t => t.toLowerCase().includes(kw))
          );
        }

        if (params.status && params.status !== 'ALL') {
          items = items.filter(item => item.status.toUpperCase() === params.status?.toUpperCase());
        }

        if (params.type && params.type !== 'ALL') {
          items = items.filter(item => item.type.toUpperCase() === params.type?.toUpperCase());
        }

        if (params.difficulty && params.difficulty !== 'ALL') {
          items = items.filter(item => item.difficulty?.toUpperCase() === params.difficulty?.toUpperCase());
        }

        if (params.topic) {
          items = items.filter(item => item.topic?.toLowerCase() === params.topic?.toLowerCase());
        }

        if (params.tag || params.tagName) {
          const targetTag = (params.tag || params.tagName)?.toLowerCase();
          items = items.filter(item => item.tags.some(t => t.toLowerCase() === targetTag));
        }

        // Sorting
        if (params.sort) {
          const [field, dir] = params.sort.split(',');
          const isAsc = dir?.toLowerCase() === 'asc';
          items.sort((a: any, b: any) => {
            const valA = a[field] ?? '';
            const valB = b[field] ?? '';
            if (valA < valB) return isAsc ? -1 : 1;
            if (valA > valB) return isAsc ? 1 : -1;
            return 0;
          });
        } else {
          // Default sort: newest first
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        const page = params.page || 0;
        const size = params.size || 10;
        const start = page * size;
        const pagedContent = items.slice(start, start + size);

        return {
          content: pagedContent,
          pageNumber: page,
          pageSize: size,
          totalElements: items.length,
          totalPages: Math.max(1, Math.ceil(items.length / size)),
          first: page === 0,
          last: start + size >= items.length,
          empty: items.length === 0,
        };
      }
      throw err;
    }
  },

  async getItemById(id: string | number): Promise<KnowledgeItem> {
    try {
      const res = await knowledgeItemApi.getItemById(id);
      isBackendLive = true;
      connectionChecked = true;
      return res;
    } catch (err: any) {
      if (err.message && (err.message.includes('Cannot connect') || err.message.includes('Network Error'))) {
        isBackendLive = false;
        connectionChecked = true;
        const items = getLocalItems();
        const found = items.find(i => String(i.id) === String(id));
        if (!found) {
          throw new Error('Knowledge item not found.');
        }
        return found;
      }
      throw err;
    }
  },

  async createItem(request: CreateKnowledgeItemRequest): Promise<KnowledgeItem> {
    try {
      const res = await knowledgeItemApi.createItem(request);
      isBackendLive = true;
      connectionChecked = true;
      return res;
    } catch (err: any) {
      if (err.message && (err.message.includes('Cannot connect') || err.message.includes('Network Error'))) {
        isBackendLive = false;
        connectionChecked = true;

        let inferredType = request.type;
        if (!inferredType) {
          if (request.url && request.url.trim().length > 0) {
            inferredType = 'WEBSITE';
          } else {
            inferredType = 'NOTE';
          }
        }

        const newItem: KnowledgeItem = {
          id: String(Date.now()),
          title: request.title,
          url: request.url || undefined,
          content: request.content || undefined,
          type: inferredType,
          status: request.status || 'INBOX',
          difficulty: request.difficulty ?? null,
          rating: request.rating ?? null,
          topic: request.topic ?? null,
          tags: request.tags || [],
          progress: request.status === 'LEARNING' ? 25 : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const items = getLocalItems();
        items.unshift(newItem);
        saveLocalItems(items);
        return newItem;
      }
      throw err;
    }
  },

  async updateItem(id: string | number, request: UpdateKnowledgeItemRequest): Promise<KnowledgeItem> {
    try {
      const res = await knowledgeItemApi.updateItem(id, request);
      isBackendLive = true;
      connectionChecked = true;
      return res;
    } catch (err: any) {
      if (err.message && (err.message.includes('Cannot connect') || err.message.includes('Network Error'))) {
        isBackendLive = false;
        connectionChecked = true;

        const items = getLocalItems();
        const index = items.findIndex(i => String(i.id) === String(id));
        if (index === -1) {
          throw new Error('Knowledge item not found.');
        }

        const updated: KnowledgeItem = {
          ...items[index],
          ...request,
          updatedAt: new Date().toISOString(),
        };

        items[index] = updated;
        saveLocalItems(items);
        return updated;
      }
      throw err;
    }
  },

  async deleteItem(id: string | number): Promise<void> {
    try {
      await knowledgeItemApi.deleteItem(id);
      isBackendLive = true;
      connectionChecked = true;
    } catch (err: any) {
      if (err.message && (err.message.includes('Cannot connect') || err.message.includes('Network Error'))) {
        isBackendLive = false;
        connectionChecked = true;
        const items = getLocalItems();
        const filtered = items.filter(i => String(i.id) !== String(id));
        saveLocalItems(filtered);
        return;
      }
      throw err;
    }
  },
};
