require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { sequelize, User, Admin, Recipe, Ingredient, UserSettings } = require('../models');

const seedUsers = [
  { userId: 1, firstName: 'Maya',  lastName: 'Cohen',     email: 'maya@example.com',  password: '123456', userRole: 'admin',        createDate: '2025-01-10T08:00:00Z', updateDate: '2025-01-10T08:00:00Z' },
  { userId: 2, firstName: 'Avi',   lastName: 'Levi',      email: 'avi@example.com',   password: '123456', userRole: 'nutritionist', createDate: '2025-01-12T09:00:00Z', updateDate: '2025-01-12T09:00:00Z' },
  { userId: 3, firstName: 'Dana',  lastName: 'Israeli',   email: 'dana@example.com',  password: '123456', userRole: 'user',         createDate: '2025-01-14T10:00:00Z', updateDate: '2025-01-14T10:00:00Z' },
  { userId: 4, firstName: 'Yossi', lastName: 'Ben-David', email: 'yossi@example.com', password: '123456', userRole: 'user',         createDate: '2025-01-15T11:00:00Z', updateDate: '2025-01-15T11:00:00Z' },
  { userId: 5, firstName: 'Noa',   lastName: 'Shapira',   email: 'noa@example.com',   password: '123456', userRole: 'nutritionist', createDate: '2025-01-16T12:00:00Z', updateDate: '2025-01-16T12:00:00Z' },
];

