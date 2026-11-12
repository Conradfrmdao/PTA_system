import { Controller, Get } from '@nestjs/common';
import { ProgramsService } from './programs.service.js';

@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get('public')
  listPublic() {
    return this.programsService.listPublic();
  }
}
