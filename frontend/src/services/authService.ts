import apiService from './api';
import { LoginCredentials, RegisterData, User, AuthTokens } from '../types';

export const authService = {
  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiService.post<any>('/auth/register', data);
    return response.data || response;
  },

  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiService.post<any>('/auth/login', credentials);
    return response.data || response;
  },

  async getProfile(): Promise<User> {
    const response = await apiService.get<any>('/auth/me');
    return response.data || response;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('auth-storage');
  },
};