const seedRecipes = [
  {
    recipeId: 1, name: 'חביתה עם ירקות', description: 'ארוחת בוקר קלה ומזינה עם ביצים וירקות טריים',
    mealType: 'breakfast', calories: 350, protein: 20, carbs: 30, fat: 12,
    isVegetarian: true, allergens: ['eggs','dairy'], prepTime: 15,
    instructions: ['חתוך את הפלפלים והבצל לקוביות קטנות.','חמם שמן זית במחבת על אש בינונית.','טגן את הבצל והפלפלים כ-3 דקות עד שהתרככו.','טרוף את הביצים עם מלח ופלפל והוסף למחבת.','ערבב בעדינות ובשל 3-4 דקות עד לקבלת מרקם רצוי.','הגש מיד חם.'],
    createDate: '2025-01-10T08:00:00Z', updateDate: '2025-01-10T08:00:00Z',
    ingredients: [{ name:'ביצים',amount:'3 יחידות' },{ name:'פלפל אדום',amount:'½ יחידה' },{ name:'פלפל ירוק',amount:'½ יחידה' },{ name:'בצל',amount:'¼ יחידה' },{ name:'שמן זית',amount:'1 כף' },{ name:'מלח ופלפל',amount:'לפי הטעם' }],
  },
  {
    recipeId: 2, name: 'שקשוקה', description: 'ביצים ברוטב עגבניות עשיר עם פלפלים ותבלינים',
    mealType: 'breakfast', calories: 400, protein: 22, carbs: 35, fat: 15,
    isVegetarian: true, allergens: ['eggs'], prepTime: 20,
    instructions: ['קצוץ את הבצל, השום והפלפל.','חמם שמן זית בסיר רחב ותטגן את הבצל 5 דקות.','הוסף שום ופלפל ובשל 2 דקות נוספות.','הוסף עגבניות קצוצות, פפריקה, כמון, מלח ופלפל.','בשל את הרוטב על אש קטנה 10 דקות עד שיסמיך.','צור 4 גומות ברוטב ושבור פנימה ביצה לכל גומה.','כסה ובשל 5-7 דקות עד שהחלבון יתגבש אך החלמון יישאר רך.','הגש ישירות מהסיר עם לחם.'],
    createDate: '2025-01-10T08:30:00Z', updateDate: '2025-01-10T08:30:00Z',
    ingredients: [{ name:'ביצים',amount:'4 יחידות' },{ name:'עגבניות',amount:'4 יחידות גדולות' },{ name:'פלפל אדום',amount:'1 יחידה' },{ name:'בצל',amount:'1 יחידה' },{ name:'שום',amount:'3 שיניים' },{ name:'פפריקה מתוקה',amount:'1 כפית' },{ name:'כמון',amount:'½ כפית' },{ name:'שמן זית',amount:'2 כפות' },{ name:'מלח ופלפל שחור',amount:'לפי הטעם' }],
  },
  {
    recipeId: 3, name: 'חזה עוף עם אורז', description: 'ארוחת צהריים עשירה בחלבון עם אורז בסמטי',
    mealType: 'lunch', calories: 550, protein: 45, carbs: 60, fat: 10,
    isVegetarian: false, allergens: [], prepTime: 30,
    instructions: ['שטוף את האורז ובשל לפי הוראות האריזה (כ-18 דקות).','חתוך את חזה העוף לפרוסות שוות.','ערבב שמן זית, מיץ לימון, שום כתוש, פפריקה, מלח ופלפל.','שרה את העוף במרינדה 10 דקות לפחות.','חמם מחבת גריל על אש גבוהה וצלה את העוף 4-5 דקות מכל צד.','הנח על האורז ופזר כורכום לצבע.'],
    createDate: '2025-01-11T08:00:00Z', updateDate: '2025-01-11T08:00:00Z',
    ingredients: [{ name:'חזה עוף',amount:'200 גרם' },{ name:'אורז בסמטי',amount:'¾ כוס' },{ name:'שמן זית',amount:'1 כף' },{ name:'מיץ לימון',amount:'2 כפות' },{ name:'שום',amount:'2 שיניים' },{ name:'פפריקה מעושנת',amount:'½ כפית' },{ name:'מלח, פלפל, כורכום',amount:'לפי הטעם' }],
  },
  {
    recipeId: 4, name: 'סלט קינואה', description: 'סלט מזין עם קינואה, ירקות צבעוניים וגרעינים',
    mealType: 'lunch', calories: 420, protein: 18, carbs: 55, fat: 14,
    isVegetarian: true, allergens: [], prepTime: 25,
    instructions: ['שטוף את הקינואה ובשל ב-1 כוס מים עם קורט מלח, 15 דקות על אש קטנה.','תן לקינואה להתקרר לגמרי.','חתוך את כל הירקות לקוביות קטנות.','קצוץ את הפטרוזיליה.','ערבב קינואה, ירקות ופטרוזיליה בקערה גדולה.','הכן רוטב מ-שמן זית, מיץ לימון, מלח ופלפל.','שפוך את הרוטב על הסלט, ערבב ופזר גרעיני חמנייה מעל.'],
    createDate: '2025-01-11T08:30:00Z', updateDate: '2025-01-11T08:30:00Z',
    ingredients: [{ name:'קינואה',amount:'½ כוס יבשה' },{ name:'מלפפון',amount:'1 יחידה' },{ name:'עגבנייה',amount:'1 יחידה' },{ name:'פלפל צהוב',amount:'½ יחידה' },{ name:'בצל ירוק',amount:'3 גבעולים' },{ name:'פטרוזיליה טרייה',amount:'חופן' },{ name:'שמן זית',amount:'2 כפות' },{ name:'מיץ לימון',amount:'2 כפות' },{ name:'גרעיני חמנייה',amount:'2 כפות' },{ name:'מלח ופלפל',amount:'לפי הטעם' }],
  },
  {
    recipeId: 5, name: 'סלמון אפוי', description: 'פילה סלמון אפוי עם ירקות שורש ולימון',
    mealType: 'dinner', calories: 480, protein: 40, carbs: 20, fat: 22,
    isVegetarian: false, allergens: ['fish'], prepTime: 35,
    instructions: ['חמם תנור ל-200 מעלות.','חתוך את הגזר והבטטה לקוביות, ערבב עם שמן זית, מלח ופלפל.','פרס את הירקות בתבנית ואפה 15 דקות.','מרח את הסלמון בשמן זית, שום כתוש, פפריקה ומלח.','הנח את הסלמון על הירקות בתבנית.','סחט לימון מעל הסלמון ופזר שמיר.','אפה 15-18 דקות נוספות עד שהסלמון מתפצל בקלות.'],
    createDate: '2025-01-12T08:00:00Z', updateDate: '2025-01-12T08:00:00Z',
    ingredients: [{ name:'פילה סלמון',amount:'200 גרם' },{ name:'גזר',amount:'1 יחידה' },{ name:'בטטה',amount:'1 קטנה' },{ name:'שמן זית',amount:'2 כפות' },{ name:'לימון',amount:'1 יחידה' },{ name:'שום',amount:'2 שיניים' },{ name:'שמיר טרי',amount:'מעט' },{ name:'מלח, פלפל, פפריקה',amount:'לפי הטעם' }],
  },
  {
    recipeId: 6, name: 'פסטה ברוטב עגבניות', description: 'פסטה צמחונית קלאסית עם רוטב עגבניות טרי ובזיליקום',
    mealType: 'dinner', calories: 500, protein: 16, carbs: 80, fat: 12,
    isVegetarian: true, allergens: ['gluten'], prepTime: 25,
    instructions: ['בשל את הפסטה במי מלח רותחים לפי הוראות האריזה.','חתוך את העגבניות לקוביות גסות.','חמם שמן זית במחבת, הוסף שום פרוס ותטגן דקה.','הוסף את העגבניות, מלח, פלפל וקורט סוכר.','בשל את הרוטב 10-12 דקות על אש בינונית עד שיסמיך.','סנן את הפסטה ושמור כוס ממי הבישול.','הוסף את הפסטה לרוטב, ערבב ואם נדרש הוסף מעט ממי הבישול.','הגש עם בזיליקום טרי ופרמזן מגורר.'],
    createDate: '2025-01-12T08:30:00Z', updateDate: '2025-01-12T08:30:00Z',
    ingredients: [{ name:'פסטה ספגטי',amount:'150 גרם' },{ name:'עגבניות טריות',amount:'4 יחידות' },{ name:'שום',amount:'4 שיניים' },{ name:'שמן זית',amount:'3 כפות' },{ name:'בזיליקום טרי',amount:'חופן עלים' },{ name:'פרמזן מגורר',amount:'2 כפות' },{ name:'מלח, פלפל, סוכר',amount:'לפי הטעם' }],
  },
];

