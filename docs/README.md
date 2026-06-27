# Smart Nutrition System

אפליקציה Full-Stack לניהול תזונה אישית — יצירת תפריט יומי מותאם, צ'אט AI, ותקשורת בזמן אמת עם תזונאי.

🌐 **Production:** https://nutrition-backend-0sku.onrender.com

---

## Tech Stack

| שכבה | טכנולוגיה |
|------|-----------|
| Frontend | React (CRA), Axios, Socket.io-client |
| Backend | Node.js + Express |
| Database | MySQL על AWS RDS + Sequelize ORM |
| Real-time | Socket.io |
| AI | Google Gemini API (SSE streaming) |
| Deployment | Render — monorepo (backend מגיש את frontend build) |

---

## Features

- **הרשמה/כניסה אוטומטית** — כניסה עם אימייל+סיסמה חדשים יוצרת משתמש אוטומטית (JWT)
- **תפריט יומי מותאם** — שאלון תזונה (גיל, משקל, גובה, מטרה, אלרגיות) → תפריט breakfast/lunch/dinner + החלפת מנות
- **פרופיל נשמר ב-DB** — בכניסה חוזרת מכל מכשיר, התפריט נטען אוטומטית ללא מילוי מחדש
- **ניהול מתכונים (CRUD)** — תזונאי/אדמין יוצרים, עורכים ומוחקים מתכונים
- **צ'אט AI** — שיחה עם Gemini בstreaming בזמן אמת לפי התפריט האישי
- **צ'אט עם תזונאי** — Socket.io: משתמש שולח, תזונאי מקבל התראה בזמן אמת בכל ניווט
- **הגדרות משתמש** — שם תצוגה, שפה (עברית/אנגלית), התראות דוא"ל
- **ריבוי שפות** — ממשק מלא בעברית ואנגלית

---

## Roles & Permissions

| תפקיד | גישה |
|--------|------|
| `user` | דשבורד, תפריט, צ'אט AI, צ'אט תזונאי, הגדרות |
| `nutritionist` | ניהול מתכונים, צ'אט עם כל המשתמשים, הגדרות |
| `admin` | הכל — כולל מחיקת מתכונים |

---

## API Endpoints

### Auth — `/api/auth`
| Method | Path | תיאור |
|--------|------|-------|
| POST | `/login` | כניסה — אם אימייל לא קיים, נרשם אוטומטית |
| POST | `/logout` | יציאה |

### Users — `/api/users`
| Method | Path | תיאור | הרשאה |
|--------|------|-------|-------|
| GET | `/me` | פרטי המשתמש הנוכחי | כולם |
| PUT | `/me` | עדכון אימייל/סיסמה | כולם |
| GET | `/` | כל המשתמשים | admin, nutritionist |
| DELETE | `/:id` | מחיקת משתמש | admin |

### Recipes — `/api/recipes`
| Method | Path | תיאור | הרשאה |
|--------|------|-------|-------|
| GET | `/` | כל המתכונים (עם פילטרים) | כולם |
| GET | `/:id` | מתכון בודד | כולם |
| POST | `/` | יצירת מתכון | admin, nutritionist |
| PUT | `/:id` | עדכון מתכון | admin, nutritionist |
| DELETE | `/:id` | מחיקת מתכון | admin |

### Menu — `/api/menu`
| Method | Path | תיאור |
|--------|------|-------|
| POST | `/generate` | יצירת תפריט יומי לפי פרופיל המשתמש |

