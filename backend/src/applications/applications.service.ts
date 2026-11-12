import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from '../auth/types/auth-user.js';
import type { CreateApplicationDto } from './dto/create-application.dto.js';
import type { ListApplicationsDto } from './dto/list-applications.dto.js';
import type { ReviewApplicationDto } from './dto/review-application.dto.js';

const applicationInclude = {
  program: { select: { id: true, name: true } },
  reviewedBy: { select: { id: true, firstName: true, lastName: true } },
  acceptedLearner: {
    select: {
      id: true,
      status: true,
      cohortEnrollments: {
        where: { isActive: true },
        select: { cohort: { select: { id: true, name: true } } },
      },
    },
  },
} as const;

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateApplicationDto) {
    const program = await this.prisma.program.findFirst({ where: { id: dto.programId, isActive: true } });
    if (!program) throw new NotFoundException('Programme is not available');

    const existing = await this.prisma.application.findFirst({
      where: { email: dto.email, programId: dto.programId, status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'WAITLISTED', 'ACCEPTED'] } },
    });
    if (existing) throw new ConflictException('An active application already exists for this email and programme');

    const application = await this.prisma.application.create({
      data: dto,
      include: { program: { select: { id: true, name: true } } },
    });
    return {
      id: application.id,
      status: application.status,
      submittedAt: application.createdAt,
      applicantName: `${application.firstName} ${application.lastName}`,
      program: application.program,
    };
  }

  async list(query: ListApplicationsDto) {
    const where = query.status ? { status: query.status } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.application.findMany({
        where,
        include: applicationInclude,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.application.count({ where }),
    ]);
    return { items, page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) };
  }

  async get(id: string) {
    const application = await this.prisma.application.findUnique({ where: { id }, include: applicationInclude });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async review(id: string, dto: ReviewApplicationDto, reviewer: AuthUser) {
    if (!['UNDER_REVIEW', 'ACCEPTED', 'WAITLISTED', 'REJECTED'].includes(dto.status)) {
      throw new BadRequestException('Choose a valid review decision');
    }
    const application = await this.prisma.application.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('Application not found');
    if (application.status === 'ACCEPTED') throw new ConflictException('This application has already been accepted');

    let temporaryPassword: string | undefined;
    if (dto.status !== 'ACCEPTED') {
      const updated = await this.prisma.application.update({
        where: { id },
        data: { status: dto.status, reviewNote: dto.reviewNote, reviewedByUserId: reviewer.id },
        include: applicationInclude,
      });
      await this.audit(reviewer.id, 'APPLICATION_REVIEWED', id, { status: dto.status });
      return { application: updated };
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: application.email } });
    if (existingUser) throw new ConflictException('A user account already exists for this email');
    if (dto.cohortId) {
      const cohort = await this.prisma.cohort.findUnique({ where: { id: dto.cohortId } });
      if (!cohort || cohort.programId !== application.programId) {
        throw new BadRequestException('The selected cohort does not belong to the applied programme');
      }
    }

    temporaryPassword = `Pta!${randomBytes(6).toString('base64url')}`;
    const passwordHash = await argon2.hash(temporaryPassword);
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: application.email,
          firstName: application.firstName,
          lastName: application.lastName,
          phone: application.phone,
          role: 'LEARNER',
          passwordHash,
        },
      });
      const learner = await tx.learner.create({
        data: { userId: user.id, applicationId: application.id, programId: application.programId },
      });
      if (dto.cohortId) {
        await tx.cohortEnrollment.create({ data: { cohortId: dto.cohortId, learnerId: learner.id } });
      }
      const reviewed = await tx.application.update({
        where: { id },
        data: { status: 'ACCEPTED', reviewNote: dto.reviewNote, reviewedByUserId: reviewer.id },
        include: applicationInclude,
      });
      await tx.auditLog.create({
        data: { actorId: reviewer.id, action: 'APPLICATION_ACCEPTED', entityType: 'Application', entityId: id, metadata: { learnerId: learner.id } },
      });
      return reviewed;
    });
    return { application: result, temporaryPassword };
  }

  private audit(actorId: string, action: string, entityId: string, metadata: object) {
    return this.prisma.auditLog.create({ data: { actorId, action, entityType: 'Application', entityId, metadata } });
  }
}