const seedSettings = [
  { userId: 1, displayName: 'Maya Cohen',     language: 'he', emailNotifications: true  },
  { userId: 2, displayName: 'Avi Levi',       language: 'he', emailNotifications: false },
  { userId: 3, displayName: 'Dana Israeli',   language: 'en', emailNotifications: true  },
  { userId: 4, displayName: 'Yossi Ben-David',language: 'he', emailNotifications: true  },
  { userId: 5, displayName: 'Noa Shapira',    language: 'en', emailNotifications: false },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('DB connection established.');

    await sequelize.sync({ force: true });
    console.log('Tables created (force sync).');

    // Insert users
    await User.bulkCreate(seedUsers);
    console.log('Users seeded.');

    // Insert admin record for user 1 (Maya)
    await Admin.create({ userId: 1, accessLevel: 'super' });
    console.log('Admin seeded.');

    // Insert recipes + ingredients
    for (const { ingredients, ...recipeData } of seedRecipes) {
      const recipe = await Recipe.create(recipeData);
      await Ingredient.bulkCreate(ingredients.map(ing => ({ ...ing, recipeId: recipe.recipeId })));
    }
    console.log('Recipes + ingredients seeded.');

    // Insert settings
    await UserSettings.bulkCreate(seedSettings);
    console.log('User settings seeded.');

    console.log('Seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
