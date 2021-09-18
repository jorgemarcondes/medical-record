import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();

function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Prontuário Médico Eletronico')
    .setDescription(
      'Um sistema de prontuário eletrônico onde o médico pode cadastrar as informações do paciente e fazer os registros das consultas realizadas por paciente.',
    )
    .setVersion('1.0')
    .build();
  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };
  const document = SwaggerModule.createDocument(app, config, options);

  SwaggerModule.setup('api', app, document);
}
