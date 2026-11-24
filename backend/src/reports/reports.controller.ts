import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ReportsService } from './reports.service.js';
@Controller('reports') @UseGuards(AccessTokenGuard, RolesGuard) @Roles('ADMIN')
export class ReportsController { constructor(private readonly reports: ReportsService) {} @Get('overview') overview() { return this.reports.overview(); } }
