import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import ENV_CONFIG from '../config/environment';

const apiClient: AxiosInstance = axios.create({
  baseURL: ENV_CONFIG.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export class TrialLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TrialLimitError';
  }
}

// Inject auth token into requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

async function apiCall<T>(
  endpoint: string,
  config: AxiosRequestConfig = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.request<T>({
      url: endpoint,
      ...config,
    });
    return { data: response.data, success: true };
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const backendMessage =
        error.response.data?.message ??
        error.response.data?.error ??
        null;

      const errorMessage =
        backendMessage ?? `HTTP ${error.response.status}: ${error.response.statusText}`;

      if (
        backendMessage &&
        (backendMessage.includes('Trial') ||
          backendMessage.includes('trial') ||
          backendMessage.includes('subscription') ||
          backendMessage.includes('limit reached'))
      ) {
        throw new TrialLimitError(backendMessage);
      }

      throw new Error(errorMessage);
    }

    if (error instanceof TrialLimitError) throw error;

    console.error('API Error:', error);
    return {
      data: {} as T,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export const apiService = {
  // Health check
  async checkHealth(): Promise<ApiResponse<string>> {
    return apiCall('/health');
  },

  // Generic request helpers
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return apiCall<T>(endpoint, { method: 'GET' });
  },

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return apiCall<T>(endpoint, { method: 'POST', data });
  },

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return apiCall<T>(endpoint, { method: 'PUT', data });
  },

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return apiCall<T>(endpoint, { method: 'DELETE' });
  },
};

export const testConnection = async (): Promise<boolean> => {
  const result = await apiService.checkHealth();
  if (result.success) {
    console.log('Backend connection successful:', result.data);
    return true;
  } else {
    console.error('Backend connection failed:', result.error);
    return false;
  }
};

export default apiService;
