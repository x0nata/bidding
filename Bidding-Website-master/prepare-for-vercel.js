#!/usr/bin/env node

/**
 * Script to prepare the build for Vercel deployment
 * This copies the build directory to public for Vercel compatibility
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Preparing build for Vercel deployment...');

const buildDir = path.join(__dirname, 'build');
const publicDir = path.join(__dirname, 'public-vercel');

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found. Run: npm run build');
  process.exit(1);
}

// Remove existing public-vercel directory
if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true });
  console.log('🗑️  Removed existing public-vercel directory');
}

// Copy build to public-vercel
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    const files = fs.readdirSync(src);
    
    for (const file of files) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  copyRecursive(buildDir, publicDir);
  console.log('✅ Successfully copied build to public-vercel directory');
  
  // Verify the copy
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html found in public-vercel directory');
  } else {
    console.error('❌ index.html not found in public-vercel directory');
    process.exit(1);
  }
  
  const staticPath = path.join(publicDir, 'static');
  if (fs.existsSync(staticPath)) {
    console.log('✅ static directory found in public-vercel directory');
  } else {
    console.error('❌ static directory not found in public-vercel directory');
    process.exit(1);
  }
  
  console.log('🎉 Build is ready for Vercel deployment!');
  console.log('📁 Files are in: public-vercel/');
  
} catch (error) {
  console.error('❌ Error copying files:', error.message);
  process.exit(1);
}
