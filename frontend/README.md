# Smart Nutrition System — מערכת תזונה חכמה

A personalized daily meal planner built with React. Users log in, fill in a short nutrition profile, and receive a calorie-matched breakfast/lunch/dinner menu filtered by their allergies and dietary preferences. An AI chat assistant is available to answer questions about the menu.

---

## Features

- **Authentication** — Login with email and password; session stored in `localStorage`
- **Nutrition questionnaire** — Age, weight, height, goal (weight loss / muscle gain / healthy living)
- **Allergy & preference filtering** — Eggs, dairy, gluten, fish, nuts, soy; vegetarian-only toggle
- **Calorie calculation** — BMR → TDEE formula, adjusted by goal (+300 / -200 / ±0 kcal)
- **Daily menu** — Three recipe cards (breakfast, lunch, dinner) closest in calories to the per-meal target
- **Swap meals** — Browse a full compatibility table and swap any meal with one click
- **Recipe modal** — Full details: ingredients, preparation instructions, macros, allergens
- **AI chat** — Streaming chat assistant that knows the current menu and user profile
- **Settings** — Display name, language (Hebrew / English), email notifications, password change
- **Bilingual / RTL support** — Full Hebrew (RTL) and English (LTR) UI

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 18, React Router v6 |
| Styling | Plain CSS (per-component) |
| State | React `useState` / `useContext` |
| i18n | Custom `LanguageContext` with inline translations |
| API | `axios` (REST), `fetch` streaming (AI chat) |
| Auth | Header-based (`x-user-id`, `x-user-role`) |

---

## Project Structure

```
src/
├── App.js                  # Router + PrivateRoute guard
├── context/
│   └── LanguageContext.js  # All Hebrew/English translations + language switcher
├── pages/
│   ├── LoginPage.jsx       # Login form with validation
│   ├── Dashboard.jsx       # Questionnaire, menu cards, recipe table, AI chat
│   └── SettingsPage.jsx    # Profile & account settings
├── components/
│   ├── Navbar.jsx          # Top navigation bar
│   ├── Footer.jsx
│   ├── Card.jsx            # Meal recipe card
│   ├── Table.jsx           # Generic sortable table
│   ├── RecipeModal.jsx     # Full recipe details overlay
│   └── AiChat.jsx          # Streaming AI chat panel
└── services/
    ├── api.js              # Axios instance (base URL + auth interceptor)
    ├── authService.js      # login()
    ├── recipesService.js   # getRecipes()
    ├── settingsService.js  # getSettings(), updateSettings()
    ├── usersService.js     # getMe(), updateMe()
    └── aiService.js        # streamChat() — SSE streaming
```

---

## Getting Started

### Prerequisites

- Node.js 16+
- A running backend that exposes the API (set its URL in `.env`)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
REACT_APP_API_URL=http://localhost:3000
```

### Running Locally

```bash
npm start
```

Opens at [http://localhost:5173](http://localhost:5173).

### Build for Production

```bash
npm run build
```

---

## How It Works

1. User logs in → credentials sent to `/api/auth/login` → user object saved in `localStorage`
2. User fills in the nutrition form → calorie target calculated client-side
3. App fetches all recipes from `/api/recipes` → filters by allergies / vegetarian preference
4. Best recipe per meal type is selected by minimising `|recipe.calories - targetPerMeal|`
5. User can swap any meal from the full compatibility table
6. AI chat sends profile + current menu to `/api/ai/chat` and streams the response word-by-word
