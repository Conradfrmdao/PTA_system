import { BadRequestException, ConflictException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CompleteRegistrationDto } from './dto/complete-registration.dto.js';

@Injectable()
export class RegistrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async invitation(rawToken: string) {
    const application = await this.findInvitation(rawToken);
    return {
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      phone: application.phone,
      program: application.program,
      cohort: application.acceptedCohort,
      expiresAt: application.invitationExpiresAt,
    };
  }

  async complete(rawToken: string, dto: CompleteRegistrationDto) {
    if (dto.password !== dto.confirmPassword) throw new BadRequestException('Passwords do not match');
    const dateOfBirth = new Date(dto.dateOfBirth);
    if (dateOfBirth >= new Date()) throw new BadRequestException('Date of birth must be in the past');

    const application = await this.findInvitation(rawToken);
    const existingUser = await this.prisma.user.findUnique({ where: { email: application.email } });
    if (existingUser) throw new ConflictException('An account already exists for this email');
    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.$transaction(async (tx) => {
      const account = await tx.user.create({
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
        data: {
          userId: account.id,
          applicationId: application.id,
          programId: application.programId,
          dateOfBirth,
          educationBackground: dto.educationBackground?.trim() || null,
          previousInstitution: dto.previousInstitution?.trim() || null,
        },
      });
      if (application.acceptedCohortId) {
        await tx.cohortEnrollment.create({ data: { cohortId: application.acceptedCohortId, learnerId: learner.id } });
      }
      await tx.application.update({
        where: { id: application.id },
        data: { invitationTokenHash: null, invitationExpiresAt: null },
      });
      await tx.auditLog.create({
        data: { actorId: account.id, action: 'LEARNER_REGISTRATION_COMPLETED', entityType: 'Learner', entityId: learner.id },
      });
      return account;
    });
    return { email: user.email, message: 'Account created successfully' };
  }

  private async findInvitation(rawToken: string) {
    if (!rawToken || rawToken.length < 32) throw new NotFoundException('Registration link is invalid');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const application = await this.prisma.application.findUnique({
      where: { invitationTokenHash: tokenHash },
      include: {
        program: { select: { id: true, name: true, description: true } },
        acceptedCohort: { select: { id: true, name: true, startDate: true, endDate: true } },
        acceptedLearner: { select: { id: true } },
      },
    });
    if (!application || application.status !== 'ACCEPTED') throw new NotFoundException('Registration link is invalid');
    if (application.acceptedLearner) throw new ConflictException('Registration has already been completed');
    if (!application.invitationExpiresAt || application.invitationExpiresAt <= new Date()) {
      throw new GoneException('Registration link has expired. Contact the Academy team for a new link');
    }
    return application;
  }
}
