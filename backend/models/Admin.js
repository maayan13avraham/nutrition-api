const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define('Admin', {
  adminId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  accessLevel: {
    type: DataTypes.ENUM('standard', 'super'),
    allowNull: false,
    defaultValue: 'standard',
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
  tableName: 'admins',
  timestamps: false,
});

module.exports = Admin;
