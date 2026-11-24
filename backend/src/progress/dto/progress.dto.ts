import { IsBoolean } from 'class-validator';
export class SetModuleCompletionDto { @IsBoolean() completed!: boolean; }
