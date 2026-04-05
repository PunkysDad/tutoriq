import apiService, { ApiResponse, TrialLimitError } from './apiService';
import { TutorSession, TutorMessage } from '../interfaces/interfaces';

export const tutorService = {
  async createSession(): Promise<ApiResponse<TutorSession>> {
    return apiService.post<TutorSession>('/api/tutor/sessions');
  },

  async getSessions(): Promise<ApiResponse<TutorSession[]>> {
    return apiService.get<TutorSession[]>('/api/tutor/sessions');
  },

  async getSession(sessionId: number): Promise<ApiResponse<TutorSession>> {
    return apiService.get<TutorSession>(`/api/tutor/sessions/${sessionId}`);
  },

  async sendMessage(sessionId: number, content: string): Promise<ApiResponse<TutorMessage>> {
    return apiService.post<TutorMessage>(`/api/tutor/sessions/${sessionId}/messages`, { content });
  },

  async deleteSession(sessionId: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/api/tutor/sessions/${sessionId}`);
  },
};

export { TrialLimitError };
export default tutorService;
