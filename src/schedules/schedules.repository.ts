import { EntityRepository, Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@EntityRepository(Schedule)
export class SchedulesRepository extends Repository<Schedule> {
  constructor() {
    super();
  }

  async createSchedule(
    createScheduleDto: CreateScheduleDto,
  ): Promise<Schedule> {
    const schedule = this.create(createScheduleDto);
    await this.save(schedule);
    return schedule;
  }

  async isDateAvailable(date: string): Promise<boolean> {
    const hasSchedule = await this.createQueryBuilder('schedule')
      .select()
      .where('schedule.date = :date', { date })
      .andWhere('schedule.patient is not null')
      .getCount();

    return hasSchedule > 0;
  }
}
