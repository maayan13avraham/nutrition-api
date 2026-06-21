const sequelize = require('../config/database');
const User = require('./User');
const Admin = require('./Admin');
const Recipe = require('./Recipe');
const Ingredient = require('./Ingredient');
const UserFavoriteRecipe = require('./UserFavoriteRecipe');
const UserSettings = require('./UserSettings');
const SupportMessage = require('./SupportMessage');

// One-to-one: User → Admin
User.hasOne(Admin, { foreignKey: 'userId', onDelete: 'CASCADE' });
Admin.belongsTo(User, { foreignKey: 'userId' });

// One-to-one: User → UserSettings
User.hasOne(UserSettings, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserSettings.belongsTo(User, { foreignKey: 'userId' });

// One-to-many: Recipe → Ingredient
Recipe.hasMany(Ingredient, { foreignKey: 'recipeId', as: 'ingredients', onDelete: 'CASCADE' });
Ingredient.belongsTo(Recipe, { foreignKey: 'recipeId' });

// Many-to-many: User ↔ Recipe (favorites)
User.belongsToMany(Recipe, { through: UserFavoriteRecipe, foreignKey: 'userId', as: 'favoriteRecipes' });
Recipe.belongsToMany(User, { through: UserFavoriteRecipe, foreignKey: 'recipeId', as: 'favoritedBy' });

// One-to-many: User → SupportMessage (conversation history)
User.hasMany(SupportMessage, { foreignKey: 'userId', onDelete: 'CASCADE' });
SupportMessage.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, Admin, Recipe, Ingredient, UserFavoriteRecipe, UserSettings, SupportMessage };
