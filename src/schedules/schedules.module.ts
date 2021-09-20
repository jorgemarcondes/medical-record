import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulesRepository } from './schedules.repository';
import { PatientsRepository } from '../patients/patients.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientsRepository, SchedulesRepository]),
  ],
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule {}
