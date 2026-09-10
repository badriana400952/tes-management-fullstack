import { Prisma, User } from '@prisma/client';
import { prisma } from '../../../config/database';

export interface CreateRefreshTokenInput {
  token: string;
  userId: string;
  expiresAt: Date;
}

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async createRefreshToken(
    data: CreateRefreshTokenInput,
  ): Promise<void> {
    await prisma.refreshToken.create({ data });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  }
}

export const authRepository = new AuthRepository();