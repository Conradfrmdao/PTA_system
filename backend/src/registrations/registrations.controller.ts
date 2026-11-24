import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CompleteRegistrationDto } from './dto/complete-registration.dto.js';
import { RegistrationsService } from './registrations.service.js';

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrations: RegistrationsService) {}

  @Get(':token')
  invitation(@Param('token') token: string) {
    return this.registrations.invitation(token);
  }

  @Post(':token/complete')
  complete(@Param('token') token: string, @Body() dto: CompleteRegistrationDto) {
    return this.registrations.complete(token, dto);
  }
}
