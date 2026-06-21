-- Nutrition Planning System - Database Schema
-- Run: mysql -u root -p < migrations/schema.sql

CREATE DATABASE IF NOT EXISTS nutrition CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nutrition;

CREATE TABLE IF NOT EXISTS users (
  userId        INT AUTO_INCREMENT PRIMARY KEY,
  firstName     VARCHAR(100) NOT NULL,
  lastName      VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE,
  password      VARCHAR(255),
  userRole      ENUM('admin', 'nutritionist', 'user') NOT NULL DEFAULT 'user',
  createDate    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updateDate    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin model: 1:1 with users, adds access level
CREATE TABLE IF NOT EXISTS admins (
  adminId       INT AUTO_INCREMENT PRIMARY KEY,
  userId        INT NOT NULL UNIQUE,
  accessLevel   ENUM('standard', 'super') NOT NULL DEFAULT 'standard',
  createDate    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updateDate    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recipes (
  recipeId      INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  mealType      ENUM('breakfast', 'lunch', 'dinner') NOT NULL,
  calories      FLOAT NOT NULL,
  protein       FLOAT NOT NULL DEFAULT 0,
  carbs         FLOAT NOT NULL DEFAULT 0,
  fat           FLOAT NOT NULL DEFAULT 0,
  isVegetarian  BOOLEAN NOT NULL DEFAULT FALSE,
  allergens     JSON NOT NULL,
  instructions  JSON NOT NULL,
  prepTime      INT NOT NULL DEFAULT 0,
  createDate    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updateDate    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- One-to-many: each recipe has many ingredients
CREATE TABLE IF NOT EXISTS ingredients (
  ingredientId  INT AUTO_INCREMENT PRIMARY KEY,
  recipeId      INT NOT NULL,
  name          VARCHAR(255) NOT NULL,
  amount        VARCHAR(100) NOT NULL,
  FOREIGN KEY (recipeId) REFERENCES recipes(recipeId) ON DELETE CASCADE
);

-- Many-to-many junction: user favorite recipes
CREATE TABLE IF NOT EXISTS user_favorite_recipes (
  userId        INT NOT NULL,
  recipeId      INT NOT NULL,
  createDate    DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (userId, recipeId),
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
  FOREIGN KEY (recipeId) REFERENCES recipes(recipeId) ON DELETE CASCADE
);

-- 1:1 user settings (display preferences)
CREATE TABLE IF NOT EXISTS user_settings (
  userId             INT PRIMARY KEY,
  displayName        VARCHAR(255) NOT NULL DEFAULT '',
  language           ENUM('he', 'en') NOT NULL DEFAULT 'he',
  emailNotifications BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

-- Support chat message persistence (created by sequelize.sync on first start, also defined here for completeness)
CREATE TABLE IF NOT EXISTS support_messages (
  messageId   INT           NOT NULL AUTO_INCREMENT,
  userId      INT           NOT NULL,
  senderRole  ENUM('user','nutritionist') NOT NULL,
  senderId    INT           NOT NULL,
  senderName  VARCHAR(100)  DEFAULT NULL,
  content     TEXT          NOT NULL,
  createdAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (messageId),
  CONSTRAINT fk_support_messages_user
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
