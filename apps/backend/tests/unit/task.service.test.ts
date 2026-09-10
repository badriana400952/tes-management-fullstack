import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Task } from '@prisma/client';
import {
  TaskQueryFilters,
  TaskRepository,
  TaskStatusCount,
} from '../../src/modules/task/repository/task.repository';
import { CreateTaskInput, UpdateTaskInput } from '../../src/modules/task/schema/task.schema';
import { TaskService } from '../../src/modules/task/service/task.service';
import { NotFoundError } from '../../src/shared/errors';

describe('TaskService', () => {
  const mockRepository = {
    findManyByUserId: jest.fn<(userId: string, filters: TaskQueryFilters) => Promise<Task[]>>(),
    countByUserId: jest.fn<
      (userId: string, filters: Pick<TaskQueryFilters, 'status' | 'search'>) => Promise<number>
    >(),
    countGroupByStatus: jest.fn<(userId: string) => Promise<TaskStatusCount>>(),
    findByIdAndUserId: jest.fn<(id: string, userId: string) => Promise<Task | null>>(),
    create: jest.fn<(userId: string, data: CreateTaskInput) => Promise<Task>>(),
    update: jest.fn<(id: string, userId: string, data: UpdateTaskInput) => Promise<Task | null>>(),
    delete: jest.fn<(id: string, userId: string) => Promise<boolean>>(),
  };

  const service = new TaskService(mockRepository as unknown as TaskRepository);

  const baseTask: Task = {
    id: 'task-1',
    userId: 'user-1',
    title: 'Quarterly report',
    description: null,
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('returns paged tasks with summary', async () => {
      mockRepository.findManyByUserId.mockResolvedValue([baseTask]);
      mockRepository.countByUserId.mockResolvedValue(10);
      mockRepository.countGroupByStatus.mockResolvedValue({
        TODO: 5,
        IN_PROGRESS: 3,
        DONE: 2,
        total: 10,
      });

      const result = await service.getTasks('user-1', {
        page: 2,
        limit: 4,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toEqual([baseTask]);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 4,
        total: 10,
        totalPages: 3,
        hasNext: true,
        hasPrevious: true,
      });
      expect(result.summary.total).toBe(10);

      const filters = mockRepository.findManyByUserId.mock.calls[0][1];
      expect(filters.skip).toBe(4);
      expect(filters.take).toBe(4);
    });

    it('marks last page with hasNext=false', async () => {
      mockRepository.findManyByUserId.mockResolvedValue([]);
      mockRepository.countByUserId.mockResolvedValue(8);
      mockRepository.countGroupByStatus.mockResolvedValue({
        TODO: 0,
        IN_PROGRESS: 0,
        DONE: 0,
        total: 0,
      });

      const result = await service.getTasks('user-1', {
        page: 2,
        limit: 4,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrevious).toBe(true);
    });
  });

  describe('getTaskById', () => {
    it('returns the task when it belongs to the user', async () => {
      mockRepository.findByIdAndUserId.mockResolvedValue(baseTask);

      const task = await service.getTaskById('user-1', 'task-1');
      expect(task.id).toBe('task-1');
      expect(mockRepository.findByIdAndUserId).toHaveBeenCalledWith('task-1', 'user-1');
    });

    it('throws NotFoundError when task is missing or not owned', async () => {
      mockRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(service.getTaskById('user-1', 'missing')).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('createTask', () => {
    it('creates a task for the user', async () => {
      mockRepository.create.mockResolvedValue(baseTask);

      const task = await service.createTask(
        'user-1',
        { title: 'Quarterly report' },
        { ipAddress: '127.0.0.1' },
      );

      expect(task).toEqual(baseTask);
      expect(mockRepository.create).toHaveBeenCalledWith('user-1', {
        title: 'Quarterly report',
      });
    });
  });

  describe('updateTask', () => {
    it('updates a task owned by the user', async () => {
      const updated = { ...baseTask, title: 'Updated title' };
      mockRepository.update.mockResolvedValue(updated);

      const task = await service.updateTask('user-1', 'task-1', { title: 'Updated title' });

      expect(task.title).toBe('Updated title');
      expect(mockRepository.update).toHaveBeenCalledWith('task-1', 'user-1', {
        title: 'Updated title',
      });
    });

    it('throws NotFoundError when nothing was updated', async () => {
      mockRepository.update.mockResolvedValue(null);

      await expect(
        service.updateTask('user-1', 'other-user-task', { title: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('deleteTask', () => {
    it('deletes a task owned by the user', async () => {
      mockRepository.findByIdAndUserId.mockResolvedValue(baseTask);
      mockRepository.delete.mockResolvedValue(true);

      await expect(
        service.deleteTask('user-1', 'task-1', { ipAddress: '127.0.0.1' }),
      ).resolves.toBeUndefined();
      expect(mockRepository.delete).toHaveBeenCalledWith('task-1', 'user-1');
    });

    it('throws NotFoundError when delete affected zero rows', async () => {
      mockRepository.findByIdAndUserId.mockResolvedValue(baseTask);
      mockRepository.delete.mockResolvedValue(false);

      await expect(service.deleteTask('user-1', 'other-user-task')).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('updates status and returns the task', async () => {
      const updated: Task = { ...baseTask, status: 'DONE' };
      mockRepository.update.mockResolvedValue(updated);

      const task = await service.updateTaskStatus('user-1', 'task-1', 'DONE');

      expect(task.status).toBe('DONE');
    });
  });
});