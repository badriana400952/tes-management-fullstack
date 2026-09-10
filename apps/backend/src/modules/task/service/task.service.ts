import { Task, TaskStatus } from '@prisma/client';
import {
  TaskRepository,
  taskRepository,
  TaskStatusCount,
} from '../repository/task.repository';
import {
  CreateTaskInput,
  TaskQueryInput,
  UpdateTaskInput,
} from '../schema/task.schema';
import { NotFoundError } from '../../../shared/errors';
import { AuditActions, AuditEntity, auditService } from '../../audit/service/audit.service';

export interface ServiceContext {
  ipAddress?: string;
}

export interface PagedTasksResult {
  data: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  summary: TaskStatusCount;
}

export class TaskService {
  constructor(private readonly repository: TaskRepository = taskRepository) {}

  async getTasks(userId: string, query: TaskQueryInput): Promise<PagedTasksResult> {
    const { page, limit, status, search, sortBy, sortOrder } = query;
    const filters = {
      status,
      search,
      sortBy,
      sortOrder,
      skip: (page - 1) * limit,
      take: limit,
    };

    const [tasks, total, summary] = await Promise.all([
      this.repository.findManyByUserId(userId, filters),
      this.repository.countByUserId(userId, filters),
      this.repository.countGroupByStatus(userId),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
      summary,
    };
  }

  async getTaskById(userId: string, taskId: string): Promise<Task> {
    const task = await this.repository.findByIdAndUserId(taskId, userId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    return task;
  }

  async createTask(
    userId: string,
    payload: CreateTaskInput,
    context?: ServiceContext,
  ): Promise<Task> {
    const task = await this.repository.create(userId, payload);

    await auditService.record(
      AuditActions.TASK_CREATE,
      AuditEntity.TASK,
      task.id,
      { userId, ipAddress: context?.ipAddress },
      { title: task.title, status: task.status, priority: task.priority },
    );

    return task;
  }

  async updateTask(
    userId: string,
    taskId: string,
    payload: UpdateTaskInput,
    context?: ServiceContext,
  ): Promise<Task> {
    const task = await this.repository.update(taskId, userId, payload);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    await auditService.record(
      AuditActions.TASK_UPDATE,
      AuditEntity.TASK,
      task.id,
      { userId, ipAddress: context?.ipAddress },
      { fields: Object.keys(payload) },
    );

    return task;
  }

  async deleteTask(
    userId: string,
    taskId: string,
    context?: ServiceContext,
  ): Promise<void> {
    const task = await this.repository.findByIdAndUserId(taskId, userId);
    const deleted = await this.repository.delete(taskId, userId);
    if (!deleted) {
      throw new NotFoundError('Task not found');
    }

    await auditService.record(
      AuditActions.TASK_DELETE,
      AuditEntity.TASK,
      taskId,
      { userId, ipAddress: context?.ipAddress },
      task ? { title: task.title, status: task.status } : undefined,
    );
  }

  async updateTaskStatus(
    userId: string,
    taskId: string,
    status: TaskStatus,
    context?: ServiceContext,
  ): Promise<Task> {
    const task = await this.updateTask(userId, taskId, { status }, context);

    await auditService.record(
      AuditActions.TASK_STATUS_UPDATE,
      AuditEntity.TASK,
      task.id,
      { userId, ipAddress: context?.ipAddress },
      { status },
    );

    return task;
  }
}

export const taskService = new TaskService();