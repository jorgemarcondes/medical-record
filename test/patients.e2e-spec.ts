import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PatientsModule } from '../src/patients/patients.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsRepository } from '../src/patients/patients.repository';

describe('PatientsController (e2e)', () => {
  let app: INestApplication;
  let patientRepository: PatientsRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PatientsModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT) || 5432,
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: 'e2e_medical_record',
          autoLoadEntities: true,
          synchronize: false,
        }),
        TypeOrmModule.forFeature([PatientsRepository]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    patientRepository = moduleFixture.get(PatientsRepository);

    await app.init();
  });

  afterEach(async () => {
    await patientRepository.query(`DELETE FROM patients;`);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/patients (GET)', async () => {
    await patientRepository.save([{ name: 'Josefina' }]);

    const response = await request(app.getHttpServer()).get('/patients');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe('Josefina');
  });
});
