import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
  birthdate?: Date;

  @Column({ type: 'enum', enum: Sex, nullable: true })
  sex?: Sex;

  @Column({ nullable: true })
  height?: number;

  @Column({ nullable: true })
  weight?: number;

  @DeleteDateColumn()
  deletedAt?: Date;
}
