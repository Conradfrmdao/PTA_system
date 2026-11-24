import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CompleteRegistrationDto {
  @IsDateString()
  dateOfBirth!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  educationBackground?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  previousInstitution?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  confirmPassword!: string;
}
