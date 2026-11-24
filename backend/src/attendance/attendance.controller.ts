import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { AuthUser } from '../auth/types/auth-user.js';
import { AttendanceService } from './attendance.service.js';
import { CreateAttendanceSessionDto, MarkAttendanceDto } from './dto/attendance.dto.js';

@Controller('attendance')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles('ADMIN', 'MENTOR', 'INSTRUCTOR')
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}
  @Get('cohorts/:id') register(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.attendance.cohortRegister(id, user); }
  @Post('sessions') create(@Body() dto: CreateAttendanceSessionDto, @CurrentUser() user: AuthUser) { return this.attendance.createSession(dto, user); }
  @Put('sessions/:id/records') mark(@Param('id') id: string, @Body() dto: MarkAttendanceDto, @CurrentUser() user: AuthUser) { return this.attendance.mark(id, dto, user); }
}
