const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserSettings = sequelize.define('UserSettings', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  displayName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: '',
  },
  language: {
    type: DataTypes.ENUM('he', 'en'),
    allowNull: false,
    defaultValue: 'he',
  },
  emailNotifications: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  age:           { type: DataTypes.INTEGER,     allowNull: true },
  weight:        { type: DataTypes.FLOAT,        allowNull: true },
  height:        { type: DataTypes.FLOAT,        allowNull: true },
  goal:          { type: DataTypes.STRING(20),   allowNull: true },
  activityLevel: { type: DataTypes.STRING(20),   allowNull: true },
  allergies:     { type: DataTypes.TEXT,         allowNull: true },
  vegetarianOnly:{ type: DataTypes.BOOLEAN,      allowNull: true, defaultValue: false },
  savedMenu:     { type: DataTypes.TEXT,         allowNull: true },
}, {
  tableName: 'user_settings',
  timestamps: false,
});

module.exports = UserSettings;
