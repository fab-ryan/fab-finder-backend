/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { format, transports } from 'winston';
import 'winston-daily-rotate-file';
import { WinstonModule } from 'nest-winston';

export class Logger {
  public static logger = WinstonModule.createLogger({
    level: 'info',
    format: format.combine(format.timestamp(), format.json()),
    transports: [
      new transports.DailyRotateFile({
        level: 'error',
        filename: 'logs/%DATE%-error.log',
        format: format.combine(format.timestamp(), format.json()),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        handleExceptions: true,
        json: true,
      }),
      new transports.DailyRotateFile({
        filename: 'logs/%DATE%-info.log',
        format: format.combine(format.timestamp(), format.json()),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxFiles: '14d',
      }),
      new transports.Console({
        level: 'debug',
        format: format.combine(
          format.timestamp(),
          format.json(),
          format.errors({ stack: true }),
          format.splat(),
          format.colorize({
            all: true,
          }),
          format.printf(
            (info) => `${info.timestamp} ${info.level}: ${info.message}`,
          ),
        ),
      }),
    ],
  });
}
