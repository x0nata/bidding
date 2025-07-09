// Simple deployment test script
// Run this locally to verify the configuration works

const app = require('./api/index.js');
const http = require('http');

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log('✅ Test server running on port', PORT);
  console.log('🔗 Test endpoints:');
  console.log(`   - Health: http://localhost:${PORT}/health`);
  console.log(`   - API: http://localhost:${PORT}/api/users`);
  console.log('');
  console.log('If this works locally, your Vercel deployment should work too!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down test server...');
  server.close(() => {
    console.log('✅ Test server closed');
    process.exit(0);
  });
});
