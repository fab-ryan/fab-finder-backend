import { NestFactory } from '@nestjs/core';
import { config as configEnv } from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  HttpExceptionFilter,
  requestContextMiddleware,
  ResponseDto,
  ResponseInterceptor,
  LoggingInterceptor,
} from '@/common';
import { config, swaggerConfig } from '@/configs';
import { Logger } from './utils';
configEnv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: Logger.logger as import('@nestjs/common').LoggerService,
    cors: true,
  });

  // Enable CORS
  app.enableCors();
  app.setGlobalPrefix(config().prefix);

  app.use(requestContextMiddleware);

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerDocument = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .setTermsOfService(swaggerConfig.termsOfService)
    .setContact(
      swaggerConfig.contact.name,
      swaggerConfig.contact.url,
      swaggerConfig.contact.email,
    )
    .addGlobalParameters({
      in: 'header',
      name: 'x-lang',
      required: false,
      description: 'Language kin,en,fr,.....',
      schema: {
        type: 'string',
        default: 'kin',
      },
    })
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerDocument, {
    extraModels: [ResponseDto],
  });
  SwaggerModule.setup('docs', app, document);
  await app.listen(config().port ?? 3000);
}
bootstrap().catch((error) => {
  console.error('Error starting application:', error);
});
