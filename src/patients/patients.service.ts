import { Injectable } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientsRepository } from './patients.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { UpdateResult } from 'typeorm';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(PatientsRepository)
    private patientsRepository: PatientsRepository,
  ) {}

  create(createPatientDto: CreatePatientDto): Promise<Patient> {
    return this.patientsRepository.createPatient(createPatientDto);
  }

  findAll(): Promise<Patient[]> {
    return this.patientsRepository.find();
  }

  findOne(id: string) {
    return this.patientsRepository.findOne(id);
  }

  update(
    id: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<UpdateResult> {
    return this.patientsRepository.update(id, updatePatientDto);
  }

  remove(id: string) {
    return this.patientsRepository.softDelete(id);
  }
}
