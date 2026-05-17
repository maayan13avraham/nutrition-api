
## Setup & Run

```bash
npm install
npm start
```

Server starts at: **http://localhost:3000**

> Data resets on every server restart (in-memory only).

---

## Authentication

This API uses a simulated role-based access system via a request header:

```
x-user-role: admin | nutritionist | user
```

Include this header in every request. If missing or unauthorized, the server returns `403 Forbidden`.

### Role Permissions

| Action | admin | nutritionist | user |
|--------|-------|-------------|------|
| GET list of users | YES | YES | NO |
| GET single user | YES | YES | YES |
| POST user | YES | NO | NO |
| PUT user | YES | YES | YES |
| DELETE user | YES | NO | NO |
| GET recipes (all/one) | YES | YES | YES |
| POST recipe | YES | YES | NO |
| PUT recipe | YES | YES | NO |
| DELETE recipe | YES | NO | NO |

---

## API Reference

### Users — `/users`

#### GET /users
Returns all users.

**Required role:** `admin` or `nutritionist`

**Success response (200):**
```json
{
  "success": true,
  "data": [
    {
      "userId": 1,
      "firstName": "Maya",
      "lastName": "Cohen",
      "createDate": "2025-01-10T08:00:00Z",
      "updateDate": "2025-01-10T08:00:00Z",
      "userRole": "admin"
    }
  ],
  "error": null
}
```

---

#### GET /users/:id
Returns a single user by ID.

**Required role:** `admin`, `nutritionist`, or `user`

**Success response (200):**
```json
{ "success": true, "data": { "userId": 1, ... }, "error": null }
```

**Error response (404):**
```json
{
  "success": false,
  "data": null,
  "error": { "code": "NOT_FOUND", "message": "User with id 99 not found", "details": {} }
}
```

---

#### POST /users
Creates a new user.

**Required role:** `admin`

**Request body:**
```json
{
  "firstName": "Oren",
  "lastName": "Katz",
  "userRole": "user"
}
```

**Success response (201):**
```json
{ "success": true, "data": { "userId": 6 }, "error": null }
```

**Validation error (400):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required field: firstName",
    "details": { "field": "firstName" }
  }
}
```

---

#### PUT /users/:id
Updates an existing user.

**Required role:** `admin`, `nutritionist`, or `user`

**Request body:** same as POST

**Success response (200):**
```json
{ "success": true, "data": { "userId": 3 }, "error": null }
```

---

#### DELETE /users/:id
Deletes a user by ID.

**Required role:** `admin`

**Success response (200):**
```json
{ "success": true, "data": { "userId": 3 }, "error": null }
```

---

### Recipes — `/recipes`

#### GET /recipes
Returns all recipes. Supports optional query filters.

**Required role:** `admin`, `nutritionist`, or `user`

**Query parameters:**
| Param | Type | Example | Description |
|-------|------|---------|-------------|
| mealType | string | `breakfast` | Filter by meal type (`breakfast`, `lunch`, `dinner`) |
| isVegetarian | boolean | `true` | Filter vegetarian recipes only |

**Example:** `GET /recipes?mealType=breakfast&isVegetarian=true`

**Success response (200):**
```json
{
  "success": true,
  "data": [
    {
      "recipeId": 1,
      "name": "חביתה עם ירקות",
      "description": "ארוחת בוקר קלה ומזינה עם ביצים וירקות טריים",
      "mealType": "breakfast",
      "calories": 350,
      "protein": 20,
      "carbs": 30,
      "fat": 12,
      "isVegetarian": true,
      "allergens": ["eggs", "dairy"],
      "prepTime": 15,
      "createDate": "2025-01-10T08:00:00Z",
      "updateDate": "2025-01-10T08:00:00Z"
    }
  ],
  "error": null
}
```

---

#### GET /recipes/:id
Returns a single recipe by ID.

**Required role:** `admin`, `nutritionist`, or `user`

---

#### POST /recipes
Creates a new recipe.

**Required role:** `admin` or `nutritionist`

**Request body:**
```json
{
  "name": "סלט ירקות",
  "description": "סלט טרי וקל",
  "mealType": "lunch",
  "calories": 200,
  "protein": 5,
  "carbs": 25,
  "fat": 8,
  "isVegetarian": true,
  "allergens": [],
  "prepTime": 10
}
```

**Required fields:** `name`, `mealType`, `calories`, `protein`, `carbs`, `fat`

**Success response (201):**
```json
{ "success": true, "data": { "recipeId": 7 }, "error": null }
```

---

#### PUT /recipes/:id
Updates an existing recipe.

**Required role:** `admin` or `nutritionist`

**Request body:** same as POST

**Success response (200):**
```json
{ "success": true, "data": { "recipeId": 2 }, "error": null }
```

---

#### DELETE /recipes/:id
Deletes a recipe by ID.

**Required role:** `admin`

**Success response (200):**
```json
{ "success": true, "data": { "recipeId": 2 }, "error": null }
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Successful GET / PUT / DELETE |
| 201 | Successful POST (resource created) |
| 400 | Validation error / missing required field |
| 403 | Forbidden — missing or unauthorized role |
| 404 | Resource not found |
| 500 | Unexpected server error |

---

## Assumptions

- IDs are auto-incremented integers starting at 1.
- All data is in-memory and resets on server restart.
- Authentication is simulated via the `x-user-role` header.
- `createDate` and `updateDate` are set automatically by the server.
- `userRole` must be one of: `admin`, `nutritionist`, `user`.
- `mealType` must be one of: `breakfast`, `lunch`, `dinner`.
