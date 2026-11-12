import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ApplicationStatus } from '../../generated/prisma/client.js';

export class ReviewApplicationDto {
  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus;

  @IsOptional()
  @IsString()
  @Length(2, 500)
  reviewNote?: string;

  @IsOptional()
  @IsString()
  @Length(10, 40)
  cohortId?: string;
}
