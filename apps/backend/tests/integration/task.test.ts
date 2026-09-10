import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Express } from 'express';
import { Task } from '@prisma/client';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/database';
import { generateAccessToken } from '../../src/shared/security';

const request = require('supertest') as typeof import('supertest');

const mockOf = (fn: unknown): any => fn;

describe('Task API (integration)', () => {
  let app: Express;
  let token: string;

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

  const GROUPED = [
    { status: 'TODO', _count: { status: 2 } },
    { status: 'IN_PROGRESS', _count: { status: 1 } },
    { status: 'DONE', _count: { status: 1 } },
  ];

  function authed(method: 'get' | 'post' | 'put' | 'patch' | 'delete', path: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (request(app) as any)[method](path).set(
      'Authorization',
      `Bearer ${token}`,
    );
  }

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    token = generateAccessToken({
      id: 'user-1',
      email: 'alice@example.com',
      role: 'USER',
    });
    mockOf(prisma.auditLog.create).mockResolvedValue(undefined);
  });

  describe('GET /tasks', () => {
    it('returns 401 without authentication', async () => {
      const res = await request(app).get('/api/v1/tasks');
      expect(res.status).toBe(401);
    });

    it('returns paginated tasks with a status summary', async () => {
      mockOf(prisma.task.findMany).mockResolvedValue([baseTask]);
      mockOf(prisma.task.count).mockResolvedValue(8);
      mockOf(prisma.task.groupBy).mockResolvedValue(GROUPED);

      const res = await authed('get', '/api/v1/tasks?page=2&limit=4');

      expect(res.status).toBe(200);
      expect(res.body.data.data).toHaveLength(1);
      expect(res.body.data.pagination).toMatchObject({
        page: 2,
        limit: 4,
        total: 8,
        totalPages: 2,
        hasNext: false,
        hasPrevious: true,
      });
      expect(res.body.data.summary).toEqual({
        TODO: 2,
        IN_PROGRESS: 1,
        DONE: 1,
        total: 4,
      });
      const filters = mockOf(prisma.task.findMany).mock.calls[0][0];
      expect(filters.skip).toBe(4);
      expect(filters.take).toBe(4);
    });

    it('returns 400 for an invalid query', async () => {
      const res = await authed('get', '/api/v1/tasks?page=0&limit=999');
      expect(res.status).toBe(400);
    });
  });

  describe('POST /tasks', () => {
    it('creates a task and returns 201', async () => {
      mockOf(prisma.task.create).mockResolvedValue(baseTask);

      const res = await authed('post', '/api/v1/tasks').send({
        title: 'Quarterly report',
        priority: 'HIGH',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.task.id).toBe('task-1');
      const created = mockOf(prisma.task.create).mock.calls[0][0];
      expect(created.data.userId).toBe('user-1');
      expect(created.data.priority).toBe('HIGH');
    });

    it('returns 400 when title is missing', async () => {
      const res = await authed('post', '/api/v1/tasks').send({ description: 'x' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /tasks/:id', () => {
    it('returns the task when it belongs to the user', async () => {
      mockOf(prisma.task.findFirst).mockResolvedValue(baseTask);

      const res = await authed('get', '/api/v1/tasks/task-1');

      expect(res.status).toBe(200);
      expect(res.body.data.task.title).toBe('Quarterly report');
      expect(mockOf(prisma.task.findFirst).mock.calls[0][0].where).toEqual({
        id: 'task-1',
        userId: 'user-1',
      });
    });

    it('returns 404 when the task is not found', async () => {
      mockOf(prisma.task.findFirst).mockResolvedValue(null);

      const res = await authed('get', '/api/v1/tasks/task-1');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /tasks/:id', () => {
    it('updates an owned task', async () => {
      mockOf(prisma.task.updateMany).mockResolvedValue({ count: 1 });
      mockOf(prisma.task.findFirst).mockResolvedValue({
        ...baseTask,
        title: 'Updated title',
      });

      const res = await authed('put', '/api/v1/tasks/task-1').send({ title: 'Updated title' });

      expect(res.status).toBe(200);
      expect(res.body.data.task.title).toBe('Updated title');
      expect(mockOf(prisma.task.updateMany)).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'task-1', userId: 'user-1' } }),
      );
    });

    it('returns 404 when the task belongs to another user', async () => {
      mockOf(prisma.task.updateMany).mockResolvedValue({ count: 0 });

      const res = await authed('put', '/api/v1/tasks/task-1').send({ title: 'x' });
      expect(res.status).toBe(404);
    });

    it('returns 400 for an empty payload', async () => {
      const res = await authed('put', '/api/v1/tasks/task-1').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /tasks/:id/status', () => {
    it('updates the status', async () => {
      mockOf(prisma.task.updateMany).mockResolvedValue({ count: 1 });
      mockOf(prisma.task.findFirst).mockResolvedValue({
        ...(baseTask as Task),
        status: 'IN_PROGRESS',
      });

      const res = await authed('patch', '/api/v1/tasks/task-1/status').send({
        status: 'IN_PROGRESS',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.task.status).toBe('IN_PROGRESS');
    });

    it('returns 400 for an invalid status', async () => {
      const res = await authed('patch', '/api/v1/tasks/task-1/status').send({
        status: 'NOT_A_STATUS',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('deletes an owned task', async () => {
      mockOf(prisma.task.findFirst).mockResolvedValue(baseTask);
      mockOf(prisma.task.deleteMany).mockResolvedValue({ count: 1 });

      const res = await authed('delete', '/api/v1/tasks/task-1');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeNull();
      expect(mockOf(prisma.task.deleteMany)).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'task-1', userId: 'user-1' } }),
      );
    });

    it('returns 404 when nothing was deleted', async () => {
      mockOf(prisma.task.findFirst).mockResolvedValue(baseTask);
      mockOf(prisma.task.deleteMany).mockResolvedValue({ count: 0 });

      const res = await authed('delete', '/api/v1/tasks/task-1');
      expect(res.status).toBe(404);
    });
  });
});