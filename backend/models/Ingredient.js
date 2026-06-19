const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ingredient = sequelize.define('Ingredient', {
  ingredientId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  recipeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  amount: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  tableName: 'ingredients',
  timestamps: false,
});

module.exports = Ingredient;
