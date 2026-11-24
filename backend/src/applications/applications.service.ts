import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

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

    const invitation = this.createInvitation();
    const result = await this.prisma.$transaction(async (tx) => {
      const reviewed = await tx.application.update({
        where: { id },
        data: {
          status: 'ACCEPTED',
          reviewNote: dto.reviewNote,
          reviewedByUserId: reviewer.id,
          acceptedCohortId: dto.cohortId,
          invitationTokenHash: invitation.tokenHash,
          invitationExpiresAt: invitation.expiresAt,
          invitationCreatedAt: new Date(),
        },
        include: applicationInclude,
      });
      await tx.auditLog.create({
        data: { actorId: reviewer.id, action: 'APPLICATION_ACCEPTED', entityType: 'Application', entityId: id, metadata: { cohortId: dto.cohortId } },
      });
      return reviewed;
    });
    return { application: result, setupUrl: this.setupUrl(invitation.rawToken), expiresAt: invitation.expiresAt };
  }

  async reissueInvitation(id: string, reviewer: AuthUser) {
    const application = await this.prisma.application.findUnique({ where: { id }, include: { acceptedLearner: { select: { id: true } } } });
    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== 'ACCEPTED') throw new BadRequestException('Only accepted applications can receive a registration link');
    if (application.acceptedLearner) throw new ConflictException('This learner has already completed registration');

    const invitation = this.createInvitation();
    await this.prisma.$transaction([
      this.prisma.application.update({
        where: { id },
        data: {
          invitationTokenHash: invitation.tokenHash,
          invitationExpiresAt: invitation.expiresAt,
          invitationCreatedAt: new Date(),
        },
      }),
      this.prisma.auditLog.create({ data: { actorId: reviewer.id, action: 'REGISTRATION_INVITATION_REISSUED', entityType: 'Application', entityId: id } }),
    ]);
    return { email: application.email, setupUrl: this.setupUrl(invitation.rawToken), expiresAt: invitation.expiresAt };
  }

  private audit(actorId: string, action: string, entityId: string, metadata: object) {
    return this.prisma.auditLog.create({ data: { actorId, action, entityType: 'Application', entityId, metadata } });
  }

  private createInvitation() {
    const rawToken = randomBytes(32).toString('base64url');
    return {
      rawToken,
      tokenHash: createHash('sha256').update(rawToken).digest('hex'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  private setupUrl(token: string) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    return `${frontendUrl}/complete-registration?token=${encodeURIComponent(token)}`;
  }
}
