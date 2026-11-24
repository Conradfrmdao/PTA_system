import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [cohorts, applicationStatus, learnerStatus, attendanceStatus, latestProgress] = await Promise.all([
      this.prisma.cohort.findMany({
        include: { program: { select: { name: true } }, _count: { select: { enrollments: { where: { isActive: true } }, attendanceSessions: true } } },
        orderBy: { startDate: 'desc' },
      }),
      this.prisma.application.groupBy({ by: ['status'], _count: true }),
      this.prisma.learner.groupBy({ by: ['status'], _count: true }),
      this.prisma.attendanceRecord.groupBy({ by: ['status'], _count: true }),
      this.prisma.learnerProgress.findMany({
        distinct: ['learnerId'], orderBy: [{ learnerId: 'asc' }, { calculatedAt: 'desc' }],
        include: { learner: { include: { user: { select: { firstName: true, lastName: true } }, program: { select: { name: true } } } } },
      }),
    ]);
    const progressStatus = latestProgress.reduce<Record<string, number>>((result, item) => {
      result[item.status] = (result[item.status] ?? 0) + 1;
      return result;
    }, {});
    return { cohorts, applicationStatus, learnerStatus, attendanceStatus, progressStatus, learners: latestProgress };
  }
}
