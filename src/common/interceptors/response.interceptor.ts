import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../dto/response.dto';
import { Request, Response } from 'express';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data: unknown) => {
        const success = res.statusCode >= 200 && res.statusCode < 400;
        const message: string =
          typeof (data as Record<string, unknown>)?.message === 'string'
            ? ((data as Record<string, unknown>).message as string)
            : this.getStatusMessage(res.statusCode);

        const resultData: T =
          data && typeof data === 'object' && 'result' in data
            ? ((data as Record<string, unknown>).result as T)
            : (data as T);
        return new ResponseDto<T>({
          success,
          statusCode: res.statusCode,
          message,
          data: resultData,
          path: req.path,
          method: req.method,
          requestId: req['requestId'],
        });
      }),
    );
  }

  private getStatusMessage(statusCode: number): string {
    const messages = {
      200: 'OK',
      201: 'Created',
      202: 'Accepted',
      204: 'No Content',
    };
    return messages[statusCode] || 'Operation successful';
  }
}
