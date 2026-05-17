function logger(req, res, next) {
  // Capture the starting time of the incoming request
  const start = Date.now();
  // Listen for the response to finish before logging the details
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    // Print the structured log entry to the server console
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });
  // Pass control to the next middleware or route handler immediately
  next();
}

module.exports = logger;
