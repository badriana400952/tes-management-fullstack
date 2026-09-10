import useSWR from 'swr';
import { taskService } from '@/services/task.service';
import {
  CreateTaskPayload,
  PagedTasksResponse,
  TaskPriority,
  TaskQuery,
  TaskStatus,
  UpdateTaskPayload,
} from '@/types/task.types';
import toast from 'react-hot-toast';

export const useTasks = (query?: TaskQuery) => {
  const swrKey = ['/tasks', JSON.stringify(query || {})];

  const { data, error, isLoading, isValidating, mutate } = useSWR<PagedTasksResponse>(
    swrKey,
    () => taskService.getTasks(query),
    {
      revalidateOnFocus: true,
      keepPreviousData: true,
    }
  );

  const createTask = async (payload: CreateTaskPayload) => {
    try {
      const newTask = await taskService.createTask(payload);
      // Optimistic update or mutate
      await mutate();
      toast.success('Task created successfully');
      return newTask;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = error.response?.data?.message || error.message || 'Failed to create task';
      toast.error(msg);
      throw err;
    }
  };

  const updateTask = async (id: string, payload: UpdateTaskPayload) => {
    try {
      const updated = await taskService.updateTask(id, payload);
      await mutate();
      toast.success('Task updated successfully');
      return updated;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = error.response?.data?.message || error.message || 'Failed to update task';
      toast.error(msg);
      throw err;
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    // Optimistic cache update
    if (data) {
      const updatedData: PagedTasksResponse = {
        ...data,
        data: data.data.map((t) => (t.id === id ? { ...t, status } : t)),
      };
      mutate(updatedData, false);
    }

    try {
      const updated = await taskService.updateTaskStatus(id, status);
      await mutate();
      toast.success(`Task moved to ${status.replace('_', ' ')}`);
      return updated;
    } catch (err: unknown) {
      await mutate(); // Revert back on error
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = error.response?.data?.message || error.message || 'Failed to update status';
      toast.error(msg);
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    // Optimistic cache removal
    if (data) {
      const filtered = {
        ...data,
        data: data.data.filter((t) => t.id !== id),
      };
      mutate(filtered, false);
    }

    try {
      await taskService.deleteTask(id);
      await mutate();
      toast.success('Task deleted');
    } catch (err: unknown) {
      await mutate(); // Revert on failure
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = error.response?.data?.message || error.message || 'Failed to delete task';
      toast.error(msg);
      throw err;
    }
  };

  return {
    tasks: data?.data || [],
    pagination: data?.pagination,
    summary: data?.summary || { TODO: 0, IN_PROGRESS: 0, DONE: 0 },
    isLoading,
    isValidating,
    error,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    mutate,
  };
};
