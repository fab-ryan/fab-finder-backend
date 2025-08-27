import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Permission name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Permission description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Resource name (e.g., users, posts)' })
  @IsString()
  resource: string;

  @ApiProperty({
    description: 'Action name (e.g., create, read, update, delete)',
  })
  @IsString()
  action: string;
}

export class UpdatePermissionDto {
  @ApiProperty({ description: 'Permission name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Permission description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Resource name', required: false })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiProperty({ description: 'Action name', required: false })
  @IsOptional()
  @IsString()
  action?: string;
}
