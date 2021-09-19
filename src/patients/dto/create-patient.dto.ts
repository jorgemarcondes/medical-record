import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { Sex } from '../entities/patient.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @IsDate()
  birthdate: string;

  @IsEnum(Sex)
  @ApiPropertyOptional()
  sex: Sex;

  @IsOptional()
  @ApiPropertyOptional()
  @IsNumberString()
  height: number;

  @IsOptional()
  @IsNumberString()
  @ApiPropertyOptional()
  weight: number;
}
