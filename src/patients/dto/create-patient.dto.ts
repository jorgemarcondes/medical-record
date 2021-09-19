import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { Sex } from '../entities/patient.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePatientDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @ApiPropertyOptional()
  @IsPhoneNumber('BR')
  phone: string;

  @IsOptional()
  @ApiPropertyOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @ApiPropertyOptional()
  @IsDateString()
  birthdate: string;

  @IsOptional()
  @IsEnum(Sex)
  @ApiPropertyOptional()
  sex: Sex;

  @IsOptional()
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  height: number;

  @IsOptional()
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  weight: number;
}
