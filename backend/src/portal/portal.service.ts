import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PortalService {
  constructor(private readonly prisma: PrismaService) {}

  async learner(userId: string) {
    const learner = await this.prisma.learner.findUnique({
      where: { userId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        program: { include: { courses: { where: { isActive: true }, orderBy: { sortOrder: 'asc' }, include: { modules: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } } } } },
        cohortEnrollments: { where: { isActive: true }, include: { cohort: { include: { mentors: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } } } } },
        attendanceRecords: { include: { session: { select: { title: true, sessionDate: true } } }, orderBy: { createdAt: 'desc' } },
        moduleCompletions: true,
        progressSnapshots: { orderBy: { calculatedAt: 'desc' }, take: 1 },
      },
    });
    if (!learner) throw new NotFoundException('Learner profile not found');
    const totals = learner.attendanceRecords.reduce<Record<string, number>>((result, record) => {
      result[record.status] = (result[record.status] ?? 0) + 1;
      return result;
    }, {});
    return { ...learner, attendanceSummary: totals };
  }
}
