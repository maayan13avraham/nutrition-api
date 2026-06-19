const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  userId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  userRole: {
    type: DataTypes.ENUM('admin', 'nutritionist', 'user'),
    allowNull: false,
    defaultValue: 'user',
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
  tableName: 'users',
  timestamps: false,
});

module.exports = User;
