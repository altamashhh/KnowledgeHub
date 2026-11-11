import { apiClient, getErrorMessage } from './client';
import {
  KnowledgeItem,
  CreateKnowledgeItemRequest,
  UpdateKnowledgeItemRequest,
  KnowledgeItemQueryParams,
  PageResponse,
} from '../types';

export const knowledgeItemApi = {

  /**
   * Fetch paginated and filtered knowledge items
   * GET /api/v1/items
   */
  async getItems(
    params: KnowledgeItemQueryParams = {}
  ): Promise<PageResponse<KnowledgeItem>> {

    try {
      const cleanParams: Record<string, any> = {};

      if (params.keyword?.trim()) {
        cleanParams.keyword = params.keyword.trim();
      }

      if (params.status && params.status !== 'ALL') {
        cleanParams.status = params.status;
      }

      if (params.type && params.type !== 'ALL') {
        cleanParams.type = params.type;
      }

      if (params.difficulty && params.difficulty !== 'ALL') {
        cleanParams.difficulty = params.difficulty;
      }

      if (params.topicId) {
        cleanParams.topicId = params.topicId;
      }

      if (params.topic) {
        cleanParams.topic = params.topic;
      }

      if (params.tagName) {
        cleanParams.tagName = params.tagName;
      }

      if (params.tag) {
        cleanParams.tag = params.tag;
      }

      if (typeof params.page === 'number') {
        cleanParams.page = params.page;
      }

      if (typeof params.size === 'number') {
        cleanParams.size = params.size;
      }

      if (params.sort) {
        cleanParams.sort = params.sort;
      }

      const response = await apiClient.get<any>(
        '/api/v1/items',
        {
          params: cleanParams,
        }
      );

      /*
       * Backend response:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: {
       *      content: [...],
       *      page: 0,
       *      size: 10,
       *      totalElements: 9,
       *      totalPages: 1,
       *      last: true
       *   }
       * }
       *
       * Therefore we need response.data.data.
       */
      const responseBody = response.data;

      const data = responseBody?.data ?? responseBody;

      // Handle a plain array response
      if (Array.isArray(data)) {
        return {
          content: data,
          pageNumber: params.page || 0,
          pageSize: params.size || data.length,
          totalElements: data.length,
          totalPages: 1,
          first: true,
          last: true,
          empty: data.length === 0,
        };
      }

      const content = data?.content || data?.items || [];

      return {
        content,

        pageNumber:
          data?.pageable?.pageNumber ??
          data?.page ??
          data?.number ??
          data?.pageNumber ??
          params.page ??
          0,

        pageSize:
          data?.pageable?.pageSize ??
          data?.size ??
          data?.pageSize ??
          params.size ??
          10,

        totalElements:
          data?.totalElements ??
          data?.total ??
          content.length,

        totalPages:
          data?.totalPages ??
          (data?.totalElements
            ? Math.ceil(
              data.totalElements / (params.size || 10)
            )
            : 1),

        first:
          data?.first ??
          ((params.page || 0) === 0),

        last:
          data?.last ??
          true,

        empty:
          data?.empty ??
          (content.length === 0),
      };

    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },


  /**
   * Fetch single knowledge item by ID
   * GET /api/v1/items/{id}
   */
  async getItemById(
    id: string | number
  ): Promise<KnowledgeItem> {

    try {
      const response = await apiClient.get<any>(
        `/api/v1/items/${id}`
      );

      /*
       * Backend returns:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: { ...item }
       * }
       *
       * So return response.data.data.
       */
      return response.data?.data ?? response.data;

    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },


  /**
   * Create a new knowledge item
   * POST /api/v1/items
   */
  async createItem(
    item: CreateKnowledgeItemRequest
  ): Promise<KnowledgeItem> {

    try {

      // Respect backend defaults
      let inferredType = item.type;

      if (!inferredType) {
        if (item.url && item.url.trim().length > 0) {
          inferredType = 'WEBSITE';
        } else {
          inferredType = 'NOTE';
        }
      }

      const payload: CreateKnowledgeItemRequest = {
        title: item.title,
        url: item.url || undefined,
        content: item.content || undefined,
        type: inferredType,
        status: item.status || 'INBOX',
        difficulty: item.difficulty ?? null,
        rating: item.rating ?? null,
        topic: item.topic ?? null,
        tags: item.tags || [],
      };

      const response = await apiClient.post<any>(
        '/api/v1/items',
        payload
      );

      /*
       * Backend returns an ApiResponse wrapper.
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: { created item }
       * }
       *
       * Return the actual KnowledgeItem.
       */
      return response.data?.data ?? response.data;

    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },


  /**
   * Update an existing knowledge item
   * PUT /api/v1/items/{id}
   */
  async updateItem(
    id: string | number,
    item: UpdateKnowledgeItemRequest
  ): Promise<KnowledgeItem> {

    try {

      const response = await apiClient.put<any>(
        `/api/v1/items/${id}`,
        item
      );

      /*
       * Backend returns:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: { updated item }
       * }
       */
      return response.data?.data ?? response.data;

    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },


  /**
   * Delete a knowledge item
   * DELETE /api/v1/items/{id}
   */
  async deleteItem(
    id: string | number
  ): Promise<void> {

    try {

      await apiClient.delete(
        `/api/v1/items/${id}`
      );

    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};