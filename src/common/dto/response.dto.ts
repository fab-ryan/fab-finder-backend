import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { HttpStatus } from '@nestjs/common';
import { Exclude, Expose } from 'class-transformer';

@Expose()
export class ResponseDto<T> {
  @ApiProperty({
    example: true,
    description: 'Indicates if the request was successful',
  })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ example: 200, description: 'HTTP status code' })
  @IsNumber()
  statusCode: HttpStatus;

  @ApiProperty({
    example: 'Operation successful',
    description: 'Response message',
  })
  @IsString()
  message: string;

  @ApiProperty({ required: false, description: 'Response payload' })
  data?: T;

  @Exclude()
  key?: string; // For internal use only

  @ApiProperty({ example: '/api/v1/users', description: 'Request path' })
  @IsString()
  path: string;

  @ApiProperty({ example: 'GET', description: 'HTTP method' })
  @IsString()
  method: string;

  @ApiProperty({
    example: 'd3bcef5a-7a0d-4e7c-8a5a-3f9b1a2c4d5e',
    description: 'Unique request ID',
  })
  requestId: string;

  @ApiProperty({
    example: '2023-08-15T12:34:56.789Z',
    description: 'Timestamp of response',
  })
  @IsNumber()
  timestamp: string;

  constructor(partial: Partial<ResponseDto<T>>) {
    Object.assign(this, partial);
    this.timestamp = new Date().toISOString();
  }
}
