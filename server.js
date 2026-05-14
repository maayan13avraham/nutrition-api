const express = require('express');
const logger = require('./middleware/logger');
const usersRoutes = require('./routes/usersRoutes');
const recipesRoutes = require('./routes/recipesRoutes');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(logger);

app.use('/users', usersRoutes);
app.use('/recipes', recipesRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: { code: 'NOT_FOUND', message: 'Route not found', details: {} }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    data: null,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', details: {} }
  });
});

app.listen(PORT, () => {
  console.log(`Nutrition API server running at http://localhost:${PORT}`);
});
