import {
  Controller,
  Post,
  Get,
  Body,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SetupService } from './setup.service';
import { Public } from '@/decorators/public.decorator';

interface EnvironmentVariableDto {
  key: string;
  value: string;
  description?: string;
}

@ApiTags('Setup')
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Public()
  @Post('initialize')
  @ApiOperation({ summary: 'Perform initial setup' })
  @ApiResponse({
    status: 200,
    description: 'Setup completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async initializeSetup() {
    await this.setupService.performInitialSetup();
    return {
      success: true,
      message: 'Initial setup completed successfully',
    };
  }

  @Public()
  @Get('status')
  @ApiOperation({ summary: 'Get setup status and environment info' })
  @ApiResponse({
    status: 200,
    description: 'Environment status information',
    schema: {
      type: 'object',
      properties: {
        hasEnvFile: { type: 'boolean' },
        missingRequired: { type: 'array', items: { type: 'string' } },
        optionalEmpty: { type: 'array', items: { type: 'string' } },
        isSetupComplete: { type: 'boolean' },
      },
    },
  })
  async getSetupStatus() {
    const envInfo = await this.setupService.getEnvironmentInfo();
    return {
      ...envInfo,
      isSetupComplete:
        envInfo.hasEnvFile && envInfo.missingRequired.length === 0,
    };
  }

  @Post('env-file')
  @ApiOperation({ summary: 'Create .env file from .env.example' })
  @ApiResponse({
    status: 200,
    description: '.env file created successfully',
  })
  async createEnvFile() {
    await this.setupService.createEnvFileIfNotExists();
    return {
      success: true,
      message: '.env file created or already exists',
    };
  }

  @Put('env/:key')
  @ApiOperation({ summary: 'Add or update environment variable' })
  @ApiResponse({
    status: 200,
    description: 'Environment variable updated successfully',
  })
  async addEnvironmentVariable(
    @Param('key') key: string,
    @Body() body: { value: string; description?: string },
  ) {
    await this.setupService.addEnvironmentVariable(
      key,
      body.value,
      body.description,
    );
    return {
      success: true,
      message: `Environment variable ${key} updated successfully`,
    };
  }

  @Delete('env/:key')
  @ApiOperation({ summary: 'Remove environment variable' })
  @ApiResponse({
    status: 200,
    description: 'Environment variable removed successfully',
  })
  async removeEnvironmentVariable(@Param('key') key: string) {
    await this.setupService.removeEnvironmentVariable(key);
    return {
      success: true,
      message: `Environment variable ${key} removed successfully`,
    };
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate environment variables' })
  @ApiResponse({
    status: 200,
    description: 'Environment validation completed',
  })
  async validateEnvironment() {
    await this.setupService.validateEnvironmentVariables();
    return {
      success: true,
      message: 'Environment validation completed',
    };
  }

  @Post('generate-secrets')
  @ApiOperation({ summary: 'Generate missing secrets (JWT_SECRET, etc.)' })
  @ApiResponse({
    status: 200,
    description: 'Secrets generated successfully',
  })
  async generateSecrets() {
    await this.setupService.generateMissingSecrets();
    return {
      success: true,
      message: 'Missing secrets generated successfully',
    };
  }
}
