import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { AuthUser } from '../auth/types/auth-user.js';
import { ApplicationsService } from './applications.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { ListApplicationsDto } from './dto/list-applications.dto.js';
import { ReviewApplicationDto } from './dto/review-application.dto.js';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  @Get()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('ADMIN')
  list(@Query() query: ListApplicationsDto) {
    return this.applicationsService.list(query);
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('ADMIN')
  get(@Param('id') id: string) {
    return this.applicationsService.get(id);
  }

  @Patch(':id/review')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('ADMIN')
  review(@Param('id') id: string, @Body() dto: ReviewApplicationDto, @CurrentUser() user: AuthUser) {
    return this.applicationsService.review(id, dto, user);
  }
}
