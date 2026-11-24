import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from '../auth/types/auth-user.js';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async cohort(cohortId: string, user: AuthUser) {
    await this.assertAccess(cohortId, user);
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      include: {
        program: { include: { courses: { where: { isActive: true }, orderBy: { sortOrder: 'asc' }, include: { modules: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } } } } },
        enrollments: { where: { isActive: true }, include: { learner: { include: { user: { select: { firstName: true, lastName: true, email: true } }, moduleCompletions: true, progressSnapshots: { orderBy: { calculatedAt: 'desc' }, take: 1 } } } } },
      },
    });
    if (!cohort) throw new NotFoundException('Cohort not found');
    return cohort;
  }

  async setCompletion(learnerId: string, moduleId: string, completed: boolean, user: AuthUser) {
    const learner = await this.prisma.learner.findUnique({ where: { id: learnerId }, include: { cohortEnrollments: { where: { isActive: true }, take: 1 } } });
    if (!learner) throw new NotFoundException('Learner not found');
    if (learner.cohortEnrollments[0]) await this.assertAccess(learner.cohortEnrollments[0].cohortId, user);
    if (completed) {
      await this.prisma.moduleCompletion.upsert({ where: { learnerId_moduleId: { learnerId, moduleId } }, update: { completedAt: new Date(), markedByUserId: user.id }, create: { learnerId, moduleId, markedByUserId: user.id } });
    } else {
      await this.prisma.moduleCompletion.deleteMany({ where: { learnerId, moduleId } });
    }
    return this.recalculate(learnerId, learner.cohortEnrollments[0]?.cohortId);
  }

  async recalculate(learnerId: string, cohortId?: string) {
    const learner = await this.prisma.learner.findUnique({ where: { id: learnerId }, include: { program: { include: { courses: { where: { isActive: true }, include: { modules: { where: { isActive: true } } } } } } } });
    if (!learner) throw new NotFoundException('Learner not found');
    const modules = learner.program.courses.flatMap((course) => course.modules);
    const [completed, attendance] = await Promise.all([
      this.prisma.moduleCompletion.count({ where: { learnerId, moduleId: { in: modules.map((module) => module.id) } } }),
      this.prisma.attendanceRecord.groupBy({ by: ['status'], where: { learnerId }, _count: true }),
    ]);
    const attendanceTotal = attendance.reduce((sum, item) => sum + item._count, 0);
    const attended = attendance.filter((item) => ['PRESENT', 'LATE'].includes(item.status)).reduce((sum, item) => sum + item._count, 0);
    const attendanceScore = attendanceTotal ? (attended / attendanceTotal) * 100 : 0;
    const courseScore = modules.length ? (completed / modules.length) * 100 : 0;
    const overallScore = Math.round((attendanceScore * 0.5 + courseScore * 0.5) * 10) / 10;
    const status = overallScore >= 70 ? 'ON_TRACK' : overallScore >= 45 ? 'NEEDS_ATTENTION' : 'AT_RISK';
    return this.prisma.learnerProgress.create({ data: { learnerId, cohortId, overallScore, status, components: { attendance: attendanceScore, courseCompletion: courseScore, completedModules: completed, totalModules: modules.length } } });
  }

  private async assertAccess(cohortId: string, user: AuthUser) {
    if (user.role === 'ADMIN') return;
    const assignment = await this.prisma.cohortMentor.findUnique({ where: { cohortId_userId: { cohortId, userId: user.id } } });
    if (!assignment) throw new ForbiddenException('You are not assigned to this cohort');
  }
}
