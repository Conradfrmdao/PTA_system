import { api } from './client';
import type { ApiSuccess } from '@/types/api';

export type Cohort = {
  id: string; name: string; status: string; startDate: string; endDate: string;
  program: { id: string; name: string };
  _count?: { enrollments: number; attendanceSessions: number };
  mentors?: { user: { id: string; firstName: string; lastName: string; email: string } }[];
};
export type Learner = {
  id: string; status: string;
  user: { id: string; firstName: string; lastName: string; email: string; phone: string | null };
  program: { id: string; name: string };
  cohortEnrollments: { cohort: { id: string; name: string } }[];
  progressSnapshots: { overallScore: number; status: string; components: Record<string, number> }[];
};
export type Application = {
  id: string; firstName: string; lastName: string; email: string; phone: string | null; status: string; createdAt: string; reviewNote: string | null;
  program: { id: string; name: string };
  acceptedLearner?: { id: string; status: string } | null;
  invitationExpiresAt?: string | null;
};
export type ApplicationList = { items: Application[]; total: number; page: number; limit: number; totalPages: number };

const unwrap = <T>(request: Promise<{ data: ApiSuccess<T> }>) => request.then(({ data }) => data.data);

export const workspaceApi = {
  dashboard: () => unwrap(api.get('/academy/dashboard')),
  applications: (status?: string) => unwrap<ApplicationList>(api.get('/applications', { params: status ? { status } : {} })),
  reviewApplication: (id: string, input: { status: string; reviewNote?: string; cohortId?: string }) => unwrap<{ application: Application; setupUrl?: string; expiresAt?: string }>(api.patch(`/applications/${id}/review`, input)),
  reissueInvitation: (id: string) => unwrap<{ email: string; setupUrl: string; expiresAt: string }>(api.post(`/applications/${id}/invitation`)),
  cohorts: () => unwrap<Cohort[]>(api.get('/academy/cohorts')),
  createCohort: (input: { name: string; programId: string; startDate: string; endDate: string; status?: string }) => unwrap<Cohort>(api.post('/academy/cohorts', input)),
  learners: (cohortId?: string) => unwrap<Learner[]>(api.get('/academy/learners', { params: cohortId ? { cohortId } : {} })),
  assignCohort: (learnerId: string, cohortId: string) => unwrap(api.patch(`/academy/learners/${learnerId}/cohort`, { cohortId })),
  attendanceRegister: (cohortId: string) => unwrap<AttendanceRegister>(api.get(`/attendance/cohorts/${cohortId}`)),
  createAttendanceSession: (input: { cohortId: string; sessionDate: string; title?: string }) => unwrap<{ id: string }>(api.post('/attendance/sessions', input)),
  markAttendance: (sessionId: string, records: { learnerId: string; status: string }[]) => unwrap<AttendanceRegister>(api.put(`/attendance/sessions/${sessionId}/records`, { records })),
  progressCohort: (cohortId: string) => unwrap<ProgressCohort>(api.get(`/progress/cohorts/${cohortId}`)),
  setCompletion: (learnerId: string, moduleId: string, completed: boolean) => unwrap(api.put(`/progress/learners/${learnerId}/modules/${moduleId}`, { completed })),
  report: () => unwrap<ReportOverview>(api.get('/reports/overview')),
  myLearning: () => unwrap<LearnerPortal>(api.get('/portal/me')),
};

export type AttendanceRegister = {
  cohort: Cohort & { enrollments: { learner: Learner & { user: Learner['user'] } }[] };
  sessions: { id: string; title: string | null; sessionDate: string; records: { learnerId: string; status: string }[] }[];
};
export type ProgressCohort = Cohort & {
  program: Cohort['program'] & { courses: { id: string; name: string; modules: { id: string; name: string }[] }[] };
  enrollments: { learner: Learner & { moduleCompletions: { moduleId: string }[] } }[];
};
export type ReportOverview = {
  cohorts: Cohort[];
  applicationStatus: { status: string; _count: number }[];
  learnerStatus: { status: string; _count: number }[];
  attendanceStatus: { status: string; _count: number }[];
  progressStatus: Record<string, number>;
  learners: { overallScore: number; status: string; learner: { user: { firstName: string; lastName: string }; program: { name: string } } }[];
};
export type LearnerPortal = Learner & {
  cohortEnrollments: { cohort: Cohort & { mentors: { user: { firstName: string; lastName: string; email: string } }[] } }[];
  program: Learner['program'] & { courses: { id: string; name: string; modules: { id: string; name: string }[] }[] };
  attendanceRecords: { id: string; status: string; session: { title: string | null; sessionDate: string } }[];
  moduleCompletions: { moduleId: string }[];
  attendanceSummary: Record<string, number>;
};
