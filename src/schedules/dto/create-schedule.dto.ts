import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Patient } from '../../patients/entities/patient.entity';
import { Type } from 'class-transformer';

export class CreateScheduleDto {
  @ApiProperty({ description: 'Patient UUID', type: () => String })
  @IsNotEmpty()
  @IsUUID()
  @Type(() => Patient)
  patient: Patient;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  notes: string;
}
