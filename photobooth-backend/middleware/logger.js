// Request logging middleware
const logger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`📝 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  
  // Log response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '🔴' : '✅';
    console.log(`${statusColor} ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

module.exports = logger;