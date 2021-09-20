import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Schedule } from '../../schedules/entities/schedule.entity';

export enum Sex {
  M = 'M',
  F = 'F',
  O = 'O',
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  email?: string;

  @Column({ type: 'date', nullable: true })
  birthdate?: string;

  @Column({ type: 'enum', enum: Sex, nullable: true })
  sex?: Sex;

  @Column({ nullable: true })
  height?: number;

  @Column({ nullable: true })
  weight?: number;

  @OneToMany(() => Schedule, (schedule) => schedule.patient, { nullable: true })
  schedules?: Schedule[];

  @DeleteDateColumn()
  deletedAt?: Date;
}
