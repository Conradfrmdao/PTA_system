import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { AcademyModule } from './academy/academy.module.js';
import { AttendanceModule } from './attendance/attendance.module.js';
import { ProgressModule } from './progress/progress.module.js';
import { PortalModule } from './portal/portal.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { RegistrationsModule } from './registrations/registrations.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { validateEnvironment } from './config/env.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProgramsModule } from './programs/programs.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    PrismaModule,
    AuthModule,
    ProgramsModule,
    ApplicationsModule,
    AcademyModule,
    AttendanceModule,
    ProgressModule,
    PortalModule,
    ReportsModule,
    RegistrationsModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
