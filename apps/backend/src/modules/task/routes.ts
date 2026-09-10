import { Router } from 'express';
import { taskController } from './controller/task.controller';
import {
  createTaskSchema,
  taskIdParamsSchema,
  taskQuerySchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from './schema/task.schema';
import { authenticate, validate } from '../../shared/middleware';

const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.get(
  '/',
  validate(taskQuerySchema, ['query']),
  taskController.getTasks,
);

taskRouter.get(
  '/:id',
  validate(taskIdParamsSchema, ['params']),
  taskController.getTaskById,
);

taskRouter.post('/', validate(createTaskSchema), taskController.createTask);

taskRouter.put(
  '/:id',
  validate(taskIdParamsSchema, ['params']),
  validate(updateTaskSchema),
  taskController.updateTask,
);

taskRouter.patch(
  '/:id/status',
  validate(taskIdParamsSchema, ['params']),
  validate(updateTaskStatusSchema),
  taskController.updateTaskStatus,
);

taskRouter.delete(
  '/:id',
  validate(taskIdParamsSchema, ['params']),
  taskController.deleteTask,
);

export default taskRouter;