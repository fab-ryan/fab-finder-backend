import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseDto } from '../dto/response.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = exception.getStatus();

    res.status(status).json(
      new ResponseDto({
        success: false,
        statusCode: status,
        message: this.getErrorMessage(exception),
        path: req.path,
        method: req.method,
        requestId: req['requestId'],
      }),
    );
  }

  private getErrorMessage(exception: HttpException): string {
    const response = exception.getResponse();
    return typeof response === 'string'
      ? response
      : (response as any).message || exception.message;
  }
}
