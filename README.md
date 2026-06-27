# Smart Nutrition System 🥗

A full-stack nutrition planning application that generates personalized daily meal plans, provides AI-powered dietary guidance, and enables real-time communication between users and nutritionists.

---

## Table of Contents

1. [Project Purpose](#1-project-purpose)
2. [Quick Start & Prerequisites](#2-quick-start--prerequisites)
3. [Database Setup](#3-database-setup)
4. [Environment Variables](#4-environment-variables)
5. [ORM Setup](#5-orm-setup)
6. [API Endpoints](#6-api-endpoints)
7. [WebSocket Feature](#7-websocket-feature)
8. [AI Feature](#8-ai-feature)
9. [Known Limitations](#9-known-limitations)

---

## 1. Project Purpose

The **Smart Nutrition System** is a personalized meal-planning web application built for three types of users:

| Role | What they can do |
|---|---|
| **User** | Complete a health questionnaire (age, weight, height, goal, activity level, allergies), receive a dynamically generated daily meal plan (breakfast + lunch + dinner) matched to their calorie target, swap meals manually, chat with a live nutritionist via the real-time support chat, and chat with an AI nutrition assistant |
| **Nutritionist** | Create and manage recipes in the database, monitor and reply to live user support messages via a WebSocket-powered chat panel |
| **Admin** | Manage all user accounts (change roles, delete users), create and delete recipes |

The system uses a **MySQL database** (via Sequelize ORM) for persistent storage of users, recipes, favorites, and settings; **Socket.IO** for real-time nutritionist support chat; and the **Groq API** (model: `llama-3.3-70b-versatile`) for a streaming AI nutrition assistant that is context-aware of the user's profile and daily menu.

---

## 2. Quick Start & Prerequisites

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18 | Backend + Frontend build |
| npm | ≥ 9 | Package management |
| MySQL | ≥ 8.0 | Database |
| Git | any | Source control |

You will also need a free **Groq API key** from [console.groq.com](https://console.groq.com).

---

### Installation

#### 1. Clone the repository

```bash
git clone <repository-url>
cd nutrition-api
```

#### 2. Install backend dependencies

```bash
cd backend
npm install
```

#### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

#### 4. Configure environment variables

```bash
cd ../backend
cp .env.example .env
# Edit .env and fill in your MySQL credentials and Groq API key (see Section 4)
```

#### 5. Set up the database

See [Section 3](#3-database-setup) for the full database setup steps.

#### 6. Start the backend

```bash
# From the backend/ directory
npm start
# Server runs at http://localhost:3000
```

#### 7. Start the frontend (development)

```bash
# From the frontend/ directory
npm start
# App opens at http://localhost:5173
```

#### 8. Build the frontend (production)

```bash
# From the frontend/ directory
npm run build
# Output goes to frontend/build/ — served automatically by the backend
```

---

## 3. Database Setup

### Step 1 — Create the MySQL database and schema

Log in to your MySQL server and run the schema file:

```bash
mysql -u root -p < backend/migrations/schema.sql
```

This creates the `nutrition` database and all seven core tables:
`users`, `admins`, `recipes`, `ingredients`, `user_favorite_recipes`, `user_settings`, `support_messages`.

### Step 2 — Seed initial data (users + 6 base recipes)

```bash
node backend/migrations/seed.js
```

This inserts 5 seed users (1 admin, 2 nutritionists, 2 regular users) and 6 initial recipes.

**Seed user credentials:**

| Name | Email | Password | Role |
|---|---|---|---|
| Maya Cohen | maya@example.com | 123456789 | admin |
| Avi Levi | avi@example.com | 123456 | nutritionist |
| Dana Israeli | dana@example.com | 123456 | user |
| Yossi Ben-David | yossi@example.com | 123456 | user |
| Noa Shapira | noa@example.com | 123456 | nutritionist |

> ⚠️ **Warning:** `seed.js` calls `sequelize.sync({ force: true })`, which **drops and recreates all tables**. Only run it once on a fresh database.

### Step 3 — Seed the 24 additional fitness recipes

```bash
node backend/migrations/seedRecipes.js
```

This append-only script adds 24 more recipes (8 breakfast, 8 lunch, 8 dinner) without dropping any existing data. After both seeds, the database contains **30 recipes total**.

---

## 4. Environment Variables

Create `backend/.env` based on `backend/.env.example`:

| Variable | Required | Example value | Description |
|---|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | `gsk_...` | Groq API key for the AI nutrition assistant |
| `DB_HOST` | ✅ Yes | `localhost` | MySQL host |
| `DB_PORT` | ✅ Yes | `3306` | MySQL port |
| `DB_USER` | ✅ Yes | `root` | MySQL username |
| `DB_PASSWORD` | ✅ Yes | `your_password` | MySQL password |
| `DB_NAME` | ✅ Yes | `nutrition` | MySQL database name (created by schema.sql) |
| `JWT_SECRET` | ✅ Yes | `change_this_in_prod` | Secret key for signing JWT tokens (use a long random string) |
| `PORT` | No | `3000` | Backend server port (defaults to 3000) |
| `FRONTEND_URL` | No | `https://your-app.onrender.com` | Deployed frontend URL — added to CORS allowed origins |
| `RENDER_EXTERNAL_URL` | No | `https://your-api.onrender.com` | Set automatically by Render — added to CORS allowed origins |

> Do **not** commit your real `.env` file. It is excluded via `.gitignore`.

---

## 5. ORM Setup

The backend uses **Sequelize v6** with the **mysql2** driver.

### Database configuration

`backend/config/database.js` creates a Sequelize instance from the environment variables:

```js
new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
})
```

### Models and relationships

All models live in `backend/models/`. The central `index.js` defines all associations:

| Relationship | Type | Models |
|---|---|---|
| User → Admin | One-to-One | `User.hasOne(Admin)` |
| User → UserSettings | One-to-One | `User.hasOne(UserSettings)` |
| Recipe → Ingredient | **One-to-Many** | `Recipe.hasMany(Ingredient, { as: 'ingredients' })` |
| User → SupportMessage | **One-to-Many** | `User.hasMany(SupportMessage, { foreignKey: 'userId', onDelete: 'CASCADE' })` |
| User ↔ Recipe | **Many-to-Many** | `User.belongsToMany(Recipe, { through: UserFavoriteRecipe, as: 'favoriteRecipes' })` |

The server calls `sequelize.sync()` on startup (non-destructive — does not drop tables) and gracefully continues if the database is temporarily unavailable.

### Model summary

| Model file | Table | Key fields |
|---|---|---|
| `User.js` | `users` | userId, firstName, lastName, email, password, userRole (ENUM) |
| `Admin.js` | `admins` | adminId, userId (FK), accessLevel |
| `Recipe.js` | `recipes` | recipeId, name, mealType (ENUM), calories, protein, carbs, fat, isVegetarian, allergens (JSON), instructions (JSON), prepTime |
| `Ingredient.js` | `ingredients` | ingredientId, recipeId (FK), name, amount |
| `UserFavoriteRecipe.js` | `user_favorite_recipes` | (userId, recipeId) composite PK |
| `UserSettings.js` | `user_settings` | userId (PK/FK), displayName, language (ENUM: he/en), emailNotifications |
| `SupportMessage.js` | `support_messages` | messageId (PK), userId (FK), senderRole ENUM('user','nutritionist'), senderId, senderName, content, createdAt |

---

## 6. API Endpoints

All responses follow the standard envelope format:

```json
{ "success": true, "data": {}, "error": null }
{ "success": false, "data": null, "error": { "code": "...", "message": "...", "details": {} } }
```

All endpoints except `/api/auth/login`, `/api/auth/register`, and `/api/auth/logout` require a JWT Bearer token in the `Authorization` header.

### Using the Postman Collection

A ready-to-import collection covering all 35 requests is available at `docs/postman_collection.json`.

**One-time setup to authenticate:**

1. In Postman, click **Import** → select `docs/postman_collection.json`.
2. Open the **Auth** folder and run **Login as admin**
   (pre-filled: `maya@example.com` / `123456789`).
3. In the response body, copy the value of `data.token`.
4. Click the collection name in the sidebar → **Variables** tab.
5. Paste the token into the **Current Value** column of the `token` row.
6. Click **Save**. All 35 requests now send `Authorization: Bearer <token>` automatically.

> To test as a different user, run the matching login request in the Auth folder, copy its token, and update the `token` variable the same way.

---

### Authentication — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new account with email + password (min 6 chars). Auto-extracts first/last name from email prefix. Returns JWT token. Error code: `EMAIL_TAKEN` if email already exists |
| `POST` | `/api/auth/login` | Public | Login with email + password. Returns JWT token and user info. Distinct error codes: `USER_NOT_FOUND` vs `INVALID_PASSWORD` |
| `POST` | `/api/auth/logout` | Public | Stateless logout (client clears the token) |

> **Note:** The frontend login page uses a combined flow — it attempts login first, and if `USER_NOT_FOUND` is returned, it automatically calls `/api/auth/register` to create a new account. This means a single form handles both login and registration.

**Register request body:**
```json
{ "email": "newuser@example.com", "password": "mypassword" }
```

**Login request body:**
```json
{ "email": "maya@example.com", "password": "123456789" }
```

**Login/Register success response `data`:**
```json
{ "token": "eyJ...", "userId": 1, "firstName": "Maya", "lastName": "Cohen", "userRole": "admin" }
```

---

### Users — `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/me` | All roles | Get the authenticated user's own profile |
| `PUT` | `/api/users/me` | All roles | Update own email and/or password |
| `GET` | `/api/users/me/favorites` | All roles | List the user's favorited recipes |
| `POST` | `/api/users/me/favorites/:recipeId` | All roles | Add a recipe to favorites |
| `DELETE` | `/api/users/me/favorites/:recipeId` | All roles | Remove a recipe from favorites |
| `GET` | `/api/users` | admin, nutritionist | List all users |
| `GET` | `/api/users/:id` | All roles* | Get a specific user (`user` role can only fetch their own) |
| `POST` | `/api/users` | admin only | Create a new user |
| `PUT` | `/api/users/:id` | All roles* | Update a user (`user` role can only update their own) |
| `DELETE` | `/api/users/:id` | admin only | Delete a user |

**PUT `/api/users/me` request body:**
```json
{ "email": "newemail@example.com", "password": "newpassword" }
```

---

### Recipes — `/api/recipes`

Supports query filters: `?mealType=breakfast|lunch|dinner` and `?isVegetarian=true|false`.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/recipes` | All roles | List all recipes (with ingredients). Supports `?mealType=` and `?isVegetarian=` filters |
| `GET` | `/api/recipes/:id` | All roles | Get a single recipe with full ingredient list |
| `POST` | `/api/recipes` | admin, nutritionist | Create a new recipe |
| `PUT` | `/api/recipes/:id` | admin, nutritionist | Update a recipe (replaces ingredient list entirely) |
| `DELETE` | `/api/recipes/:id` | admin, nutritionist | Delete a recipe |

**POST/PUT `/api/recipes` request body:**
```json
{
  "name": "Greek Yogurt Bowl",
  "mealType": "breakfast",
  "calories": 320,
  "protein": 22,
  "carbs": 38,
  "fat": 6,
  "isVegetarian": true,
  "allergens": ["dairy"],
  "prepTime": 5,
  "description": "High-protein breakfast bowl",
  "instructions": ["Add yogurt to bowl", "Top with granola and berries"],
  "ingredients": [
    { "name": "Greek Yogurt", "amount": "200g" },
    { "name": "Granola", "amount": "50g" }
  ]
}
```

---

### Settings — `/api/settings`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/settings` | All roles | Get current user's display preferences (returns defaults if not yet set) |
| `PUT` | `/api/settings` | All roles | Update display preferences |

**PUT `/api/settings` request body:**
```json
{ "displayName": "Maya", "language": "he", "emailNotifications": false }
```

---

### Menu Generation — `/api/menu`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/menu/generate` | All roles | Generate a matched daily menu (breakfast + lunch + dinner) that sums within ±100 kcal of the user's calorie target |

**Request body:**
```json
{
  "targetCalories": 1800,
  "goal": "health",
  "vegetarianOnly": false,
  "allergies": ["nuts", "gluten"]
}
```

**Success response `data` — exact match:**
```json
{
  "breakfast": { "recipeId": 3, "name": "...", "calories": 420, ... },
  "lunch":     { "recipeId": 14, "name": "...", "calories": 680, ... },
  "dinner":    { "recipeId": 27, "name": "...", "calories": 660, ... },
  "totalCalories": 1760
}
```

**Success response `data` — portion-scaling fallback** (when no combination fits within ±100 kcal):
```json
{
  "breakfast": { "recipeId": 3, "name": "...", "calories": 875, ... },
  "lunch":     { "recipeId": 14, "name": "...", "calories": 1225, ... },
  "dinner":    { "recipeId": 27, "name": "...", "calories": 1400, ... },
  "totalCalories": 3500,
  "scaled": true,
  "scaleFactor": 2.08
}
```

Goal values: `"loss"` (−500 kcal deficit applied before generation), `"gain"` (+300 kcal, prioritizes high-protein recipes), `"health"` (maintenance).

---

### AI Nutrition Assistant — `/api/ai`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/ai/chat` | All roles | Send a message to the AI nutrition assistant. Response is streamed via Server-Sent Events (SSE) |

**Request body:**
```json
{
  "profile": {
    "age": 28, "weight": 70, "height": 175,
    "goal": "health", "calories": 1800,
    "vegetarianOnly": false, "allergies": ["nuts"]
  },
  "menu": {
    "breakfast": { "name": "Oat Pancakes", "calories": 380, "protein": 14, "carbs": 58, "fat": 9 },
    "lunch":     { "name": "Turkey Burger", "calories": 620, "protein": 45, "carbs": 40, "fat": 18 },
    "dinner":    { "name": "Baked Salmon",  "calories": 510, "protein": 42, "carbs": 22, "fat": 24 }
  },
  "messages": [
    { "role": "user", "content": "Is my protein intake high enough?" }
  ],
  "lang": "he"
}
```

**SSE stream format:** Each chunk is sent as `data: {"success":true,"data":{"text":"..."}}` followed by a final `data: {"success":true,"data":{"done":true}}` event.

---

### Chat History — `/api/chat`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/chat/history/:userId` | All roles | Fetch persisted support-chat messages for a user. Regular users may only fetch their own history; nutritionists and admins may fetch any user's history. |

---

## 7. WebSocket Feature

### Overview

The real-time feature is a **centralized nutritionist support chat** that connects users directly with available nutritionists. All WebSocket logic lives in `backend/src/socket/socketHandler.js`.

### Authentication

Every Socket.IO connection is authenticated server-side. The client passes the JWT in the handshake:

```js
// Client (socketService.js)
const SOCKET_URL = process.env.REACT_APP_API_URL || window.location.origin;
socket = io(SOCKET_URL, {
  auth: { token: localStorage.getItem('token') }
});
```

The server verifies the token with `jwt.verify()` before accepting the connection. Unauthenticated connections are rejected immediately.

### Room Architecture

| Room name | Who joins | Purpose |
|---|---|---|
| `admin-room` | admin users | Role-based broadcast |
| `nutritionist-room` | nutritionists | Role-based broadcast |
| `user-room` | regular users | Role-based broadcast |
| `user-{userId}` | each user privately | Receiving private replies |
| `nutritionist_support_pool` | all nutritionists | Receiving user support messages |

### Custom Events

#### Client → Server

| Event | Sent by | Payload | Description |
|---|---|---|---|
| `join_room` | Any | `{ room }` | Join an arbitrary named room; triggers a system join message |
| `send_message` | Any | `{ room, message }` | Broadcast a message to all members of a room |
| `support_message` | User | `{ content }` | Send a help message to all online nutritionists |
| `nutritionist_reply` | Nutritionist | `{ targetUserId, content }` | Send a private reply to a specific user |
| `nutritionist_going_offline` | Nutritionist | *(none)* | Explicit offline signal sent before logout — fires while the socket is still live so `nutritionist_status_changed` reaches all users reliably |
| `user_typing` | Any | `{ room }` | Notify room members that this user is typing |

#### Server → Client

| Event | Received by | Description |
|---|---|---|
| `nutritionist_status_changed` | All clients | Fires on every nutritionist connect/disconnect; payload: `{ count: N }` |
| `receive_support_message` | Nutritionists | A user sent a support message; payload: `{ userId, username, content, timestamp }` |
| `private_message` | Specific user | A nutritionist replied; payload: `{ from, content, timestamp }` |
| `receive_message` | Room members | General room chat message or system join/leave notice |
| `online_users` | Room members | Updated list of connected users in the room |

### Frontend Integration

- **`SupportChat.jsx`** — A floating chat button (bottom-right corner) visible to all logged-in users. Shows a live online/offline nutritionist status badge and an unread message counter. Users type here to send support messages.
- **`NutritionistDashboard.jsx`** — The right-side support panel shows all active user threads in a sidebar. Clicking a thread opens the conversation and allows the nutritionist to reply. Unread badges update in real time.

### Two-Client Communication Flow

```
[User Tab]                     [Server]                  [Nutritionist Tab]
    |                              |                              |
    |-- support_message ---------> |                              |
    |                              |-- receive_support_message -> |
    |                              |                              |
    |                              | <-- nutritionist_reply ------|
    | <-- private_message ---------|                              |
    |                              |                              |
```

---

## 8. AI Feature

### Description

The AI feature is a **streaming nutrition assistant** named "נוטרי" (Nutri) that answers questions about the user's diet, today's meal plan, and general nutrition topics. It is context-aware — every API call includes the user's full profile and today's selected meals, so the AI can give personalized answers without the user having to repeat their information.

### Architecture

```
[Browser]                    [Express Backend]              [Groq Cloud]
    |                               |                              |
    | POST /api/ai/chat             |                              |
    | { profile, menu, messages }   |                              |
    |-----------------------------> |                              |
    |                               | Groq API request (SSE)       |
    |                               |----------------------------> |
    |                               |                              |
    |  SSE stream                   |  SSE stream                  |
    | <-----------------------------| <----------------------------|
    |  (token by token)             |  (token by token)            |
```

### Security

- The `GROQ_API_KEY` is stored exclusively in the backend `.env` file.
- The frontend never sees or stores the API key — it only communicates with `/api/ai/chat` on the same server.
- The Groq SDK is imported only in `backend/src/controllers/aiController.js`.

### System Prompt Context

The backend builds a Hebrew system prompt for each request that injects:
- User profile: age, weight, height, goal, calorie target, allergies, vegetarian preference
- Today's full menu: breakfast, lunch, and dinner with full macro breakdown and total calories
- Persona instructions: respond in the user's chosen language (Hebrew or English), be a supportive nutrition coach, do not proactively dump data unless asked

### Model Details

| Property | Value |
|---|---|
| Provider | Groq |
| Model | `llama-3.3-70b-versatile` |
| Max output tokens | 2048 |
| Streaming | Yes (Server-Sent Events) |
| Languages | Hebrew and English |

### Rate Limiting

The Groq free tier enforces request-per-minute limits. If the API returns a 429 response, the backend sends a `RATE_LIMIT_EXCEEDED` error code. The frontend (`AiChat.jsx`) detects this and displays a user-friendly "please wait 30 seconds" message in the current language.

---

## 9. Known Limitations

| # | Limitation | Impact |
|---|---|---|
| 1 | **Plain-text passwords** — passwords are stored and compared without hashing. | Security risk; not production-ready. |
| 2 | **No token revocation** — JWTs remain valid for 8 hours after logout. The `/api/auth/logout` endpoint is stateless and only clears the client-side token. | A stolen token cannot be invalidated. |
| 3 | **`emailNotifications` is a UI toggle only** — the setting is persisted to the database but no email-sending infrastructure exists. | The feature is non-functional beyond saving the preference. |
| 4 | **Activity level not persisted to the database** — the user's nutrition profile (age, weight, height, goal, activity level) is stored in `localStorage` only, not in any DB table. | Profile is lost if the user clears browser data or logs in on another device. |
| 5 | **Portion-scaling fallback** — when no recipe combination fits within ±100 kcal of the calorie target, the system scales the three highest-calorie recipes proportionally. Scaled portions may not match standard serving sizes. | Minor UX note. |
