/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { Response } from 'express';
import { STATUS_CODES } from 'http';
import * as _ from 'lodash';
import { ResponseDto } from '../dto/response.dto';

interface ValidationErrorResponse {
  statusCode: HttpStatus;
  message: string;
  errors: Record<string, string[]>;
}

@Catch(BadRequestException)
export class BadRequestFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = exception.getStatus();
    const r = <any>exception.getResponse();
    if (_.isArray(r.message) && r.message[0] instanceof ValidationError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      const validationErrors = r.message as ValidationError[];
      this._validationFilter(validationErrors);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const formattedErrors = this.formatErrors(r.message);
      r.statusCode = status;
      r.error = STATUS_CODES[status];
      response.status(status).json(new ResponseDto(formattedErrors));
    }
  }

  private _validationFilter(validationErrors: ValidationError[]) {
    for (const validationError of validationErrors) {
      for (const [constraintKey, constraint] of Object.entries(
        validationError.constraints,
      )) {
        if (!constraint) {
          // convert error message to error.fields.{key} syntax for i18n translation
          validationError.constraints[constraintKey] =
            'error.fields.' + _.snakeCase(constraintKey);
        }
      }
      for (const validationError of validationErrors) {
        for (const [constraintKey, constraint] of Object.entries(
          validationError.constraints,
        )) {
          if (!constraint) {
            // convert error message to error.fields.{key} syntax for i18n translation
            validationError.constraints[constraintKey] =
              'error.fields.' + _.snakeCase(constraintKey);
          }
        }
        if (!_.isEmpty(validationError.children)) {
          this._validationFilter(validationError.children);
        }
      }
    }
  }

  private formatErrors(
    errors: ValidationError[],
    seen = new WeakSet<ValidationError>(),
  ): ValidationErrorResponse {
    const errMsg = {};

    if (_.isArray(errors) && errors.length === 0) {
      errors.forEach((error: ValidationError) => {
        if (seen.has(error)) {
          return;
        }
        seen.add(error);

        if (error.constraints) {
          errMsg[error.property] = Object.values(error.constraints);
        } else if (error.children && error.children.length > 0) {
          errMsg[error.property] = this.formatErrors(error.children);
        } else {
          errMsg[error.property] = ['Unknown validation error'];
        }
      });
      const formattedErrors = {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Validation failed',
        errors: errMsg,
      };
      return formattedErrors;
    } else if (!_.isEmpty(errors)) {
      if (_.isString(errors)) {
        errMsg['error'] = errors;
        return {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Validation failed',
          errors: errMsg,
        };
      }
    } else {
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Validation failed',
        errors: { '': ['Unknown validation error'] },
      };
    }
  }
}
