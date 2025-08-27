
/**
 * Postinstall script that runs after yarn install
 * Ensures development environment is properly configured
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');

const rootDir = process.cwd();
const envPath = join(rootDir, '.env');

console.log('🔧 Running post-install setup...');

try {
    // Check if .env exists
    if (!existsSync(envPath)) {
        console.log('📝 .env file not found, running setup...');
        execSync('yarn setup env', { stdio: 'inherit' });
    }

    // Always validate environment on install
    console.log('✅ Validating environment configuration...');
    execSync('yarn setup validate', { stdio: 'inherit' });

    console.log('✅ Post-install setup completed!');
} catch (error) {
    console.warn('⚠️  Post-install setup failed:', error.message);
    console.log('💡 You can run "yarn setup:init" manually to complete setup.');
}
