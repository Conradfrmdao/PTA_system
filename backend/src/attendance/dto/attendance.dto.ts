import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { AttendanceStatus } from '../../generated/prisma/client.js';

export class CreateAttendanceSessionDto {
  @IsString() @Length(10, 40) cohortId!: string;
  @IsDateString() sessionDate!: string;
  @IsOptional() @IsString() @Length(2, 100) title?: string;
}

export class AttendanceRecordDto {
  @IsString() @Length(10, 40) learnerId!: string;
  @IsEnum(AttendanceStatus) status!: AttendanceStatus;
  @IsOptional() @IsString() @Length(1, 300) note?: string;
}

export class MarkAttendanceDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => AttendanceRecordDto)
  records!: AttendanceRecordDto[];
}
