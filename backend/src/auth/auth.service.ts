import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type { LoginDto } from './dto/login.dto.js';

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  isActive: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto, context: { ipAddress?: string; userAgent?: string }) {
    const account = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!account || !(await argon2.verify(account.passwordHash, dto.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!account.isActive) throw new UnauthorizedException('Account is inactive');

    const user = this.publicUser(account);
    const accessToken = await this.signAccessToken(account.id);
    const refreshToken = await this.issueRefreshToken(account.id);
    await this.prisma.auditLog.create({
      data: {
        actorId: account.id,
        action: 'AUTH_LOGIN',
        entityType: 'User',
        entityId: account.id,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
    });

    return { user, accessToken, refreshToken };
  }

  async refresh(rawToken: string | undefined) {
    if (!rawToken) throw new UnauthorizedException('Refresh token is required');

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; type: string }>(rawToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid refresh token');

      const tokenHash = this.hashToken(rawToken);
      const stored = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: { select: userSelect } },
      });
      if (!stored || stored.revokedAt || stored.expiresAt <= new Date()) {
        throw new UnauthorizedException('Refresh token is invalid or expired');
      }
      if (!stored.user.isActive) throw new UnauthorizedException('Account is inactive');

      const nextRefreshToken = await this.createRefreshToken(payload.sub);
      await this.prisma.$transaction([
        this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } }),
        this.prisma.refreshToken.create({ data: nextRefreshToken.record }),
      ]);

      return {
        user: stored.user,
        accessToken: await this.signAccessToken(payload.sub),
        refreshToken: nextRefreshToken.raw,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
  }

  async logout(rawToken: string | undefined) {
    if (rawToken) {
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash: this.hashToken(rawToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return { message: 'Logged out successfully' };
  }

  private async issueRefreshToken(userId: string): Promise<string> {
    const token = await this.createRefreshToken(userId);
    await this.prisma.refreshToken.create({ data: token.record });
    return token.raw;
  }

  private async createRefreshToken(userId: string) {
    const days = this.config.get<number>('REFRESH_TOKEN_TTL_DAYS') ?? 7;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const raw = await this.jwtService.signAsync(
      { sub: userId, type: 'refresh' },
      { secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'), expiresIn: `${days}d` },
    );
    return { raw, record: { userId, tokenHash: this.hashToken(raw), expiresAt } };
  }

  private signAccessToken(userId: string): Promise<string> {
    const expiresIn = (this.config.get<string>('ACCESS_TOKEN_TTL') ?? '15m') as JwtSignOptions['expiresIn'];
    return this.jwtService.signAsync(
      { sub: userId, type: 'access' },
      {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn,
      },
    );
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private publicUser(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: 'ADMIN' | 'MENTOR' | 'INSTRUCTOR' | 'LEARNER' | 'ALUMNI';
    isActive: boolean;
  }) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
    };
  }
}
