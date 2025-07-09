#!/usr/bin/env node

/**
 * Script to update backend URL in environment files
 * Usage: node update-backend-url.js <your-backend-url>
 * Example: node update-backend-url.js https://your-backend-deployment.vercel.app
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ Error: Please provide the backend URL');
  console.log('Usage: node update-backend-url.js <your-backend-url>');
  console.log('Example: node update-backend-url.js https://your-backend-deployment.vercel.app');
  process.exit(1);
}

const backendUrl = args[0].replace(/\/$/, ''); // Remove trailing slash
const apiUrl = `${backendUrl}/api`;

console.log('🔄 Updating backend URLs...');
console.log(`Backend URL: ${backendUrl}`);
console.log(`API URL: ${apiUrl}`);

// Update .env.production
const envProductionPath = path.join(__dirname, '.env.production');
if (fs.existsSync(envProductionPath)) {
  let content = fs.readFileSync(envProductionPath, 'utf8');
  
  content = content.replace(
    /REACT_APP_BACKEND_URL=.*/g,
    `REACT_APP_BACKEND_URL=${apiUrl}`
  );
  content = content.replace(
    /REACT_APP_API_URL=.*/g,
    `REACT_APP_API_URL=${apiUrl}`
  );
  content = content.replace(
    /REACT_APP_WEBSOCKET_URL=.*/g,
    `REACT_APP_WEBSOCKET_URL=${backendUrl}`
  );
  content = content.replace(
    /REACT_APP_SOCKET_URL=.*/g,
    `REACT_APP_SOCKET_URL=${backendUrl}`
  );
  
  fs.writeFileSync(envProductionPath, content);
  console.log('✅ Updated .env.production');
} else {
  console.log('⚠️  .env.production not found');
}

// Update production.env
const productionEnvPath = path.join(__dirname, '..', 'production.env');
if (fs.existsSync(productionEnvPath)) {
  let content = fs.readFileSync(productionEnvPath, 'utf8');
  
  content = content.replace(
    /REACT_APP_BACKEND_URL=.*/g,
    `REACT_APP_BACKEND_URL=${apiUrl}`
  );
  content = content.replace(
    /REACT_APP_API_URL=.*/g,
    `REACT_APP_API_URL=${apiUrl}`
  );
  content = content.replace(
    /REACT_APP_SERVER_URL=.*/g,
    `REACT_APP_SERVER_URL=${backendUrl}`
  );
  content = content.replace(
    /REACT_APP_WEBSOCKET_URL=.*/g,
    `REACT_APP_WEBSOCKET_URL=${backendUrl}`
  );
  content = content.replace(
    /REACT_APP_SOCKET_URL=.*/g,
    `REACT_APP_SOCKET_URL=${backendUrl}`
  );
  
  fs.writeFileSync(productionEnvPath, content);
  console.log('✅ Updated ../production.env');
} else {
  console.log('⚠️  ../production.env not found');
}

console.log('\n🎉 Backend URL update completed!');
console.log('\n📋 Next steps:');
console.log('1. Add these environment variables to your Vercel frontend project:');
console.log(`   REACT_APP_BACKEND_URL=${apiUrl}`);
console.log(`   REACT_APP_API_URL=${apiUrl}`);
console.log(`   REACT_APP_WEBSOCKET_URL=${backendUrl}`);
console.log(`   REACT_APP_SOCKET_URL=${backendUrl}`);
console.log('2. Rebuild and redeploy your frontend');
console.log('3. Test the frontend-backend communication');
