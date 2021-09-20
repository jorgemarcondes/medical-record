import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(id: string): Promise<Patient> | never {
    const patient = await this.patientsRepository.findOne(id);

    if (!patient) {
      throw new NotFoundException(`Patient with ID: '${id}' not found`);
    }

    return patient;
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<UpdateResult> {
    const result: UpdateResult = await this.patientsRepository.update(
      id,
      updatePatientDto,
    );

    if (!result.affected) {
      throw new NotFoundException(`Patient with ID: '${id}' not found`);
    }

    return result;
  }

  async remove(id: string): Promise<UpdateResult> | never {
    const result: UpdateResult = await this.patientsRepository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException(`Patient with ID: '${id}' not found`);
    }

    return result;
  }
}
