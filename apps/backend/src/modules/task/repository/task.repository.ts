import { Prisma, Task, TaskStatus } from '@prisma/client';
import { prisma } from '../../../config/database';
import { CreateTaskInput, UpdateTaskInput } from '../schema/task.schema';

export type TaskSortField =
  | 'createdAt'
  | 'updatedAt'
  | 'dueDate'
  | 'priority'
  | 'title';

export interface TaskQueryFilters {
  status?: TaskStatus;
  search?: string;
  sortBy: TaskSortField;
  sortOrder: 'asc' | 'desc';
  skip: number;
  take: number;
}

export interface TaskStatusCount {
  TODO: number;
  IN_PROGRESS: number;
  DONE: number;
  total: number;
}

function buildWhere(
  userId: string,
  filters: Pick<TaskQueryFilters, 'status' | 'search'>,
): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = { userId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
}

function buildOrderBy(filters: TaskQueryFilters): Prisma.TaskOrderByWithRelationInput {
  if (filters.sortBy === 'dueDate') {
    return {
      dueDate: { sort: filters.sortOrder, nulls: 'last' },
    };
  }
  return { [filters.sortBy]: filters.sortOrder };
}

export class TaskRepository {
  async findManyByUserId(
    userId: string,
    filters: TaskQueryFilters,
  ): Promise<Task[]> {
    const where = buildWhere(userId, filters);
    const orderBy = buildOrderBy(filters);

    return prisma.task.findMany({
      where,
      orderBy,
      skip: filters.skip,
      take: filters.take,
    });
  }

  async countByUserId(
    userId: string,
    filters: Pick<TaskQueryFilters, 'status' | 'search'>,
  ): Promise<number> {
    const where = buildWhere(userId, filters);
    return prisma.task.count({ where });
  }

  async countGroupByStatus(userId: string): Promise<TaskStatusCount> {
    const grouped = await prisma.task.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true },
    });

    const statusMap = new Map<TaskStatus, number>(
      grouped.map((g) => [g.status, g._count.status]),
    );

    const counts = {
      TODO: statusMap.get('TODO') ?? 0,
      IN_PROGRESS: statusMap.get('IN_PROGRESS') ?? 0,
      DONE: statusMap.get('DONE') ?? 0,
    };

    return {
      ...counts,
      total: counts.TODO + counts.IN_PROGRESS + counts.DONE,
    };
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Task | null> {
    return prisma.task.findFirst({ where: { id, userId } });
  }

  async create(userId: string, data: CreateTaskInput): Promise<Task> {
    return prisma.task.create({
      data: {
        userId,
        title: data.title,
        ...(data.description !== undefined && data.description !== null
          ? { description: data.description }
          : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
        ...(data.dueDate !== undefined && data.dueDate !== null
          ? { dueDate: data.dueDate }
          : {}),
      },
    });
  }

  async update(
    id: string,
    userId: string,
    data: UpdateTaskInput,
  ): Promise<Task | null> {
    const result = await prisma.task.updateMany({
      where: { id, userId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
        ...(data.dueDate !== undefined ? { dueDate: data.dueDate } : {}),
      },
    });

    if (result.count === 0) return null;
    return this.findByIdAndUserId(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await prisma.task.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  }
}

export const taskRepository = new TaskRepository();