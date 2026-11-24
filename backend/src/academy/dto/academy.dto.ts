import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { CohortStatus } from '../../generated/prisma/client.js';

export class CreateCohortDto {
  @IsString() @Length(2, 80) name!: string;
  @IsString() @Length(10, 40) programId!: string;
  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;
  @IsOptional() @IsEnum(CohortStatus) status?: CohortStatus;
}

export class AssignCohortDto {
  @IsString() @Length(10, 40) cohortId!: string;
}

export class AssignMentorDto {
  @IsString() @Length(10, 40) userId!: string;
  @IsOptional() @Type(() => Boolean) @IsBoolean() isPrimary?: boolean;
}
