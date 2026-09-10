import { AuditLog, Prisma } from '@prisma/client';
import { prisma } from '../../../config/database';

export interface CreateAuditLogInput {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue | null;
  ipAddress?: string | null;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entity?: string;
  page: number;
  limit: number;
}

export class AuditRepository {
  async create(data: CreateAuditLogInput): Promise<AuditLog> {
    return prisma.auditLog.create({
      data: {
        action: data.action,
        entity: data.entity,
        entityId: data.entityId ?? null,
        userId: data.userId ?? null,
        ipAddress: data.ipAddress ?? null,
        metadata:
          data.metadata === undefined || data.metadata === null
            ? Prisma.DbNull
            : data.metadata,
      },
    });
  }

  async findMany(filters: AuditLogFilters): Promise<AuditLog[]> {
    const { page, limit, userId, action, entity } = filters;

    return prisma.auditLog.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(action ? { action } : {}),
        ...(entity ? { entity } : {}),
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  }

  async count(filters: Omit<AuditLogFilters, 'page' | 'limit'>): Promise<number> {
    const { userId, action, entity } = filters;
    return prisma.auditLog.count({
      where: {
        ...(userId ? { userId } : {}),
        ...(action ? { action } : {}),
        ...(entity ? { entity } : {}),
      },
    });
  }
}

export const auditRepository = new AuditRepository();