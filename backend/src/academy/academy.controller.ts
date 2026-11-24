import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { AuthUser } from '../auth/types/auth-user.js';
import { AcademyService } from './academy.service.js';
import { AssignCohortDto, AssignMentorDto, CreateCohortDto } from './dto/academy.dto.js';

@Controller('academy')
@UseGuards(AccessTokenGuard, RolesGuard)
export class AcademyController {
  constructor(private readonly academy: AcademyService) {}

  @Get('dashboard') @Roles('ADMIN') dashboard() { return this.academy.dashboard(); }
  @Get('cohorts') @Roles('ADMIN', 'MENTOR', 'INSTRUCTOR') cohorts(@CurrentUser() user: AuthUser) { return this.academy.listCohorts(user); }
  @Post('cohorts') @Roles('ADMIN') createCohort(@Body() dto: CreateCohortDto) { return this.academy.createCohort(dto); }
  @Get('learners') @Roles('ADMIN', 'MENTOR', 'INSTRUCTOR') learners(@CurrentUser() user: AuthUser, @Query('cohortId') cohortId?: string) { return this.academy.listLearners(user, cohortId); }
  @Patch('learners/:id/cohort') @Roles('ADMIN') assignCohort(@Param('id') id: string, @Body() dto: AssignCohortDto, @CurrentUser() user: AuthUser) { return this.academy.assignCohort(id, dto, user); }
  @Post('learners/:id/reset-password') @Roles('ADMIN') resetLearnerPassword(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.academy.resetLearnerPassword(id, user); }
  @Get('mentors') @Roles('ADMIN') mentors() { return this.academy.listMentors(); }
  @Post('cohorts/:id/mentors') @Roles('ADMIN') assignMentor(@Param('id') id: string, @Body() dto: AssignMentorDto, @CurrentUser() user: AuthUser) { return this.academy.assignMentor(id, dto, user); }
}
