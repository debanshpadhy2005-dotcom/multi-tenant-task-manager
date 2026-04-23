import apiService from './api';
import { Task, TaskFilters, TaskStats, ApiResponse, PaginatedResponse } from '../types';

/**
 * Task Service
 */

export const taskService = {
  /**
   * Get all tasks with filters
   */
  async getTasks(
    filters: TaskFilters = {},
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Task>> {
    const params = {
      ...filters,
      page,
      limit,
    };
    return await apiService.get<PaginatedResponse<Task>>('/tasks', params);
  },

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<Task> {
    const response = await apiService.get<ApiResponse>(`/tasks/${id}`);
    return response.data as any;
  },

  /**
   * Create new task
   */
  async createTask(taskData: Partial<Task>): Promise<Task> {
    console.log('🔵 Task Service - Creating task:', taskData);
    const response = await apiService.post<ApiResponse>('/tasks', taskData);
    console.log('🔵 Task Service - Response:', response);
    return response.data as any;
  },

  /**
   * Update task
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const response = await apiService.put<ApiResponse>(`/tasks/${id}`, updates);
    return response.data as any;
  },

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<void> {
    await apiService.delete(`/tasks/${id}`);
  },

  /**
   * Get task statistics
   */
  async getStatistics(): Promise<TaskStats> {
    const response = await apiService.get<ApiResponse>('/tasks/stats');
    return response.data as any;
  },
};
