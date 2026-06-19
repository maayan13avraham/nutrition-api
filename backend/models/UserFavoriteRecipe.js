const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserFavoriteRecipe = sequelize.define('UserFavoriteRecipe', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  recipeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  createDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'user_favorite_recipes',
  timestamps: false,
});

module.exports = UserFavoriteRecipe;
