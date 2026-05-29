require('dotenv').config();
const express = require('express');
// Import global and custom middlewares
const logger = require('./middleware/logger');
const usersRoutes = require('./routes/usersRoutes');
const recipesRoutes = require('./routes/recipesRoutes');
const authRoutes = require('./routes/authRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = 3000;
// Parse incoming JSON request bodies
app.use(express.json());
// Allow cross-origin requests from the React frontend
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-user-role,x-user-id');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
// Log details of every incoming request
app.use(logger);
// Route incoming requests to their respective routers
app.use('/api/users', usersRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);
// Catch-all middleware to handle unmatched routes (404 Not Found)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: { code: 'NOT_FOUND', message: 'Route not found', details: {} }
  });
});
// Global error-handling middleware for unexpected server errors (500)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    data: null,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', details: {} }
  });
});
// Start the Express server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Nutrition API server running at http://localhost:${PORT}`);
});
