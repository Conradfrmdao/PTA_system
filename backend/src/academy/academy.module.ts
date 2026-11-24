import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AcademyController } from './academy.controller.js';
import { AcademyService } from './academy.service.js';

@Module({ imports: [AuthModule], controllers: [AcademyController], providers: [AcademyService], exports: [AcademyService] })
export class AcademyModule {}
