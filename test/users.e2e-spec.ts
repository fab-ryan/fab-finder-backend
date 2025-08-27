import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ResponseInterceptor, LoggingInterceptor } from '../src/common';

describe('Users Module (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');
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

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication & Authorization', () => {
    it('should require authentication for protected endpoints', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .expect((res) => {
          expect([401, 403]).toContain(res.status);
        });
    });
  });

  describe('Endpoint Existence', () => {
    it('should have users listing endpoint', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .expect((res) => {
          expect(res.status).not.toBe(404);
        });
    });
  });
});
