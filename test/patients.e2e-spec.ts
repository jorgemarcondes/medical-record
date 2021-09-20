import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PatientsModule } from '../src/patients/patients.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsRepository } from '../src/patients/patients.repository';
import { SchedulesRepository } from '../src/schedules/schedules.repository';

describe('PatientsController (e2e)', () => {
  let app: INestApplication;
  let patientRepository: PatientsRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
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

    await app.init();
  });

  beforeEach(async () => {
    await patientRepository.query(`TRUNCATE patients CASCADE;`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET', () => {
    it('Find all patients', async () => {
      await patientRepository.save([{ name: 'Josefina' }]);

      const response = await request(app.getHttpServer()).get('/patients');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Josefina');
    });

    it('Find one', async () => {
      const patient = await patientRepository.save([{ name: 'Josefina' }]);

      const response = await request(app.getHttpServer()).get(
        `/patients/${patient[0].id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Josefina');
    });

    it('Find one that not exists, should return 404 with a message', async () => {
      const response = await request(app.getHttpServer()).get(
        `/patients/875208f6-b82b-4045-b7c6-41a408e837d5`,
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        "Patient with ID: '875208f6-b82b-4045-b7c6-41a408e837d5' not found",
      );
    });
  });

  describe('POST', () => {
    it('create a patient', async () => {
      const response = await request(app.getHttpServer())
        .post('/patients')
        .send({ name: 'Euclides' });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Euclides');
    });

    it('create a patient with invalid email returns 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/patients')
        .send({ name: 'Euclides', email: 'test' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('email must be an email');
    });

    it('create a patient with invalid sex returns 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/patients')
        .send({ name: 'Euclides', sex: 'X' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('sex must be a valid enum value');
    });

    it('create a patient with height', async () => {
      const response = await request(app.getHttpServer())
        .post('/patients')
        .send({ name: 'Euclides', height: 12 });

      expect(response.status).toBe(201);
      expect(response.body.height).toBe(12);
    });

    it('create a patient with invalid height returns 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/patients')
        .send({ name: 'Euclides', height: 'asdf' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        'height must be a number conforming to the specified constraints',
      );
    });

    it('create a patient invalid weight returns 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/patients')
        .send({ name: 'Euclides', weight: 'fdasd' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        'weight must be a number conforming to the specified constraints',
      );
    });
  });

  describe('PATCH', () => {
    it('Update a patient', async () => {
      const patient = await patientRepository.save([{ name: 'Jose Antunes' }]);

      const responseGet = await request(app.getHttpServer()).get(
        `/patients/${patient[0].id}`,
      );

      expect(responseGet.status).toBe(200);
      expect(responseGet.body.name).toBe('Jose Antunes');

      const response = await request(app.getHttpServer())
        .patch(`/patients/${patient[0].id}`)
        .send({ name: 'Jose Geraldo' });

      expect(response.status).toBe(200);
      expect(response.body.affected).toBe(1);

      const responseConfirmUpdate = await request(app.getHttpServer()).get(
        `/patients/${patient[0].id}`,
      );

      expect(responseConfirmUpdate.status).toBe(200);
      expect(responseConfirmUpdate.body.name).toBe('Jose Geraldo');
    });

    it('Update a patient with invalid email', async () => {
      const patient = await patientRepository.save([{ name: 'Firmina' }]);

      const responseGet = await request(app.getHttpServer()).get(
        `/patients/${patient[0].id}`,
      );

      expect(responseGet.status).toBe(200);
      expect(responseGet.body.name).toBe('Firmina');

      const response = await request(app.getHttpServer())
        .patch(`/patients/${patient[0].id}`)
        .send({ email: 'firmina@' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('email must be an email');
    });
  });

  describe('DELETE', () => {
    it('Deletes a patient', async () => {
      const patient = await patientRepository.save([{ name: 'Maria Alice' }]);

      const responseGet = await request(app.getHttpServer()).get(
        `/patients/${patient[0].id}`,
      );

      expect(responseGet.status).toBe(200);
      expect(responseGet.body.name).toBe('Maria Alice');

      const responseDelete = await request(app.getHttpServer()).delete(
        `/patients/${patient[0].id}`,
      );

      expect(responseDelete.status).toBe(200);
      expect(responseDelete.body.affected).toBe(1);
    });

    it('Deletes a patient that not exists, should return 404 with a message', async () => {
      const responseDelete = await request(app.getHttpServer()).delete(
        '/patients/875208f6-b82b-4045-b7c6-41a408e837d5',
      );

      expect(responseDelete.status).toBe(404);
      expect(responseDelete.body.message).toBe(
        "Patient with ID: '875208f6-b82b-4045-b7c6-41a408e837d5' not found",
      );
    });
  });
});
