export type Role = 'ADMIN' | 'MENTOR' | 'INSTRUCTOR' | 'LEARNER' | 'ALUMNI';

export type ApiUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: Role;
  isActive: boolean;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
};

export type AuthPayload = { user: ApiUser; accessToken: string };
