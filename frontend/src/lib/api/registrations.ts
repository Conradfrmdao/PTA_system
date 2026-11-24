import { api } from './client';
import type { ApiSuccess } from '@/types/api';

export type RegistrationInvitation = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  program: { id: string; name: string; description: string | null };
  cohort: { id: string; name: string; startDate: string; endDate: string } | null;
  expiresAt: string;
};

export type CompleteRegistrationInput = {
  dateOfBirth: string;
  educationBackground?: string;
  previousInstitution?: string;
  password: string;
  confirmPassword: string;
};

export const registrationsApi = {
  invitation: async (token: string) => (await api.get<ApiSuccess<RegistrationInvitation>>(`/registrations/${encodeURIComponent(token)}`)).data.data,
  complete: async (token: string, input: CompleteRegistrationInput) => (await api.post<ApiSuccess<{ email: string; message: string }>>(`/registrations/${encodeURIComponent(token)}/complete`, input)).data.data,
};
