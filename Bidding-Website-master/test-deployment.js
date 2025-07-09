#!/usr/bin/env node

/**
 * Test script to verify deployment readiness
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Frontend Deployment Readiness...\n');

// Test 1: Check if build directory exists and has required files
console.log('1. Checking build directory...');
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  console.log('❌ Build directory not found. Run: npm run build');
  process.exit(1);
}

const requiredFiles = ['index.html', 'static', 'asset-manifest.json'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(buildDir, file)));

if (missingFiles.length > 0) {
  console.log(`❌ Missing required files in build: ${missingFiles.join(', ')}`);
  process.exit(1);
}
console.log('✅ Build directory contains all required files');

// Test 2: Check vercel.json configuration
console.log('\n2. Checking vercel.json configuration...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  
  if (vercelConfig.outputDirectory !== 'build') {
    console.log('❌ vercel.json outputDirectory should be "build"');
    process.exit(1);
  }
  
  if (!vercelConfig.buildCommand || !vercelConfig.buildCommand.includes('build')) {
    console.log('❌ vercel.json buildCommand should include "build"');
    process.exit(1);
  }
  
  console.log('✅ vercel.json configuration is correct');
} catch (error) {
  console.log('❌ vercel.json is invalid:', error.message);
  process.exit(1);
}

// Test 3: Check environment configuration
console.log('\n3. Checking environment configuration...');
const envFile = path.join(__dirname, '.env.production');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  if (envContent.includes('your-backend-deployment')) {
    console.log('⚠️  .env.production still contains placeholder URLs');
    console.log('   Run: node update-backend-url.js <your-actual-backend-url>');
  } else {
    console.log('✅ .env.production appears to be configured');
  }
} else {
  console.log('⚠️  .env.production not found');
}

// Test 4: Check package.json scripts
console.log('\n4. Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const requiredScripts = ['build', 'vercel-build'];
const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);

if (missingScripts.length > 0) {
  console.log(`❌ Missing required scripts: ${missingScripts.join(', ')}`);
  process.exit(1);
}
console.log('✅ All required scripts are present');

// Test 5: Check static assets
console.log('\n5. Checking static assets...');
const staticDir = path.join(buildDir, 'static');
if (!fs.existsSync(staticDir)) {
  console.log('❌ Static assets directory not found');
  process.exit(1);
}

const staticSubdirs = ['js', 'css'];
const missingSubdirs = staticSubdirs.filter(dir => !fs.existsSync(path.join(staticDir, dir)));

if (missingSubdirs.length > 0) {
  console.log(`❌ Missing static asset directories: ${missingSubdirs.join(', ')}`);
  process.exit(1);
}
console.log('✅ Static assets are properly organized');

console.log('\n🎉 Frontend is ready for deployment!');
console.log('\n📋 Deployment checklist:');
console.log('1. ✅ Build process works correctly');
console.log('2. ✅ Vercel configuration is valid');
console.log('3. ✅ Static assets are generated');
console.log('4. ✅ Required scripts are present');
console.log('5. ⚠️  Update backend URLs if needed');
console.log('\n🚀 Ready to deploy to Vercel!');
