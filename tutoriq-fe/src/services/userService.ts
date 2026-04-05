import apiService from './apiService';
import { ApiResponse } from './apiService';
import { User } from '../interfaces/interfaces';

export const userService = {
  async getUserProfile(): Promise<ApiResponse<User>> {
    return apiService.get<User>('/api/users/me');
  },

  async updateUserProfile(payload: Partial<User>): Promise<ApiResponse<User>> {
    return apiService.put<User>('/api/users/me', payload);
  },
};

export default userService;
