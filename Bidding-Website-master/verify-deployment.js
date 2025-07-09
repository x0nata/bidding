#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Verifies that environment variables and configuration are correct before deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Frontend Deployment Configuration...\n');

// Check environment files
const envFiles = ['.env', '.env.production'];
const envConfig = {};

envFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    console.log(`📄 ${file}:`);
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envConfig[key.trim()] = value.trim();
        console.log(`  ${key.trim()}: ${value.trim()}`);
      }
    });
    console.log('');
  } else {
    console.log(`❌ ${file} not found\n`);
  }
});

// Verify critical configuration
console.log('🔧 Configuration Verification:');

// Check backend URL
const backendUrl = envConfig['REACT_APP_BACKEND_URL'];
if (backendUrl) {
  if (backendUrl.includes('/api')) {
    console.log('❌ BACKEND_URL contains /api suffix - this will cause double /api paths!');
    console.log(`   Current: ${backendUrl}`);
    console.log(`   Should be: ${backendUrl.replace('/api', '')}`);
  } else {
    console.log('✅ BACKEND_URL correctly configured without /api suffix');
  }
  
  if (backendUrl.includes('localhost')) {
    console.log('⚠️  BACKEND_URL points to localhost - make sure this is intentional');
  } else {
    console.log('✅ BACKEND_URL points to production server');
  }
} else {
  console.log('❌ REACT_APP_BACKEND_URL not found in environment files');
}

// Check WebSocket configuration
const socketUrl = envConfig['REACT_APP_SOCKET_URL'];
const websocketEnabled = envConfig['REACT_APP_ENABLE_WEBSOCKET'];

if (websocketEnabled === 'false' || !socketUrl) {
  console.log('✅ WebSocket disabled for Vercel serverless compatibility');
} else {
  console.log('⚠️  WebSocket enabled - may cause issues in Vercel serverless');
}

// Check auth slice configuration
const authSlicePath = path.join(__dirname, 'src/redux/slices/authSlice.js');
if (fs.existsSync(authSlicePath)) {
  const authContent = fs.readFileSync(authSlicePath, 'utf8');
  
  // Check for double /api issue
  if (authContent.includes("process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002/api'")) {
    console.log('❌ Auth slice still has /api suffix in fallback URL');
  } else if (authContent.includes("process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002'")) {
    console.log('✅ Auth slice correctly configured without /api suffix');
  }
  
  // Check for correct endpoint paths
  const hasCorrectPaths = authContent.includes('${API_URL}/api/users/login');
  if (hasCorrectPaths) {
    console.log('✅ Auth slice has correct endpoint paths');
  } else {
    console.log('❌ Auth slice may have incorrect endpoint paths');
  }
} else {
  console.log('❌ Auth slice file not found');
}

console.log('\n🚀 Deployment Recommendations:');
console.log('1. Clear Vercel build cache before deployment');
console.log('2. Verify environment variables in Vercel dashboard');
console.log('3. Test API endpoints after deployment');
console.log('4. Monitor browser Network tab for correct URLs');

// Generate deployment commands
console.log('\n📋 Deployment Commands:');
console.log('# Clear build cache and deploy:');
console.log('rm -rf build/ .next/ node_modules/.cache/');
console.log('npm run build');
console.log('vercel --prod');

console.log('\n🔗 Test URLs after deployment:');
if (backendUrl) {
  console.log(`Backend Health: ${backendUrl}/health`);
  console.log(`Backend Debug: ${backendUrl}/debug/auth`);
  console.log(`Backend CORS: ${backendUrl}/debug/cors`);
}

console.log('\n✅ Verification complete!');
