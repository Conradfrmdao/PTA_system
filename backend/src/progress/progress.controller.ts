import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { AuthUser } from '../auth/types/auth-user.js';
import { SetModuleCompletionDto } from './dto/progress.dto.js';
import { ProgressService } from './progress.service.js';

@Controller('progress') @UseGuards(AccessTokenGuard, RolesGuard) @Roles('ADMIN', 'MENTOR', 'INSTRUCTOR')
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}
  @Get('cohorts/:id') cohort(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.progress.cohort(id, user); }
  @Put('learners/:learnerId/modules/:moduleId') completion(@Param('learnerId') learnerId: string, @Param('moduleId') moduleId: string, @Body() dto: SetModuleCompletionDto, @CurrentUser() user: AuthUser) { return this.progress.setCompletion(learnerId, moduleId, dto.completed, user); }
}
