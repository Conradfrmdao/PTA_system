import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { AuthUser } from '../auth/types/auth-user.js';
import { PortalService } from './portal.service.js';

@Controller('portal') @UseGuards(AccessTokenGuard, RolesGuard)
export class PortalController {
  constructor(private readonly portal: PortalService) {}
  @Get('me') @Roles('LEARNER') me(@CurrentUser() user: AuthUser) { return this.portal.learner(user.id); }
}
