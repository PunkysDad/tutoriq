export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN';
  gradeLevel?: string;
  subjectPreferences?: string[];
  subscriptionTier?: 'FREE_TRIAL' | 'BASIC' | 'PREMIUM';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'PARENT';
  gradeLevel?: string;
  subjectPreferences?: string[];
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  gradeLevel?: string;
  subjectPreferences?: string[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}
