import { api } from './client';
import type { ApiSuccess } from '@/types/api';

export type PublicProgram = { id: string; name: string; description: string | null };
export type ApplicationInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  programId: string;
};
export type ApplicationReceipt = {
  id: string;
  status: 'SUBMITTED';
  submittedAt: string;
  applicantName: string;
  program: { id: string; name: string };
};

export const applicationsApi = {
  programs: async () => (await api.get<ApiSuccess<PublicProgram[]>>('/programs/public')).data.data,
  submit: async (input: ApplicationInput) => (await api.post<ApiSuccess<ApplicationReceipt>>('/applications', input)).data.data,
};
