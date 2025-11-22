#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Validates that all required environment variables are properly configured
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_VARS = {
  // Core application
  'NEXT_PUBLIC_APP_URL': 'Application URL (e.g., http://localhost:3000)',
  'NEXT_PUBLIC_APP_NAME': 'Application name (PeluqueríasPRO)',
  'NODE_ENV': 'Environment (development/production)',

  // Authentication
  'NEXTAUTH_URL': 'NextAuth URL for authentication',
  'NEXTAUTH_SECRET': 'NextAuth secret key (generate with: openssl rand -base64 32)',

  // Stripe (Required)
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': 'Stripe publishable key (pk_test_...)',
  'STRIPE_SECRET_KEY': 'Stripe secret key (sk_test_...)',
  'STRIPE_WEBHOOK_SECRET': 'Stripe webhook secret (whsec_...)',

  // Email (Required)
  'RESEND_API_KEY': 'Resend API key for sending emails (re_...)',
  'RESEND_FROM_EMAIL': 'From email address',
  'ADMIN_EMAIL': 'Admin email for notifications',
};

const OPTIONAL_VARS = {
  // Database (if using Prisma)
  'DATABASE_URL': 'Database connection string',

  // Domain verification
  'DOMAIN_VERIFICATION_API_KEY': 'Namecheap API key for domain verification',
  'DOMAIN_VERIFICATION_API_USER': 'Namecheap username',

  // Analytics
  'NEXT_PUBLIC_GA_ID': 'Google Analytics ID',
  'NEXT_PUBLIC_FB_PIXEL_ID': 'Facebook Pixel ID',

  // File upload
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME': 'Cloudinary cloud name',
  'CLOUDINARY_API_KEY': 'Cloudinary API key',
  'CLOUDINARY_API_SECRET': 'Cloudinary API secret',
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateEnvironment() {
  log('blue', '\n🔧 Environment Variables Validation\n');

  // Check if .env.local exists
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envLocalExists = fs.existsSync(envLocalPath);

  if (!envLocalExists) {
    log('yellow', '⚠️  .env.local not found. Creating from .env.example...\n');

    try {
      const envExamplePath = path.join(process.cwd(), '.env.example');
      if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envLocalPath);
        log('green', '✅ .env.local created from .env.example');
        log('yellow', '⚠️  Please configure the variables in .env.local before proceeding\n');
      } else {
        log('red', '❌ .env.example not found. Cannot create .env.local');
        return false;
      }
    } catch (error) {
      log('red', `❌ Error creating .env.local: ${error.message}`);
      return false;
    }
  }

  // Load environment variables
  require('dotenv').config({ path: envLocalPath });

  let allValid = true;
  let missingRequired = [];
  let missingOptional = [];

  // Check required variables
  log('bold', '📋 Required Variables:');
  for (const [varName, description] of Object.entries(REQUIRED_VARS)) {
    const value = process.env[varName];

    if (!value || value === 'your-secret-key-here' || value.includes('...')) {
      log('red', `❌ ${varName}: ${description}`);
      missingRequired.push(varName);
      allValid = false;
    } else {
      const displayValue = varName.includes('SECRET') || varName.includes('KEY')
        ? value.substring(0, 8) + '...'
        : value;
      log('green', `✅ ${varName}: ${displayValue}`);
    }
  }

  console.log('');

  // Check optional variables
  log('bold', '📋 Optional Variables:');
  for (const [varName, description] of Object.entries(OPTIONAL_VARS)) {
    const value = process.env[varName];

    if (!value || value === 'your-api-key' || value.includes('...')) {
      log('yellow', `⚠️  ${varName}: ${description} (not configured)`);
      missingOptional.push(varName);
    } else {
      const displayValue = varName.includes('SECRET') || varName.includes('KEY')
        ? value.substring(0, 8) + '...'
        : value;
      log('green', `✅ ${varName}: ${displayValue}`);
    }
  }

  console.log('');

  // Summary
  if (allValid) {
    log('green', '🎉 All required environment variables are configured!');

    if (missingOptional.length > 0) {
      log('yellow', `⚠️  ${missingOptional.length} optional variables are not configured:`);
      missingOptional.forEach(varName => {
        log('yellow', `   - ${varName}`);
      });
      console.log('');
      log('cyan', '💡 Configure optional variables for full functionality');
    }
  } else {
    log('red', '❌ Missing required environment variables:');
    missingRequired.forEach(varName => {
      log('red', `   - ${varName}: ${REQUIRED_VARS[varName]}`);
    });
    console.log('');
    log('cyan', '📖 Setup instructions:');
    log('cyan', '   1. Copy .env.example to .env.local');
    log('cyan', '   2. Configure Stripe keys from https://dashboard.stripe.com/test/apikeys');
    log('cyan', '   3. Configure Resend API key from https://resend.com/api-keys');
    log('cyan', '   4. Generate NextAuth secret: openssl rand -base64 32');
    log('cyan', '   5. Run this script again to validate');
  }

  return allValid;
}

// Test specific integrations
async function testIntegrations() {
  log('blue', '\n🧪 Testing Integrations...\n');

  // Test Stripe
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      await stripe.paymentMethods.list({ limit: 1 });
      log('green', '✅ Stripe connection successful');
    } catch (error) {
      log('red', `❌ Stripe connection failed: ${error.message}`);
    }
  }

  // Test Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      // Note: We don't actually send an email, just test the API key format
      if (process.env.RESEND_API_KEY.startsWith('re_')) {
        log('green', '✅ Resend API key format valid');
      } else {
        log('red', '❌ Resend API key format invalid (should start with "re_")');
      }
    } catch (error) {
      log('red', `❌ Resend setup failed: ${error.message}`);
    }
  }
}

// Main execution
async function main() {
  const isValid = validateEnvironment();

  if (isValid) {
    await testIntegrations();
    log('green', '\n🎉 Environment validation completed successfully!');
    process.exit(0);
  } else {
    log('red', '\n❌ Environment validation failed. Please fix the issues above.');
    process.exit(1);
  }
}

// Run only if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    log('red', `\n💥 Validation error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  validateEnvironment,
  testIntegrations,
  REQUIRED_VARS,
  OPTIONAL_VARS,
};