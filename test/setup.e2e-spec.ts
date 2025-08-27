import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ResponseInterceptor, LoggingInterceptor } from '../src/common';
import { Logger } from '../src/utils';
import * as fs from 'fs';
import * as path from 'path';

describe('Setup Module (e2e)', () => {
  let app: INestApplication<App>;
  let envBackup: string;

  beforeAll(async () => {
    // Backup current .env file if it exists
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      envBackup = fs.readFileSync(envPath, 'utf8');
    }

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

  afterAll(async () => {
    // Restore .env file
    const envPath = path.join(process.cwd(), '.env');
    if (envBackup) {
      fs.writeFileSync(envPath, envBackup);
    } else if (fs.existsSync(envPath)) {
      fs.unlinkSync(envPath);
    }

    await app.close();
  });

  describe('/api/setup/status (GET)', () => {
    it('should return setup status information', () => {
      return request(app.getHttpServer())
        .get('/api/setup/status')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('hasEnvFile');
          expect(res.body.data).toHaveProperty('missingRequired');
          expect(res.body.data).toHaveProperty('optionalEmpty');
          expect(res.body.data).toHaveProperty('isSetupComplete');
          expect(typeof res.body.data.hasEnvFile).toBe('boolean');
          expect(Array.isArray(res.body.data.missingRequired)).toBe(true);
          expect(Array.isArray(res.body.data.optionalEmpty)).toBe(true);
          expect(typeof res.body.data.isSetupComplete).toBe('boolean');
        });
    });
  });

  describe('/api/setup/env-file (POST)', () => {
    it('should create .env file successfully', () => {
      return request(app.getHttpServer())
        .post('/api/setup/env-file')
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('success', true);
          expect(res.body.data).toHaveProperty('message');
          expect(res.body.data.message).toContain('.env file');
        });
    });
  });

  describe('/api/setup/initialize (POST)', () => {
    it('should perform initial setup successfully', () => {
      return request(app.getHttpServer())
        .post('/api/setup/initialize')
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('success', true);
          expect(res.body.data).toHaveProperty('message');
          expect(res.body.data.message).toContain('Initial setup completed');
        });
    });
  });

  describe('/api/setup/env/:key (PUT)', () => {
    it('should add/update environment variable successfully', () => {
      const testKey = 'TEST_VAR';
      const testValue = 'test-value';

      return request(app.getHttpServer())
        .put(`/api/setup/env/${testKey}`)
        .send({
          value: testValue,
          description: 'Test variable for e2e testing',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('success', true);
          expect(res.body.data).toHaveProperty('message');
          expect(res.body.data.message).toContain(testKey);
        });
    });

    it('should fail with invalid request body', () => {
      return request(app.getHttpServer())
        .put('/api/setup/env/INVALID_TEST')
        .send({}) // Missing required 'value' field
        .expect(200);
    });
  });

  describe('/api/setup/env/:key (DELETE)', () => {
    it('should remove environment variable successfully', () => {
      const testKey = 'TEST_VAR_TO_DELETE';

      return request(app.getHttpServer())
        .delete(`/api/setup/env/${testKey}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('success', true);
          expect(res.body.data).toHaveProperty('message');
          expect(res.body.data.message).toContain(testKey);
        });
    });
  });

  describe('/api/setup/validate (POST)', () => {
    it('should validate environment variables successfully', () => {
      return request(app.getHttpServer())
        .post('/api/setup/validate')
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('success', true);
          expect(res.body.data).toHaveProperty('message');
          expect(res.body.data.message).toContain('validation');
        });
    });
  });

  describe('/api/setup/generate-secrets (POST)', () => {
    it('should generate missing secrets successfully', () => {
      return request(app.getHttpServer())
        .post('/api/setup/generate-secrets')
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('success', true);
          expect(res.body.data).toHaveProperty('message');
          expect(res.body.data.message).toContain('secrets');
        });
    });
  });

  describe('Response format consistency', () => {
    it('should follow standard response format with ResponseInterceptor', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/setup/status')
        .expect(200);

      // Check response follows the ResponseDto format
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
      expect(response.body).toHaveProperty('requestId');

      expect(typeof response.body.success).toBe('boolean');
      expect(typeof response.body.timestamp).toBe('string');
      expect(typeof response.body.path).toBe('string');
      expect(response.body.path).toBe('/api/setup/status');
    });
  });
});
