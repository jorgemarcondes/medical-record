import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsRepository } from './patients.repository';
import { SchedulesRepository } from '../schedules/schedules.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientsRepository, SchedulesRepository]),
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
})
export class PatientsModule {}
