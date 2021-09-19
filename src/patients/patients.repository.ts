import { EntityRepository, Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';

@EntityRepository(Patient)
export class PatientsRepository extends Repository<Patient> {
  async createPatient(createPatientDto: CreatePatientDto): Promise<Patient> {
    const patient = this.create(createPatientDto);
    await this.save(patient);
    return patient;
  }
}
