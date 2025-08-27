#!/usr/bin/env node
/* eslint-disable no-case-declarations */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SetupService } from '../src/modules/setup/setup.service';
import { RbacSeederService } from '../src/modules/rbac/services/rbac-seeder.service';

async function runSetup() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: false, // Disable logs for cleaner output
    });

    const setupService = app.get(SetupService);
    const rbacSeederService = app.get(RbacSeederService);

    switch (command) {
      case 'init':
      case 'initialize':
        console.log('🚀 Initializing project setup...');
        await setupService.performInitialSetup();
        break;

      case 'env':
        console.log('📝 Creating .env file...');
        await setupService.createEnvFileIfNotExists();
        break;

      case 'validate':
        console.log('✅ Validating environment variables...');
        await setupService.validateEnvironmentVariables();
        break;

      case 'secrets':
        console.log('🔐 Generating missing secrets...');
        await setupService.generateMissingSecrets();
        break;

      case 'seed-rbac':
        console.log('👥 Seeding RBAC data (roles and permissions)...');
        await rbacSeederService.seedRbacData();
        break;

      case 'status':
        console.log('📊 Checking setup status...');
        const status = await setupService.getEnvironmentInfo();
        console.log(`
Environment Status:
- .env file exists: ${status.hasEnvFile ? '✅' : '❌'}
- Missing required variables: ${status.missingRequired.length > 0 ? `❌ ${status.missingRequired.join(', ')}` : '✅ None'}
- Empty optional variables: ${status.optionalEmpty.length > 0 ? `⚠️  ${status.optionalEmpty.join(', ')}` : '✅ All set'}
        `);
        break;

      case 'add-env':
        if (args.length < 3) {
          console.error(
            'Usage: yarn setup add-env <KEY> <VALUE> [DESCRIPTION]',
          );
          process.exit(1);
        }
        const [, key, value, description] = args;
        await setupService.addEnvironmentVariable(key, value, description);
        break;

      case 'remove-env':
        if (args.length < 2) {
          console.error('Usage: yarn setup remove-env <KEY>');
          process.exit(1);
        }
        await setupService.removeEnvironmentVariable(args[1]);
        break;

      case 'help':
      default:
        console.log(`
🔧 Fab Finder Setup Tool

Usage: yarn setup <command> [options]

Commands:
  init, initialize     - Run complete initial setup
  env                  - Create .env file from .env.example
  validate             - Validate environment variables
  secrets              - Generate missing secrets
  seed-rbac            - Seed RBAC data (roles and permissions)
  status               - Show setup status
  add-env <key> <val>  - Add environment variable
  remove-env <key>     - Remove environment variable
  help                 - Show this help message

Examples:
  yarn setup init
  yarn setup env
  yarn setup seed-rbac
  yarn setup add-env DATABASE_URL postgresql://localhost:5432/mydb
  yarn setup remove-env OLD_VAR
        `);
        break;
    }

    await app.close();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

void runSetup();
