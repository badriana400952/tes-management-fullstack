import { z } from 'zod';

export const taskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
export const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z
    .string()
    .max(2000, 'Description is too long')
    .optional()
    .nullable(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  dueDate: z.coerce.date().optional().nullable(),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const updateTaskStatusSchema = z.object({
  status: taskStatusEnum,
});
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: taskStatusEnum.optional(),
  search: z.string().trim().max(200).optional(),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;

export const taskIdParamsSchema = z.object({
  id: z.string().min(1, 'Task id is required'),
});
export type TaskIdParams = z.infer<typeof taskIdParamsSchema>;