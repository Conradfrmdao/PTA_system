import { api } from './client';
import type { ApiSuccess, ApiUser, AuthPayload } from '@/types/api';

export const authApi = {
  async login(credentials: { email: string; password: string }) {
    const { data } = await api.post<ApiSuccess<AuthPayload>>('/auth/login', credentials);
    return data.data;
  },
  async refresh() {
    const { data } = await api.post<ApiSuccess<AuthPayload>>('/auth/refresh');
    return data.data;
  },
  async me() {
    const { data } = await api.get<ApiSuccess<ApiUser>>('/auth/me');
    return data.data;
  },
  async logout() {
    await api.post('/auth/logout');
  },
};
