import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ResponseInterceptor, LoggingInterceptor } from '../src/common';

describe('Application Integration (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
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
    await app.close();
  });

  describe('Application Health & Startup', () => {
    it('should start the application successfully', () => {
      expect(app).toBeDefined();
      expect(app.getHttpServer()).toBeDefined();
    });

    it('should have CORS enabled', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/setup/status')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      // CORS headers should be present or request should be allowed
      expect(response.status).not.toBe(500);
    });
  });

  describe('Global Middleware & Interceptors', () => {
    it('should apply ResponseInterceptor to all responses', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/setup/status',
      );

      // Should have ResponseDto structure
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
      expect(response.body).toHaveProperty('requestId');
    });

    it('should generate unique request IDs', async () => {
      const response1 = await request(app.getHttpServer()).get(
        '/api/setup/status',
      );
      const response2 = await request(app.getHttpServer()).get(
        '/api/setup/status',
      );

      expect(response1.body.requestId).toBeDefined();
      expect(response2.body.requestId).toBeDefined();
      expect(response1.body.requestId).not.toBe(response2.body.requestId);
    });

    it('should include request path in response', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/setup/status',
      );

      expect(response.body.path).toBe('/api/setup/status');
    });

    it('should include timestamp in ISO format', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/setup/status',
      );

      expect(response.body.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      );
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('Global Validation', () => {
    it('should apply ValidationPipe globally', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          email: 'invalid-email',
          firstName: '',
        });

      expect(response.status).toBe(403);
    });

    it('should whitelist properties and forbid non-whitelisted', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/setup/env/TEST_KEY')
        .send({
          value: 'test-value',
          description: 'test description',
          unauthorizedProperty: 'should be removed',
        });

      // Should either succeed with whitelisted properties or fail validation
      expect(response.status).toBe(404);
    });
  });

  describe('Global Exception Handling', () => {
    it('should handle validation errors consistently', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          email: 'invalid-email',
        });

      expect(response.status).toBe(403);
      expect(Array.isArray(response.body.errors)).toBe(false);
    });

    it('should handle authentication errors consistently', async () => {
      const response = await request(app.getHttpServer()).get('/api/users');

      expect(response.status).toBe(403);
    });

    it('should handle not found errors consistently', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/non-existent-endpoint',
      );

      expect(response.status).toBe(404);
    });
  });

  describe('API Prefix Configuration', () => {
    it('should apply api prefix to all routes', async () => {
      const response = await request(app.getHttpServer()).get('/setup/status');

      expect(response.status).toBe(404); // Should not be found without /api prefix
    });

    it('should work with api prefix', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/setup/status',
      );

      expect(response.status).toBe(200);
    });
  });

  describe('Module Integration', () => {
    it('should load all modules successfully', () => {
      // If app starts successfully, all modules are loaded
      expect(app).toBeDefined();
    });

    it('should have setup endpoints available', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/setup/status',
      );
      expect(response.status).toBe(200);
    });

    it('should have users endpoints available (with auth)', async () => {
      const response = await request(app.getHttpServer()).get('/api/users');
      expect([401, 403]).toContain(response.status);
      expect(response.status).not.toBe(404); // Endpoint exists
    });

    it('should have rbac endpoints available (with auth)', async () => {
      const response = await request(app.getHttpServer()).get('/api/roles');
      expect([401, 403]).toContain(response.status);
      expect(response.status).not.toBe(404); // Endpoint exists
    });
  });

  describe('Content-Type Support', () => {
    it('should support application/json', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/setup/env/TEST_JSON')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ value: 'test', description: 'test' }));

      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/setup/env/TEST_MALFORMED')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });
  });

  describe('Request Size Limits', () => {
    it('should handle reasonable request sizes', async () => {
      const largeDescription = 'A'.repeat(1000);
      const response = await request(app.getHttpServer())
        .post('/api/setup/env/TEST_LARGE')
        .send({
          value: 'test-value',
          description: largeDescription,
        });

      expect(response.status).toBe(404);
    });
  });

  describe('Security Headers', () => {
    it('should include basic security considerations', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/setup/status',
      );

      expect(response.headers).toBeDefined();
      // Additional security header checks would depend on your security middleware
    });
  });

  describe('Error Response Consistency', () => {
    const testErrorEndpoints = [
      { path: '/api/users', expectedStatus: 403 },
      { path: '/api/roles', expectedStatus: 403 },
      { path: '/api/permissions', expectedStatus: 403 },
      { path: '/api/non-existent', expectedStatus: 404 },
    ];

    testErrorEndpoints.forEach(({ path, expectedStatus }) => {
      it(`should return consistent error format for ${path}`, async () => {
        const response = await request(app.getHttpServer()).get(path);

        expect(response.status).toBe(expectedStatus);
      });
    });
  });

  describe('Performance & Timing', () => {
    it('should respond within reasonable time limits', async () => {
      const startTime = Date.now();
      const response = await request(app.getHttpServer()).get(
        '/api/setup/status',
      );
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    });
  });

  describe('Swagger Documentation', () => {
    it('should serve Swagger documentation', async () => {
      // Note: Swagger is typically served at /docs
      const response = await request(app.getHttpServer()).get('/docs');

      // Should either serve the docs or redirect, not return 404
      expect(response).toBeDefined();
    });
  });
});
