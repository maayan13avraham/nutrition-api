const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recipe = sequelize.define('Recipe', {
  recipeId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  mealType: {
    type: DataTypes.ENUM('breakfast', 'lunch', 'dinner'),
    allowNull: false,
  },
  calories: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  protein: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  carbs: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  fat: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  isVegetarian: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  allergens: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  instructions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  prepTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  createDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updateDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'recipes',
  timestamps: false,
});

module.exports = Recipe;
