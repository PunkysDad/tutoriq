import apiService, { ApiResponse } from './apiService';
import { ParentChildSummary, ChildDashboard, ChatHistoryEntry } from '../interfaces/interfaces';

export const parentPortalService = {
  async getChildren(): Promise<ApiResponse<ParentChildSummary[]>> {
    return apiService.get<ParentChildSummary[]>('/api/parent/children');
  },

  async getChildDashboard(childId: number): Promise<ApiResponse<ChildDashboard>> {
    return apiService.get<ChildDashboard>(`/api/parent/children/${childId}/dashboard`);
  },

  async getChildSessions(childId: number): Promise<ApiResponse<ChatHistoryEntry[]>> {
    return apiService.get<ChatHistoryEntry[]>(`/api/parent/children/${childId}/sessions`);
  },

  async linkChild(childEmail: string): Promise<ApiResponse<void>> {
    return apiService.post<void>('/api/parent/link', { childEmail });
  },

  async unlinkChild(childId: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/api/parent/children/${childId}`);
  },
};

export default parentPortalService;
