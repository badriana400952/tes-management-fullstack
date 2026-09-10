import { beforeEach, jest } from '@jest/globals';

function modelDelegates() {
  return {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  };
}

export const prismaMock = {
  user: modelDelegates(),
  refreshToken: modelDelegates(),
  task: modelDelegates(),
  auditLog: modelDelegates(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client') as typeof import('@prisma/client');
  return {
    PrismaClient: jest.fn(() => prismaMock),
    Prisma: actual.Prisma,
  };
});

const mockSchemeNames = ['user', 'refreshToken', 'task', 'auditLog'] as const;

beforeEach(() => {
  for (const model of mockSchemeNames) {
    const delegate = prismaMock[model];
    for (const fn of Object.values(delegate)) {
      fn.mockReset();
    }
  }
  prismaMock.$connect.mockReset();
  prismaMock.$disconnect.mockReset();
});