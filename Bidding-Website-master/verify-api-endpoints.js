#!/usr/bin/env node

/**
 * API Endpoints Verification Script
 * Tests all frontend API calls against backend endpoints
 */

const https = require('https');
const http = require('http');

// Configuration
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://bidding-sandy.vercel.app';
const TEST_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'Admin@123'
};

console.log('🔍 Verifying API Endpoints...\n');
console.log(`Backend URL: ${BACKEND_URL}\n`);

// Helper function to make HTTP requests
const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
};

// Test endpoints
const testEndpoints = async () => {
  const results = [];
  
  // Test basic connectivity
  console.log('📡 Testing Basic Connectivity...');
  try {
    const healthCheck = await makeRequest(`${BACKEND_URL}/health`);
    results.push({
      endpoint: '/health',
      status: healthCheck.status,
      success: healthCheck.status === 200,
      description: 'Backend health check'
    });
    console.log(`✅ Health Check: ${healthCheck.status}`);
  } catch (error) {
    results.push({
      endpoint: '/health',
      status: 'ERROR',
      success: false,
      error: error.message,
      description: 'Backend health check'
    });
    console.log(`❌ Health Check: ${error.message}`);
  }

  // Test debug routes
  console.log('\n🔧 Testing Debug Routes...');
  const debugRoutes = [
    { path: '/debug/routes', desc: 'Available routes list' },
    { path: '/debug/auth', desc: 'Authentication debug info' },
    { path: '/debug/cors', desc: 'CORS configuration' }
  ];

  for (const route of debugRoutes) {
    try {
      const response = await makeRequest(`${BACKEND_URL}${route.path}`);
      results.push({
        endpoint: route.path,
        status: response.status,
        success: response.status === 200,
        description: route.desc
      });
      console.log(`✅ ${route.path}: ${response.status}`);
    } catch (error) {
      results.push({
        endpoint: route.path,
        status: 'ERROR',
        success: false,
        error: error.message,
        description: route.desc
      });
      console.log(`❌ ${route.path}: ${error.message}`);
    }
  }

  // Test API routes (without authentication)
  console.log('\n📊 Testing Public API Routes...');
  const publicRoutes = [
    { path: '/api/product', desc: 'Get all products' },
    { path: '/api/category', desc: 'Get all categories' },
    { path: '/api/category/hierarchy', desc: 'Get category hierarchy' },
    { path: '/api/product/auctions/active', desc: 'Get active auctions' },
    { path: '/api/bidding/stats/active-bids-count', desc: 'Get active bids count' }
  ];

  for (const route of publicRoutes) {
    try {
      const response = await makeRequest(`${BACKEND_URL}${route.path}`);
      results.push({
        endpoint: route.path,
        status: response.status,
        success: response.status === 200,
        description: route.desc
      });
      console.log(`✅ ${route.path}: ${response.status}`);
    } catch (error) {
      results.push({
        endpoint: route.path,
        status: 'ERROR',
        success: false,
        error: error.message,
        description: route.desc
      });
      console.log(`❌ ${route.path}: ${error.message}`);
    }
  }

  // Test authentication
  console.log('\n🔐 Testing Authentication...');
  try {
    const loginResponse = await makeRequest(`${BACKEND_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://bidding-9vw1.vercel.app'
      },
      body: JSON.stringify(TEST_CREDENTIALS)
    });

    results.push({
      endpoint: '/api/users/login',
      status: loginResponse.status,
      success: loginResponse.status === 200,
      description: 'User login'
    });

    if (loginResponse.status === 200) {
      console.log('✅ Login: SUCCESS');
      
      // Extract token from cookies if available
      const cookies = loginResponse.headers['set-cookie'];
      let token = null;
      if (cookies) {
        const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
        if (tokenCookie) {
          token = tokenCookie.split(';')[0].split('=')[1];
        }
      }

      // Test protected routes
      console.log('\n🔒 Testing Protected Routes...');
      const protectedRoutes = [
        { path: '/api/users/loggedin', desc: 'Check login status' },
        { path: '/api/users/getuser', desc: 'Get user profile' },
        { path: '/api/bidding/user/activity', desc: 'Get user bids' },
        { path: '/api/product/user', desc: 'Get user products' },
        { path: '/api/product/won-products', desc: 'Get won products' }
      ];

      for (const route of protectedRoutes) {
        try {
          const headers = {
            'Content-Type': 'application/json',
            'Origin': 'https://bidding-9vw1.vercel.app'
          };
          
          if (token) {
            headers['Cookie'] = `token=${token}`;
          }

          const response = await makeRequest(`${BACKEND_URL}${route.path}`, {
            method: 'GET',
            headers
          });

          results.push({
            endpoint: route.path,
            status: response.status,
            success: response.status === 200,
            description: route.desc
          });
          console.log(`✅ ${route.path}: ${response.status}`);
        } catch (error) {
          results.push({
            endpoint: route.path,
            status: 'ERROR',
            success: false,
            error: error.message,
            description: route.desc
          });
          console.log(`❌ ${route.path}: ${error.message}`);
        }
      }
    } else {
      console.log(`❌ Login: ${loginResponse.status}`);
    }
  } catch (error) {
    results.push({
      endpoint: '/api/users/login',
      status: 'ERROR',
      success: false,
      error: error.message,
      description: 'User login'
    });
    console.log(`❌ Login: ${error.message}`);
  }

  // Summary
  console.log('\n📋 Summary:');
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);

  if (total - successful > 0) {
    console.log('\n🔧 Failed Endpoints:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.endpoint}: ${r.status} (${r.description})`);
      if (r.error) console.log(`    Error: ${r.error}`);
    });
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Deploy updated frontend with API endpoint fixes');
  console.log('2. Deploy updated backend with new routes');
  console.log('3. Test authentication flow in browser');
  console.log('4. Verify data loading on problematic pages');

  return results;
};

// Run the tests
testEndpoints().catch(console.error);
