import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from '../auth/types/auth-user.js';
import type { CreateAttendanceSessionDto, MarkAttendanceDto } from './dto/attendance.dto.js';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async cohortRegister(cohortId: string, user: AuthUser) {
    await this.assertCohortAccess(cohortId, user);
    const [cohort, sessions] = await Promise.all([
      this.prisma.cohort.findUnique({
        where: { id: cohortId },
        include: { enrollments: { where: { isActive: true }, include: { learner: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } } } },
      }),
      this.prisma.attendanceSession.findMany({ where: { cohortId }, include: { records: true }, orderBy: { sessionDate: 'desc' } }),
    ]);
    if (!cohort) throw new NotFoundException('Cohort not found');
    return { cohort, sessions };
  }

  async createSession(dto: CreateAttendanceSessionDto, user: AuthUser) {
    await this.assertCohortAccess(dto.cohortId, user);
    return this.prisma.attendanceSession.create({
      data: { cohortId: dto.cohortId, sessionDate: new Date(dto.sessionDate), title: dto.title, createdById: user.id },
    });
  }

  async mark(sessionId: string, dto: MarkAttendanceDto, user: AuthUser) {
    const session = await this.prisma.attendanceSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Attendance session not found');
    await this.assertCohortAccess(session.cohortId, user);
    await this.prisma.$transaction(dto.records.map((record) => this.prisma.attendanceRecord.upsert({
      where: { sessionId_learnerId: { sessionId, learnerId: record.learnerId } },
      update: { status: record.status, note: record.note, markedById: user.id },
      create: { sessionId, learnerId: record.learnerId, status: record.status, note: record.note, markedById: user.id },
    })));
    await this.prisma.auditLog.create({ data: { actorId: user.id, action: 'ATTENDANCE_MARKED', entityType: 'AttendanceSession', entityId: sessionId, metadata: { records: dto.records.length } } });
    return this.cohortRegister(session.cohortId, user);
  }

  private async assertCohortAccess(cohortId: string, user: AuthUser) {
    if (user.role === 'ADMIN') return;
    const assignment = await this.prisma.cohortMentor.findUnique({ where: { cohortId_userId: { cohortId, userId: user.id } } });
    if (!assignment) throw new ForbiddenException('You are not assigned to this cohort');
  }
}
