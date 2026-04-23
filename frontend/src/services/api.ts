import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

console.log('🌐 API Service initialized with URL:', API_URL);

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        console.log('📤 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          hasToken: !!token,
          data: config.data
        });
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors
    this.api.interceptors.response.use(
      (response) => {
        console.log('📥 API Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data
        });
        return response;
      },
      async (error: AxiosError<any>) => {
        console.error('❌ API Error:', {
          status: error.response?.status,
          url: error.config?.url,
          error: error.response?.data
        });

        const originalRequest = error.config as any;

        // Handle 401 - Try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken,
              });

              const { accessToken } = response.data.data.tokens;
              localStorage.setItem('accessToken', accessToken);

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - logout user
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('auth-storage');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Don't show toast for 401 errors (handled by redirect)
        if (error.response?.status !== 401) {
          const message = error.response?.data?.error || 'An error occurred';
          toast.error(message);
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete(url);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
