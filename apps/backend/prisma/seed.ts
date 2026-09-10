import bcrypt from 'bcryptjs';
import { PrismaClient, TaskPriority, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      passwordHash,
      name: 'Alice Johnson',
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      passwordHash,
      name: 'Bob Smith',
    },
  });

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      {
        userId: alice.id,
        title: 'Setup development environment',
        description: 'Install Node.js, PostgreSQL, and Docker locally.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: lastWeek,
      },
      {
        userId: alice.id,
        title: 'Implement JWT authentication',
        description: 'Add register, login, and refresh-token flows',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
        dueDate: tomorrow,
      },
      {
        userId: alice.id,
        title: 'Write integration tests',
        description: 'Cover auth and task endpoints with supertest.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: inThreeDays,
      },
      {
        userId: bob.id,
        title: 'Prepare demo slides',
        description: 'Summarize architecture and decisions for the review.',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        dueDate: inThreeDays,
      },
    ],
  });

  // eslint-disable-next-line no-console
  console.log('Seed finished:');
  // eslint-disable-next-line no-console
  console.log({ admin: admin.email, alice: alice.email, bob: bob.email });
  // eslint-disable-next-line no-console
  console.log('All test passwords: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });