import { Request, Response } from 'express';
import { taskService } from '../service/task.service';
import {
  CreateTaskInput,
  TaskQueryInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from '../schema/task.schema';

export class TaskController {
  async getTasks(req: Request, res: Response) {
    const userId = req.user!.id;
    const query = req.query as unknown as TaskQueryInput;
    const result = await taskService.getTasks(userId, query);
    res.json({ success: true, data: result });
  }

  async getTaskById(req: Request<{ id: string }>, res: Response) {
    const userId = req.user!.id;
    const task = await taskService.getTaskById(userId, req.params.id);
    res.json({ success: true, data: { task } });
  }

  async createTask(req: Request<never, never, CreateTaskInput>, res: Response) {
    const userId = req.user!.id;
    const task = await taskService.createTask(userId, req.body, {
      ipAddress: req.ip,
    });
    res.status(201).json({ success: true, data: { task } });
  }

  async updateTask(
    req: Request<{ id: string }, never, UpdateTaskInput>,
    res: Response,
  ) {
    const userId = req.user!.id;
    const task = await taskService.updateTask(
      userId,
      req.params.id,
      req.body,
      { ipAddress: req.ip },
    );
    res.json({ success: true, data: { task } });
  }

  async updateTaskStatus(
    req: Request<{ id: string }, never, UpdateTaskStatusInput>,
    res: Response,
  ) {
    const userId = req.user!.id;
    const task = await taskService.updateTaskStatus(
      userId,
      req.params.id,
      req.body.status,
      { ipAddress: req.ip },
    );
    res.json({ success: true, data: { task } });
  }

  async deleteTask(req: Request<{ id: string }>, res: Response) {
    const userId = req.user!.id;
    await taskService.deleteTask(userId, req.params.id, {
      ipAddress: req.ip,
    });
    res.json({ success: true, data: null });
  }
}

export const taskController = new TaskController();