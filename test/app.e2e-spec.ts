import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ResponseInterceptor, LoggingInterceptor } from '../src/common';
import { TestUtils } from './test-utils';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same configuration as main.ts
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

  afterEach(async () => {
    await app.close();
  });

  it('should have application configured properly', () => {
    expect(app).toBeDefined();
    expect(app.getHttpServer()).toBeDefined();
  });

  it('should apply global prefix to routes', async () => {
    // Root without prefix should return 404
    const rootResponse = await request(app.getHttpServer()).get('/');
    expect(rootResponse.status).toBe(404);
  });

  it('should have setup module accessible', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/setup/status',
    );
    expect(response.status).toBe(200);

    // Validate response format
    TestUtils.validateResponseFormat(response.body, '/api/setup/status');
  });

  it('should apply ResponseInterceptor globally', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/setup/status',
    );

    expect(response.status).toBe(200);
    TestUtils.validateResponseFormat(response.body, '/api/setup/status');
    expect(response.body.success).toBe(true);
  });

  it('should handle 404 errors with standard format', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/non-existent',
    );

    expect(response.status).toBe(404);
  });
});
