import apiService, { ApiResponse } from './apiService';
import { ChatHistoryEntry, ChatSummaryResponse, TutorMessage } from '../interfaces/interfaces';

export const chatHistoryService = {
  async getChatHistory(): Promise<ApiResponse<ChatHistoryEntry[]>> {
    return apiService.get<ChatHistoryEntry[]>('/api/chat/history');
  },

  async getSessionMessages(sessionId: number): Promise<ApiResponse<TutorMessage[]>> {
    return apiService.get<TutorMessage[]>(`/api/chat/history/${sessionId}`);
  },

  async deleteSession(sessionId: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/api/chat/history/${sessionId}`);
  },

  async generateSummary(sessionIds: number[]): Promise<ApiResponse<ChatSummaryResponse>> {
    return apiService.post<ChatSummaryResponse>('/api/chat/summary', { sessionIds });
  },
};

export default chatHistoryService;
