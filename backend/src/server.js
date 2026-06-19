require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const { sequelize } = require('../models');
const logger = require('./middleware/logger');
const usersRoutes = require('./routes/usersRoutes');
const recipesRoutes = require('./routes/recipesRoutes');
const authRoutes = require('./routes/authRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-user-role,x-user-id');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(logger);

app.use('/api/users', usersRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false, data: null,
    error: { code: 'NOT_FOUND', message: 'Route not found', details: {} }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false, data: null,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', details: {} }
  });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    await sequelize.sync();
    console.log('Models synchronized.');
  } catch (err) {
    console.error('Database unavailable — starting without DB:', err.message);
  }
  app.listen(PORT, () => {
    console.log(`Nutrition API server running at http://localhost:${PORT}`);
  });
}

start();
