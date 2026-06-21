const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupportMessage = sequelize.define('SupportMessage', {
  messageId:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:     { type: DataTypes.INTEGER, allowNull: false },
  senderRole: { type: DataTypes.ENUM('user', 'nutritionist'), allowNull: false },
  senderId:   { type: DataTypes.INTEGER, allowNull: false },
  senderName: { type: DataTypes.STRING(100), allowNull: true },
  content:    { type: DataTypes.TEXT, allowNull: false },
  createdAt:  { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'support_messages', timestamps: false });

module.exports = SupportMessage;
