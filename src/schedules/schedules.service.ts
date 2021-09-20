import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SchedulesRepository } from './schedules.repository';
import { PatientsRepository } from '../patients/patients.repository';
import { Schedule } from './entities/schedule.entity';
import { DeleteResult, UpdateResult } from 'typeorm';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(SchedulesRepository)
    private schedulesRepository: SchedulesRepository,
    @InjectRepository(PatientsRepository)
    private patientsRepository: PatientsRepository,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const patient = await this.patientsRepository.findOne(
      createScheduleDto.patient.id,
    );
    if (!patient) {
      throw new NotFoundException(
        `Patient with ID: '${createScheduleDto.patient.id}' not found`,
      );
    }
    const hasSchedule = await this.schedulesRepository.isDateAvailable(
      createScheduleDto.date,
    );

    if (hasSchedule) {
      throw new ConflictException(
        `Schedule could not be created, already exists a schedule for same date.`,
      );
    }

    return this.schedulesRepository.createSchedule(createScheduleDto);
  }

  findAll(): Promise<Schedule[]> {
    return this.schedulesRepository.find({
      relations: ['patient'],
      loadRelationIds: true,
      order: {
        date: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Schedule> {
    const schedule = await this.schedulesRepository.findOne(id, {
      relations: ['patient'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID: '${id}' not found`);
    }

    return schedule;
  }

  async update(
    id: string,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<UpdateResult> | never {
    if (updateScheduleDto.date) {
      const schedule = await this.schedulesRepository.findOne(id);

      if (schedule.date !== updateScheduleDto.date) {
        const hasSchedule = await this.schedulesRepository.isDateAvailable(
          updateScheduleDto.date,
        );

        if (hasSchedule) {
          throw new ConflictException(
            `Schedule could not be updated, already exists a schedule for same date.`,
          );
        }
      }
    }

    const result: UpdateResult = await this.schedulesRepository.update(
      id,
      updateScheduleDto,
    );

    if (!result.affected) {
      throw new NotFoundException(`Schedule with ID: '${id}' not found`);
    }

    return result;
  }

  async remove(id: string): Promise<DeleteResult> | never {
    const result: DeleteResult = await this.schedulesRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`Schedule with ID: '${id}' not found`);
    }

    return result;
  }
}
