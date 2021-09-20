import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PatientsModule } from '../src/patients/patients.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsRepository } from '../src/patients/patients.repository';
import { SchedulesModule } from '../src/schedules/schedules.module';
import { SchedulesRepository } from '../src/schedules/schedules.repository';
import { Patient } from '../src/patients/entities/patient.entity';

describe('PatientsController (e2e)', () => {
  let app: INestApplication;
  let patientRepository: PatientsRepository;
  let scheduleRepository: SchedulesRepository;
  let patient: Patient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        SchedulesModule,
        PatientsModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.E2E_DB_HOST || 'localhost',
          port: parseInt(process.env.E2E_DB_PORT) || 5433,
          username: process.env.E2E_DB_USERNAME || 'postgres',
          password: process.env.E2E_DB_PASSWORD || 'postgres',
          database: 'e2e_medical_record_db',
          autoLoadEntities: true,
          synchronize: true,
        }),
        TypeOrmModule.forFeature([PatientsRepository, SchedulesRepository]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    patientRepository = moduleFixture.get(PatientsRepository);
    scheduleRepository = moduleFixture.get(SchedulesRepository);

    patient = await patientRepository.save(
      patientRepository.create({ name: 'Rafael Sobis' }),
    );

    await app.init();
  });

  beforeEach(async () => {
    await scheduleRepository.query(`TRUNCATE schedules CASCADE;`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET', () => {
    it('Find all schedules with patient ids', async () => {
      await scheduleRepository.save([{ patient, date: '2021-09-01' }]);

      const response = await request(app.getHttpServer()).get('/schedules');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].patient).toBe(patient.id);
    });

    it('Find one schedule with loaded patient', async () => {
      const schedule = await scheduleRepository.save([
        { patient, date: '2021-09-02' },
      ]);

      const response = await request(app.getHttpServer()).get(
        `/schedules/${schedule[0].id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.patient.id).toBe(patient.id);
      expect(response.body.date).toBe('2021-09-02');
    });

    it('Find one schedule that not exists, should return 404 with a message', async () => {
      const response = await request(app.getHttpServer()).get(
        `/schedules/875208f6-b82b-4045-b7c6-41a408e837d5`,
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        "Schedule with ID: '875208f6-b82b-4045-b7c6-41a408e837d5' not found",
      );
    });
  });

  describe('POST', () => {
    it('create a schedule', async () => {
      const response = await request(app.getHttpServer())
        .post('/schedules')
        .send({ patient: patient.id, date: '2021-09-01' });

      expect(response.status).toBe(201);
      expect(response.body.patient).toBe(patient.id);
      expect(response.body.date).toBe('2021-09-01');
    });

    it('create a schedule with invalid patient returns 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/schedules')
        .send({ patient: patient, date: '2021-09-01' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('patient must be a UUID');
    });

    it('create a schedule with invalid date returns 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/schedules')
        .send({ patient: patient.id, date: '2021-09-00' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        'date must be a valid ISO 8601 date string',
      );
    });

    it('create a schedule with existent one at same date, should return 409 with a message', async () => {
      await scheduleRepository.save([{ patient, date: '2021-09-02' }]);

      const response = await request(app.getHttpServer())
        .post('/schedules')
        .send({ patient: patient.id, date: '2021-09-02' });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain(
        'Schedule could not be created, already exists a schedule for same date.',
      );
    });
  });

  describe('PATCH', () => {
    it('Update a schedule', async () => {
      const schedule = await scheduleRepository.save([
        { patient, date: '2021-09-02' },
      ]);

      const response = await request(app.getHttpServer())
        .patch(`/schedules/${schedule[0].id}`)
        .send({ date: '2021-09-03' });

      expect(response.status).toBe(200);
      expect(response.body.affected).toBe(1);

      const responseConfirmUpdate = await request(app.getHttpServer()).get(
        `/schedules/${schedule[0].id}`,
      );

      expect(responseConfirmUpdate.status).toBe(200);
      expect(responseConfirmUpdate.body.date).toBe('2021-09-03');
    });

    it('Update a schedule with invalid date', async () => {
      const schedule = await scheduleRepository.save([
        { patient, date: '2021-09-02' },
      ]);

      const response = await request(app.getHttpServer())
        .patch(`/schedules/${schedule[0].id}`)
        .send({ date: '2021-09-00' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        'date must be a valid ISO 8601 date string',
      );
    });

    it('Update a schedule with existent one at same date, should return 409 with a message', async () => {
      await scheduleRepository.save([{ patient, date: '2021-09-03' }]);

      const schedule = await scheduleRepository.save([
        { patient, date: '2021-09-02' },
      ]);

      const response = await request(app.getHttpServer())
        .patch(`/schedules/${schedule[0].id}`)
        .send({ date: '2021-09-03' });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain(
        'Schedule could not be updated, already exists a schedule for same date.',
      );
    });
  });

  describe('DELETE', () => {
    it('Deletes a schedule', async () => {
      const schedule = await scheduleRepository.save([
        { patient, date: '2021-09-02' },
      ]);

      const responseDelete = await request(app.getHttpServer()).delete(
        `/schedules/${schedule[0].id}`,
      );

      expect(responseDelete.status).toBe(200);
      expect(responseDelete.body.affected).toBe(1);
    });

    it('Deletes a schedule that not exists, should return 404 with a message', async () => {
      const responseDelete = await request(app.getHttpServer()).delete(
        '/schedules/875208f6-b82b-4045-b7c6-41a408e837d5',
      );

      expect(responseDelete.status).toBe(404);
      expect(responseDelete.body.message).toBe(
        "Schedule with ID: '875208f6-b82b-4045-b7c6-41a408e837d5' not found",
      );
    });

    it('Deletes a patient with schedule, should keep schedules but hide patient data', async () => {
      const newPatient = await patientRepository.save(
        patientRepository.create({ name: 'Mateus Ricardo' }),
      );
      const response = await request(app.getHttpServer())
        .post('/schedules')
        .send({ patient: newPatient.id, date: '2021-09-01' });

      expect(response.status).toBe(201);
      expect(response.body.patient).toBe(newPatient.id);

      const responseGet = await request(app.getHttpServer()).delete(
        `/patients/${newPatient.id}`,
      );

      expect(responseGet.status).toBe(200);
      expect(responseGet.body.affected).toBe(1);

      const responseGetPatient = await request(app.getHttpServer()).get(
        `/patients/${newPatient.id}`,
      );

      expect(responseGetPatient.status).toBe(404);
      expect(responseGetPatient.body.message).toBe(
        `Patient with ID: '${newPatient.id}' not found`,
      );

      const responseGetSchedule = await request(app.getHttpServer()).get(
        `/schedules/${response.body.id}`,
      );

      expect(responseGetSchedule.status).toBe(200);
      expect(responseGetSchedule.body.patient).toBeNull();
      expect(responseGetSchedule.body.date).toBe('2021-09-01');
    });
  });
});
