import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class PrometheusService {
  private readonly register: client.Registry;
  public readonly httpRequestsTotal: client.Counter<string>;
  public readonly httpRequestDuration: client.Histogram<string>;
  public readonly activeUsers: client.Gauge<string>;
  public readonly courseEnrollments: client.Counter<string>;
  public readonly quizCompletions: client.Counter<string>;

  constructor() {
    this.register = new client.Registry();
    this.register.setDefaultLabels({ app: 'e-learning-api' });
    client.collectDefaultMetrics({ register: this.register });

    // HTTP requests counter
    this.httpRequestsTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    // HTTP request duration histogram
    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.register],
    });

    // Active users gauge
    this.activeUsers = new client.Gauge({
      name: 'active_users_total',
      help: 'Number of currently active users',
      registers: [this.register],
    });

    // Course enrollments counter
    this.courseEnrollments = new client.Counter({
      name: 'course_enrollments_total',
      help: 'Total number of course enrollments',
      labelNames: ['course_id'],
      registers: [this.register],
    });

    // Quiz completions counter
    this.quizCompletions = new client.Counter({
      name: 'quiz_completions_total',
      help: 'Total number of quiz completions',
      labelNames: ['quiz_id', 'status'],
      registers: [this.register],
    });
  }

  getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  // Helper methods to increment metrics
  incrementHttpRequests(method: string, route: string, statusCode: string) {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
  }

  observeHttpDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  setActiveUsers(count: number) {
    this.activeUsers.set(count);
  }

  incrementCourseEnrollments(courseId: string) {
    this.courseEnrollments.inc({ course_id: courseId });
  }

  incrementQuizCompletions(quizId: string, status: 'passed' | 'failed') {
    this.quizCompletions.inc({ quiz_id: quizId, status });
  }
}
