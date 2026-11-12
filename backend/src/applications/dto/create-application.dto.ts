import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class CreateApplicationDto {
  @Transform(trim)
  @IsString()
  @Length(2, 60)
  firstName!: string;

  @Transform(trim)
  @IsString()
  @Length(2, 60)
  lastName!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  email!: string;

  @Transform(trim)
  @IsOptional()
  @Matches(/^\+?[0-9][0-9\s-]{7,18}$/, { message: 'phone must be a valid phone number' })
  phone?: string;

  @IsString()
  @Length(10, 40)
  programId!: string;
}
