import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateScheduleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  notes: string;
}
