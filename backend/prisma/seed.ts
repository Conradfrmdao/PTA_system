import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import { PrismaClient, Role } from '../src/generated/prisma/client.js';

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) throw new Error('DATABASE_URL is required to seed the database');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
const demoPassword = process.env['SEED_DEMO_PASSWORD'] ?? 'PtaDemo!2026';

async function upsertUser(email: string, firstName: string, lastName: string, role: Role) {
  return prisma.user.upsert({
    where: { email },
    update: { firstName, lastName, role, isActive: true },
    create: { email, firstName, lastName, role, passwordHash: await argon2.hash(demoPassword) },
  });
}

async function main() {
  const existingProgram = await prisma.program.findFirst({ where: { name: 'Software Development' } });
  const program = existingProgram ?? await prisma.program.create({
    data: { name: 'Software Development', description: 'Practical full-stack software development.' },
  });

  const existingCohort = await prisma.cohort.findFirst({ where: { name: 'November 2026', programId: program.id } });
  const cohort = existingCohort ?? await prisma.cohort.create({
    data: {
      name: 'November 2026',
      programId: program.id,
      startDate: new Date('2026-11-02T06:00:00.000Z'),
      endDate: new Date('2027-05-28T15:00:00.000Z'),
      status: 'ACTIVE',
    },
  });

  const admin = await upsertUser('admin@pivosoftacademy.com', 'Academy', 'Admin', 'ADMIN');
  const mentor = await upsertUser('mentor@pivosoftacademy.com', 'Sarah', 'Mentor', 'MENTOR');
  const learnerUser = await upsertUser('learner@pivosoftacademy.com', 'Amina', 'Learner', 'LEARNER');

  const learner = await prisma.learner.upsert({
    where: { userId: learnerUser.id },
    update: { programId: program.id, status: 'ACTIVE' },
    create: { userId: learnerUser.id, programId: program.id },
  });
  await prisma.cohortEnrollment.upsert({
    where: { cohortId_learnerId: { cohortId: cohort.id, learnerId: learner.id } },
    update: { isActive: true, leftAt: null },
    create: { cohortId: cohort.id, learnerId: learner.id },
  });
  await prisma.cohortMentor.upsert({
    where: { cohortId_userId: { cohortId: cohort.id, userId: mentor.id } },
    update: { isPrimary: true },
    create: { cohortId: cohort.id, userId: mentor.id, isPrimary: true },
  });

  console.info(`Seed complete. Demo password: ${demoPassword}`);
  console.info(`Admin: ${admin.email}`);
  console.info(`Mentor: ${mentor.email}`);
  console.info(`Learner: ${learnerUser.email}`);
}

await main().finally(() => prisma.$disconnect());
