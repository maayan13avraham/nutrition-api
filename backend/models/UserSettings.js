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
}, {
  tableName: 'user_settings',
  timestamps: false,
});

module.exports = UserSettings;
