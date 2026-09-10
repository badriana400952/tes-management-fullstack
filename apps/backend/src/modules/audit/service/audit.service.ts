import { Prisma } from '@prisma/client';
import {
  auditRepository,
  AuditRepository,
} from '../repository/audit.repository';

export const AuditActions = {
  USER_REGISTER: 'USER_REGISTER',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  TASK_CREATE: 'TASK_CREATE',
  TASK_UPDATE: 'TASK_UPDATE',
  TASK_DELETE: 'TASK_DELETE',
  TASK_STATUS_UPDATE: 'TASK_STATUS_UPDATE',
} as const;

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];

export const AuditEntity = {
  USER: 'User',
  TASK: 'Task',
  AUTH: 'Auth',
} as const;

export type AuditEntity = (typeof AuditEntity)[keyof typeof AuditEntity];

export interface AuditContext {
  userId?: string | null;
  ipAddress?: string | null;
}

export class AuditService {
  constructor(private readonly repository: AuditRepository = auditRepository) {}

  async record(
    action: AuditAction,
    entity: AuditEntity,
    entityId?: string | null,
    context?: AuditContext,
    metadata?: Prisma.InputJsonValue,
  ): Promise<void> {
    if (context?.ipAddress === '::1' || context?.ipAddress === '::ffff:127.0.0.1') {
      context = { ...context, ipAddress: '127.0.0.1' };
    }
    await this.repository.create({
      action,
      entity,
      entityId: entityId ?? null,
      userId: context?.userId ?? null,
      ipAddress: context?.ipAddress ?? null,
      metadata: metadata ?? null,
    });
  }
}

export const auditService = new AuditService();