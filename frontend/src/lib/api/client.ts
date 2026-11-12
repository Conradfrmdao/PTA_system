import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth';
import type { ApiError, ApiSuccess, AuthPayload } from '@/types/api';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  withCredentials: true,
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type RetriableRequest = InternalAxiosRequestConfig & { _retried?: boolean };
let refreshRequest: Promise<string> | null = null;

api.interceptors.response.use(undefined, async (error: AxiosError<ApiError>) => {
  const request = error.config as RetriableRequest | undefined;
  const isAuthRoute = request?.url?.includes('/auth/login') || request?.url?.includes('/auth/refresh');
  if (error.response?.status !== 401 || !request || request._retried || isAuthRoute) {
    return Promise.reject(error);
  }

  request._retried = true;
  refreshRequest ??= api
    .post<ApiSuccess<AuthPayload>>('/auth/refresh')
    .then(({ data }) => {
      useAuthStore.getState().setSession(data.data.user, data.data.accessToken);
      return data.data.accessToken;
    })
    .finally(() => { refreshRequest = null; });

  try {
    const token = await refreshRequest;
    request.headers.Authorization = `Bearer ${token}`;
    return api(request);
  } catch (refreshError) {
    useAuthStore.getState().clearSession();
    if (typeof window !== 'undefined') window.location.assign('/login');
    return Promise.reject(refreshError);
  }
});

export const getApiError = (error: unknown): ApiError['error'] => {
  if (axios.isAxiosError<ApiError>(error) && error.response?.data?.success === false) {
    return error.response.data.error;
  }
  return { code: 'NETWORK_ERROR', message: 'We could not reach the server. Please try again.' };
};