### Settings — `/api/settings`
| Method | Path | תיאור |
|--------|------|-------|
| GET | `/` | הגדרות תצוגה (שם, שפה, התראות) |
| PUT | `/` | עדכון הגדרות תצוגה |
| GET | `/profile` | פרופיל תזונה (גובה, משקל, גיל וכו') |
| PUT | `/profile` | שמירת פרופיל תזונה ב-DB |

### AI — `/api/ai`
| Method | Path | תיאור |
|--------|------|-------|
| POST | `/chat` | שליחת הודעה ל-Gemini — תגובה ב-SSE streaming |

### Chat — `/api/chat`
| Method | Path | תיאור | הרשאה |
|--------|------|-------|-------|
| GET | `/conversations` | כל שיחות התמיכה | nutritionist, admin |
| GET | `/history/:userId` | היסטוריית שיחה עם משתמש ספציפי | nutritionist, admin, user (שלו בלבד) |

---

## WebSocket Events (Socket.io)

| Event | כיוון | תיאור |
|-------|-------|-------|
| `support_message` | user → server | משתמש שולח הודעה לתזונאי |
| `receive_support_message` | server → nutritionist | הודעה נכנסת לתזונאי |
| `nutritionist_reply` | nutritionist → server | תשובת תזונאי למשתמש |
| `private_message` | server → user | תשובה פרטית מהתזונאי |
| `nutritionist_status_changed` | server → all | שינוי סטטוס זמינות תזונאי |
| `nutritionist_going_offline` | nutritionist → server | הודעה לפני התנתקות |

---

## DB Schema

### `users`
| עמודה | סוג | תיאור |
|-------|-----|-------|
| userId | INT PK | מזהה |
| firstName, lastName | VARCHAR | שם |
| email | VARCHAR UNIQUE | אימייל |
| password | VARCHAR | סיסמה מוצפנת (bcrypt) |
| userRole | ENUM | `admin` / `nutritionist` / `user` |
| createDate, updateDate | DATETIME | תאריכים |

### `recipes`
| עמודה | סוג |
|-------|-----|
| recipeId | INT PK |
| name, description | VARCHAR/TEXT |
| mealType | ENUM (`breakfast`, `lunch`, `dinner`) |
| calories, protein, carbs, fat | INT |
| isVegetarian | BOOLEAN |
| allergens | JSON |
| prepTime | INT (דקות) |

### `user_settings`
| עמודה | סוג | תיאור |
|-------|-----|-------|
| userId | INT PK | מפתח זר ל-users |
| displayName, language | VARCHAR | הגדרות תצוגה |
| emailNotifications | BOOLEAN | |
| age, weight, height | INT/FLOAT | פרופיל תזונה |
| goal | VARCHAR | `loss` / `gain` / `health` |
| activityLevel | VARCHAR | רמת פעילות גופנית |
| allergies | TEXT (JSON) | אלרגיות |
| vegetarianOnly | BOOLEAN | |

### `support_messages`
| עמודה | סוג | תיאור |
|-------|-----|-------|
| messageId | INT PK | |
| userId | INT | מזהה המשתמש בשיחה |
| senderRole | ENUM | `user` / `nutritionist` |
| senderId, senderName | INT/VARCHAR | שולח |
| content | TEXT | תוכן ההודעה |
| createdAt | DATETIME | |

---

## Local Setup

```bash
# 1. Clone the repo
git clone <repo-url>

# 2. Backend
cd backend
npm install
# צור קובץ .env:
# DB_HOST=...  DB_USER=...  DB_PASSWORD=...  DB_NAME=nutrition
# JWT_SECRET=your_secret
# GEMINI_API_KEY=your_key
# FRONTEND_URL=http://localhost:5173
npm start
# → http://localhost:3000

# 3. Frontend (טאב נפרד)
cd frontend
npm install
# צור קובץ .env:
# REACT_APP_API_URL=http://localhost:3000
npm start
# → http://localhost:5173
```

---

## Deployment (Render)

- **שרת אחד** מגיש גם backend וגם `frontend/build`
- משתני סביבה מוגדרים ב-Render dashboard
- לאחר כל שינוי frontend: `npm run build` → `git add frontend/build` → `git push`
- Sequelize מריץ `sync({ alter: true })` בהפעלה — מוסיף עמודות חדשות אוטומטית

---

## Response Format

כל תגובות ה-API עוטפות בפורמט אחיד:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

שגיאה:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "First name is required",
    "details": { "field": "firstName" }
  }
}
```

### HTTP Status Codes
| Code | משמעות |
|------|--------|
| 200 | הצלחה |
| 201 | נוצר בהצלחה |
| 400 | שגיאת validation |
| 401 | לא מאומת |
| 403 | אין הרשאה |
| 404 | לא נמצא |
| 500 | שגיאת שרת |
