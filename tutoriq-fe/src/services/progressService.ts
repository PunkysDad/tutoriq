import apiService, { ApiResponse } from './apiService';
import { ProgressDashboard, SubjectProgress } from '../interfaces/interfaces';

export const progressService = {
  async getDashboard(): Promise<ApiResponse<ProgressDashboard>> {
    return apiService.get<ProgressDashboard>('/api/progress/dashboard');
  },

  async getSubjectBreakdown(): Promise<ApiResponse<SubjectProgress[]>> {
    return apiService.get<SubjectProgress[]>('/api/progress/subjects');
  },

  async getStreak(): Promise<ApiResponse<{ currentStreak: number; longestStreak: number }>> {
    return apiService.get('/api/progress/streak');
  },
};

export default progressService;
