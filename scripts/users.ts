#!/usr/bin/env node
/* eslint-disable no-case-declarations */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/modules/users/users.service';
import { UserSeederService } from '@/seeders';

async function bootstrap() {
  const args = process.argv.slice(2);
  const command = args[0];

  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const userSeederService = app.get(UserSeederService);

  try {
    switch (command) {
      case 'create-admin':
        await userSeederService.seedDefaultAdmin();
        console.log('✅ Default admin user created successfully');
        break;

      case 'create-test-users':
        await userSeederService.seedTestUsers();
        console.log('✅ Test users created successfully');
        break;

      case 'remove-test-users':
        await userSeederService.removeTestUsers();
        console.log('✅ Test users removed successfully');
        break;

      case 'stats':
        const stats = await usersService.getUserStats();
        console.log('\n📊 User Statistics:');
        console.log(`Total Users: ${stats.total}`);
        console.log(`Active: ${stats.active}`);
        console.log(`Inactive: ${stats.inactive}`);
        console.log(`Banned: ${stats.banned}`);
        console.log(`Verified: ${stats.verified}`);
        break;

      case 'list':
        const result = await usersService.findAllUsers({ page: 1, limit: 100 });
        console.log('\n👥 Users List:');
        result.users.forEach((user) => {
          console.log(
            `${user.email} (${user.username}) - Status: ${user.status}`,
          );
        });
        console.log(`\nTotal: ${result.total} users`);
        break;

      default:
        console.log(`
🎯 User Management CLI

Available commands:
  create-admin       - Create default admin user
  create-test-users  - Create test users with different roles
  remove-test-users  - Remove test users
  stats             - Show user statistics
  list              - List all users

Usage:
  yarn users <command>
  npm run users <command>

Examples:
  yarn users create-admin
  yarn users stats
  yarn users list
        `);
    }
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
