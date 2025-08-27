/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';
import { RbacSeederService } from '../rbac/services/rbac-seeder.service';
import { UserSeederService } from '../../seeders/user-seeder.service';

interface EnvironmentVariable {
  key: string;
  value: string;
  description?: string;
  required?: boolean;
}

@Injectable()
export class SetupService {
  private readonly rootPath = process.cwd();
  private readonly envPath = join(this.rootPath, '.env');
  private readonly envExamplePath = join(this.rootPath, '.env.example');

  constructor(
    private readonly rbacSeederService: RbacSeederService,
    private readonly userSeederService: UserSeederService,
  ) {}

  async performInitialSetup(): Promise<void> {
    console.log('🚀 Starting initial setup...');

    try {
      await this.createEnvFileIfNotExists();
      await this.validateEnvironmentVariables();
      await this.generateMissingSecrets();
      await this.performDatabaseSetup();
      await this.createDefaultAdmin();

      console.log('✅ Initial setup completed successfully!');
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      throw error;
    }
  }

  async createEnvFileIfNotExists(): Promise<void> {
    try {
      await fs.access(this.envPath);
      console.log('📁 .env file already exists');
    } catch {
      console.log('📝 Creating .env file from .env.example');
      await this.copyEnvExample();
    }
  }

  private async copyEnvExample(): Promise<void> {
    try {
      const exampleContent = await fs.readFile(this.envExamplePath, 'utf-8');
      const defaultValues = this.getDefaultEnvironmentValues();

      let envContent = exampleContent;

      // Replace empty values with defaults
      for (const [key, value] of Object.entries(defaultValues)) {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          envContent += `\n${key}=${value}`;
        }
      }

      await fs.writeFile(this.envPath, envContent);
      console.log('✅ .env file created with default values');
    } catch (error) {
      throw new Error(`Failed to create .env file: ${error.message}`);
    }
  }

  private getDefaultEnvironmentValues(): Record<string, string> {
    return {
      PREFIX: 'api',
      PORT: '3000',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USERNAME: 'postgres',
      DB_PASSWORD: 'password',
      DB_DATABASE: 'fab_finder',
      DB_SYNCHRONIZE: 'true',
      I18N_WATCH: 'true',
      FALLBACK_LANGUAGE: 'en',
      I18N_LOGGING: 'false',
      BACKEND_DOMAIN: 'http://localhost:3000',
      JWT_SECRET: this.generateSecureSecret(),
      GOOGLE_CLIENT_ID: '',
      GOOGLE_CLIENT_SECRET: '',
      GOOGLE_CALLBACK_URL: 'http://localhost:3000/api/auth/google/callback',
      MAIL_HOST: 'smtp.gmail.com',
      MAIL_PORT: '587',
      MAIL_PASS: '',
      MAIL_USER: '',
      MAIL_FROM: 'noreply@fab-finder.com',
    };
  }

  async validateEnvironmentVariables(): Promise<void> {
    const requiredVars = [
      'PORT',
      'DB_HOST',
      'DB_PORT',
      'DB_USERNAME',
      'DB_PASSWORD',
      'DB_DATABASE',
      'JWT_SECRET',
    ];

    const missingVars: string[] = [];

    for (const varName of requiredVars) {
      if (!process.env[varName] || process.env[varName].trim() === '') {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      console.warn(
        `⚠️  Missing required environment variables: ${missingVars.join(', ')}`,
      );
      await this.promptForMissingVariables(missingVars);
    } else {
      console.log('✅ All required environment variables are present');
    }
  }

  private async promptForMissingVariables(
    missingVars: string[],
  ): Promise<void> {
    // In a real implementation, you might want to use a proper CLI library like inquirer
    console.log('🔧 Auto-generating missing variables with defaults...');
    const defaults = this.getDefaultEnvironmentValues();
    await this.updateEnvFile(missingVars, defaults);
  }

  private async updateEnvFile(
    variables: string[],
    defaults: Record<string, string>,
  ): Promise<void> {
    let envContent = '';

    try {
      envContent = await fs.readFile(this.envPath, 'utf-8');
    } catch {
      // File doesn't exist, create it
      envContent = '';
    }

    for (const varName of variables) {
      const value = defaults[varName] || '';
      const regex = new RegExp(`^${varName}=.*$`, 'm');

      if (regex.test(envContent)) {
        // Update existing variable if it's empty
        const currentMatch = envContent.match(
          new RegExp(`^${varName}=(.*)$`, 'm'),
        );
        if (currentMatch && currentMatch[1].trim() === '') {
          envContent = envContent.replace(regex, `${varName}=${value}`);
        }
      } else {
        // Add new variable
        envContent += `\n${varName}=${value}`;
      }
    }

    await fs.writeFile(this.envPath, envContent);
    console.log(`✅ Updated environment variables: ${variables.join(', ')}`);
  }

  async generateMissingSecrets(): Promise<void> {
    const secretVars = ['JWT_SECRET'];
    const updates: Record<string, string> = {};

    for (const varName of secretVars) {
      if (!process.env[varName] || process.env[varName].length < 32) {
        updates[varName] = this.generateSecureSecret();
        console.log(`🔐 Generated new ${varName}`);
      }
    }

    if (Object.keys(updates).length > 0) {
      await this.updateEnvFile(Object.keys(updates), updates);
    }
  }

  private generateSecureSecret(length = 64): string {
    return crypto.randomBytes(length).toString('hex');
  }

  private async performDatabaseSetup(): Promise<void> {
    console.log('🗄️  Performing database setup...');

    try {
      // Seed RBAC data (roles and permissions)
      await this.rbacSeederService.seedRbacData();
      console.log('✅ RBAC data seeded successfully');

      // Seed default admin user
      await this.userSeederService.seedDefaultAdmin();
      console.log('✅ Default admin user seeded successfully');
    } catch (error) {
      console.error('❌ Database setup failed:', error.message);
      throw error;
    }
  }

  private async createDefaultAdmin(): Promise<void> {
    console.log('👤 Default admin creation setup completed');
    // Note: Actual admin user creation would happen in user service
    // This is where you'd call a user service to create an admin user
    // and assign them the admin role that was created by RBAC seeder
  }

  async getEnvironmentInfo(): Promise<{
    hasEnvFile: boolean;
    missingRequired: string[];
    optionalEmpty: string[];
  }> {
    const hasEnvFile = await this.fileExists(this.envPath);
    const requiredVars = [
      'PORT',
      'DB_HOST',
      'DB_PORT',
      'DB_USERNAME',
      'DB_PASSWORD',
      'DB_DATABASE',
      'JWT_SECRET',
    ];
    const optionalVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'MAIL_USER',
      'MAIL_PASS',
    ];

    const missingRequired = requiredVars.filter(
      (varName) => !process.env[varName] || process.env[varName].trim() === '',
    );

    const optionalEmpty = optionalVars.filter(
      (varName) => !process.env[varName] || process.env[varName].trim() === '',
    );

    return {
      hasEnvFile,
      missingRequired,
      optionalEmpty,
    };
  }

  async addEnvironmentVariable(
    key: string,
    value: string,
    description?: string,
  ): Promise<void> {
    await this.updateEnvFile([key], { [key]: value });
    console.log(`✅ Added environment variable: ${key}`);
  }

  async removeEnvironmentVariable(key: string): Promise<void> {
    try {
      let envContent = await fs.readFile(this.envPath, 'utf-8');
      const regex = new RegExp(`^${key}=.*$\n?`, 'm');
      envContent = envContent.replace(regex, '');
      await fs.writeFile(this.envPath, envContent);
      console.log(`🗑️  Removed environment variable: ${key}`);
    } catch (error) {
      throw new Error(
        `Failed to remove environment variable: ${error.message}`,
      );
    }
  }

  private async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}
