# Nutrition Planning System — Backend API

Smart personalized nutrition planning system backend.
Built with Node.js + Express, mock data only (in-memory).

## Quick Start

```bash
npm install
npm start
```

Server runs at **http://localhost:3000**

## Project Structure

```
├── server.js              # Express app entry point
├── middleware/
│   ├── logger.js          # Request logger (runs on all routes)
│   └── auth.js            # Role-based access control
├── models/
│   ├── usersData.js       # Mock users data (5 users)
│   └── recipesData.js     # Mock recipes data (6 recipes)
├── controllers/
│   ├── usersController.js
│   └── recipesController.js
├── routes/
│   ├── usersRoutes.js
│   └── recipesRoutes.js
└── docs/
    ├── README.md               # Full API reference
    └── postman_collection.json # Import into Postman to test
```

## Authentication

Add the header `x-user-role` to every request:

```
x-user-role: admin | nutritionist | user
```

## Endpoints

| Method | Path | Role required |
|--------|------|---------------|
| GET | /users | admin, nutritionist |
| GET | /users/:id | admin, nutritionist, user |
| POST | /users | admin |
| PUT | /users/:id | admin, nutritionist, user |
| DELETE | /users/:id | admin |
| GET | /recipes | admin, nutritionist, user |
| GET | /recipes/:id | admin, nutritionist, user |
| POST | /recipes | admin, nutritionist |
| PUT | /recipes/:id | admin, nutritionist |
| DELETE | /recipes/:id | admin |

`GET /recipes` supports query params: `?mealType=breakfast` and `?isVegetarian=true`

## Response Format

All responses follow this structure:

```json
{ "success": true, "data": { ... }, "error": null }
```

```json
{ "success": false, "data": null, "error": { "code": "...", "message": "...", "details": {} } }
```

See `docs/README.md` for full API reference with examples.
