// Simple health check endpoint for testing Vercel deployment

module.exports = (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "Vercel deployment working",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};
