# Setup Guide

This setup service provides automated configuration and environment management for the Fab Finder backend.

## Quick Start

```bash
# Run complete initial setup
yarn setup:init

# Check setup status
yarn setup:status

# Create .env file from .env.example
yarn setup:env

# Validate environment variables
yarn setup:validate
```

## Setup Commands

### CLI Commands (via yarn setup)

- `yarn setup init` - Complete initial setup (creates .env, generates secrets, validates config)
- `yarn setup env` - Create .env file from .env.example with default values
- `yarn setup validate` - Check for missing required environment variables
- `yarn setup status` - Show current setup status and missing variables
- `yarn setup secrets` - Generate missing JWT secrets and other secure tokens
- `yarn setup add-env <KEY> <VALUE>` - Add or update environment variable
- `yarn setup remove-env <KEY>` - Remove environment variable
- `yarn setup help` - Show all available commands

### API Endpoints (when server is running)

- `POST /api/setup/initialize` - Run complete setup process
- `GET /api/setup/status` - Get setup status and environment info
- `POST /api/setup/env-file` - Create .env file
- `PUT /api/setup/env/:key` - Add/update environment variable
- `DELETE /api/setup/env/:key` - Remove environment variable
- `POST /api/setup/validate` - Validate environment configuration
- `POST /api/setup/generate-secrets` - Generate missing secrets

## Environment Variables

### Required Variables
- `PORT` - Application port (default: 3000)
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_USERNAME` - Database username (default: postgres)
- `DB_PASSWORD` - Database password (default: password)
- `DB_DATABASE` - Database name (default: fab_finder)
- `JWT_SECRET` - JWT signing secret (auto-generated if missing)

### Optional Variables
- `PREFIX` - API prefix (default: api)
- `DB_SYNCHRONIZE` - Database synchronization (default: true)
- `I18N_WATCH` - Watch i18n files (default: true)
- `FALLBACK_LANGUAGE` - Default language (default: en)
- `BACKEND_DOMAIN` - Backend domain (default: http://localhost:3000)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `MAIL_HOST` - Email server host
- `MAIL_PORT` - Email server port
- `MAIL_USER` - Email username
- `MAIL_PASS` - Email password

## Features

### Automatic .env Creation
- Copies from .env.example if .env doesn't exist
- Fills in sensible defaults for development
- Generates secure secrets automatically

### Environment Validation
- Checks for required variables
- Warns about missing optional variables
- Provides suggestions for missing values

### Security
- Generates cryptographically secure JWT secrets
- Validates secret strength
- Protects sensitive information in logs

### Development Workflow
1. Clone repository
2. Run `yarn install`
3. Run `yarn setup:init`
4. Start development with `yarn start:dev`

The setup service ensures your development environment is configured correctly and provides helpful feedback about missing or incorrect configuration.
