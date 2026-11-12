import type { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller.js';
import type { AuthService } from './auth.service.js';

describe('AuthController', () => {
  it('sets an httpOnly refresh cookie and returns only the public login payload', async () => {
    const authService = {
      login: vi.fn().mockResolvedValue({
        user: { id: 'user-1', email: 'admin@example.com', role: 'ADMIN' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
    } as unknown as AuthService;
    const config = {
      get: vi.fn((key: string) => key === 'REFRESH_TOKEN_TTL_DAYS' ? 7 : 'test'),
    } as unknown as ConfigService;
    const controller = new AuthController(authService, config);
    const cookie = vi.fn();
    const response = { cookie } as unknown as Response;
    const request = { ip: '127.0.0.1', headers: { 'user-agent': 'vitest' } } as Request;

    const result = await controller.login(
      { email: 'admin@example.com', password: 'password' },
      request,
      response,
    );

    expect(result).toEqual({
      user: { id: 'user-1', email: 'admin@example.com', role: 'ADMIN' },
      accessToken: 'access-token',
    });
    expect(cookie).toHaveBeenCalledWith(
      'pta_refresh',
      'refresh-token',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
    );
  });
});
