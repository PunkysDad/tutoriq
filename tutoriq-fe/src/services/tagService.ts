import apiService, { ApiResponse } from './apiService';
import { Tag, ChatHistoryEntry } from '../interfaces/interfaces';

export const tagService = {
  async getTags(): Promise<ApiResponse<Tag[]>> {
    return apiService.get<Tag[]>('/api/tags');
  },

  async createTag(name: string): Promise<ApiResponse<Tag>> {
    return apiService.post<Tag>('/api/tags', { name });
  },

  async deleteTag(tagId: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/api/tags/${tagId}`);
  },

  async getSessionTags(sessionId: number): Promise<ApiResponse<Tag[]>> {
    return apiService.get<Tag[]>(`/api/tags/session/${sessionId}`);
  },

  async assignTags(sessionId: number, tagIds: number[]): Promise<ApiResponse<void>> {
    return apiService.post<void>(`/api/tags/session/${sessionId}`, { tagIds });
  },

  async removeTag(sessionId: number, tagId: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/api/tags/session/${sessionId}/${tagId}`);
  },

  async getHistoryByTag(tagId: number): Promise<ApiResponse<ChatHistoryEntry[]>> {
    return apiService.get<ChatHistoryEntry[]>(`/api/chat/history?tagId=${tagId}`);
  },
};

export default tagService;
