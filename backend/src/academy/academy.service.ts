import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from '../auth/types/auth-user.js';
import type { AssignCohortDto, AssignMentorDto, CreateCohortDto } from './dto/academy.dto.js';

@Injectable()
export class AcademyService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [applications, learners, activeCohorts, mentors, attendance, risks] = await this.prisma.$transaction([
      this.prisma.application.groupBy({ by: ['status'], _count: true }),
      this.prisma.learner.count({ where: { status: 'ACTIVE' } }),
      this.prisma.cohort.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { role: { in: ['MENTOR', 'INSTRUCTOR'] }, isActive: true } }),
      this.prisma.attendanceRecord.groupBy({ by: ['status'], _count: true }),
      this.prisma.learnerProgress.count({ where: { status: { in: ['NEEDS_ATTENTION', 'AT_RISK'] } } }),
    ]);
    return { applications, learners, activeCohorts, mentors, attendance, learnersAtRisk: risks };
  }

  listCohorts(user: AuthUser) {
    return this.prisma.cohort.findMany({
      where: user.role === 'ADMIN' ? {} : { mentors: { some: { userId: user.id } } },
      include: {
        program: { select: { id: true, name: true } },
        _count: { select: { enrollments: { where: { isActive: true } }, attendanceSessions: true } },
        mentors: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  createCohort(dto: CreateCohortDto) {
    if (new Date(dto.endDate) <= new Date(dto.startDate)) throw new BadRequestException('End date must be after start date');
    return this.prisma.cohort.create({
      data: {
        name: dto.name,
        programId: dto.programId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status ?? 'PLANNED',
      },
      include: { program: { select: { id: true, name: true } } },
    });
  }

  async listLearners(user: AuthUser, cohortId?: string) {
    const mentorCohorts = user.role === 'ADMIN' ? undefined : { some: { cohort: { mentors: { some: { userId: user.id } } }, isActive: true } };
    return this.prisma.learner.findMany({
      where: {
        ...(mentorCohorts ? { cohortEnrollments: mentorCohorts } : {}),
        ...(cohortId ? { cohortEnrollments: { some: { cohortId, isActive: true } } } : {}),
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        program: { select: { id: true, name: true } },
        cohortEnrollments: { where: { isActive: true }, include: { cohort: { select: { id: true, name: true } } } },
        progressSnapshots: { orderBy: { calculatedAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assignCohort(learnerId: string, dto: AssignCohortDto, actor: AuthUser) {
    const [learner, cohort] = await Promise.all([
      this.prisma.learner.findUnique({ where: { id: learnerId } }),
      this.prisma.cohort.findUnique({ where: { id: dto.cohortId } }),
    ]);
    if (!learner || !cohort) throw new NotFoundException('Learner or cohort not found');
    if (learner.programId !== cohort.programId) throw new BadRequestException('Learner and cohort must belong to the same programme');
    await this.prisma.$transaction([
      this.prisma.cohortEnrollment.updateMany({ where: { learnerId, isActive: true }, data: { isActive: false, leftAt: new Date() } }),
      this.prisma.cohortEnrollment.upsert({
        where: { cohortId_learnerId: { cohortId: dto.cohortId, learnerId } },
        update: { isActive: true, leftAt: null, joinedAt: new Date() },
        create: { cohortId: dto.cohortId, learnerId },
      }),
      this.prisma.auditLog.create({ data: { actorId: actor.id, action: 'LEARNER_COHORT_ASSIGNED', entityType: 'Learner', entityId: learnerId, metadata: { cohortId: dto.cohortId } } }),
    ]);
    return this.listLearners(actor, dto.cohortId);
  }

  listMentors() {
    return this.prisma.user.findMany({
      where: { role: { in: ['MENTOR', 'INSTRUCTOR'] }, isActive: true },
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
      orderBy: { firstName: 'asc' },
    });
  }

  async assignMentor(cohortId: string, dto: AssignMentorDto, actor: AuthUser) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user || !['MENTOR', 'INSTRUCTOR'].includes(user.role)) throw new BadRequestException('Select an active mentor or instructor');
    const assignment = await this.prisma.cohortMentor.upsert({
      where: { cohortId_userId: { cohortId, userId: dto.userId } },
      update: { isPrimary: dto.isPrimary ?? false },
      create: { cohortId, userId: dto.userId, isPrimary: dto.isPrimary ?? false },
    });
    await this.prisma.auditLog.create({ data: { actorId: actor.id, action: 'COHORT_MENTOR_ASSIGNED', entityType: 'Cohort', entityId: cohortId, metadata: { userId: dto.userId } } });
    return assignment;
  }
}
