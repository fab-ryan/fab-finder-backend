import { NestFactory, Reflector } from '@nestjs/core';
import { config as configEnv } from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  HttpExceptionFilter,
  requestContextMiddleware,
  ResponseDto,
  ResponseInterceptor,
  LoggingInterceptor,
  BadRequestFilter,
} from '@/common';
import { config, swaggerConfig } from '@/configs';
import { Logger } from './utils';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
configEnv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: Logger.logger,
    cors: true,
  });

  // Enable CORS
  app.enableCors();
  app.setGlobalPrefix(config().prefix);

  app.use(requestContextMiddleware);

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalFilters(new BadRequestFilter());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector, {
      excludePrefixes: ['_'],
    }),
  );

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
