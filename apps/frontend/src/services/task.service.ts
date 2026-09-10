import { api } from './api';
import { ApiResponse } from '@/types/api.types';
import {
  CreateTaskPayload,
  PagedTasksResponse,
  Task,
  TaskPriority,
  TaskQuery,
  TaskStatus,
  UpdateTaskPayload,
} from '@/types/task.types';

export const taskService = {
  async getTasks(query?: TaskQuery): Promise<PagedTasksResponse> {
    const res = await api.get<ApiResponse<PagedTasksResponse>>('/tasks', {
      params: query,
    });
    return res.data.data;
  },

  async getTaskById(id: string): Promise<Task> {
    const res = await api.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`);
    return res.data.data.task;
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const res = await api.post<ApiResponse<{ task: Task }>>('/tasks', payload);
    return res.data.data.task;
  },

  async updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const res = await api.put<ApiResponse<{ task: Task }>>(`/tasks/${id}`, payload);
    return res.data.data.task;
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const res = await api.patch<ApiResponse<{ task: Task }>>(`/tasks/${id}/status`, {
      status,
    });
    return res.data.data.task;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete<ApiResponse<null>>(`/tasks/${id}`);
  },
};
