import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { AccessTokenGuard } from './guards/access-token.guard.js';
import type { AuthUser } from './types/auth-user.js';

const REFRESH_COOKIE = 'pta_refresh';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto, {
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });
    this.setRefreshCookie(response, result.refreshToken);
    return { user: result.user, accessToken: result.accessToken };
  }

  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.refresh(request.cookies?.[REFRESH_COOKIE]);
    this.setRefreshCookie(response, result.refreshToken);
    return { user: result.user, accessToken: result.accessToken };
  }

  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.logout(request.cookies?.[REFRESH_COOKIE]);
    response.clearCookie(REFRESH_COOKIE, this.cookieOptions());
    return result;
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  private setRefreshCookie(response: Response, value: string) {
    const days = this.config.get<number>('REFRESH_TOKEN_TTL_DAYS') ?? 7;
    response.cookie(REFRESH_COOKIE, value, {
      ...this.cookieOptions(),
      maxAge: days * 24 * 60 * 60 * 1000,
    });
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax' as const,
      path: '/api/v1/auth',
    };
  }
}
