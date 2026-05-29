// In-memory mock database array for recipes
let recipes = [
  {
    recipeId: 1,
    name: 'חביתה עם ירקות',
    description: 'ארוחת בוקר קלה ומזינה עם ביצים וירקות טריים',
    mealType: 'breakfast',
    calories: 350,
    protein: 20,
    carbs: 30,
    fat: 12,
    isVegetarian: true,
    allergens: ['eggs', 'dairy'],
    prepTime: 15,
    ingredients: [
      { name: 'ביצים', amount: '3 יחידות' },
      { name: 'פלפל אדום', amount: '½ יחידה' },
      { name: 'פלפל ירוק', amount: '½ יחידה' },
      { name: 'בצל', amount: '¼ יחידה' },
      { name: 'שמן זית', amount: '1 כף' },
      { name: 'מלח ופלפל', amount: 'לפי הטעם' }
    ],
    instructions: [
      'חתוך את הפלפלים והבצל לקוביות קטנות.',
      'חמם שמן זית במחבת על אש בינונית.',
      'טגן את הבצל והפלפלים כ-3 דקות עד שהתרככו.',
      'טרוף את הביצים עם מלח ופלפל והוסף למחבת.',
      'ערבב בעדינות ובשל 3-4 דקות עד לקבלת מרקם רצוי.',
      'הגש מיד חם.'
    ],
    createDate: '2025-01-10T08:00:00Z',
    updateDate: '2025-01-10T08:00:00Z'
  },
  {
    recipeId: 2,
    name: 'שקשוקה',
    description: 'ביצים ברוטב עגבניות עשיר עם פלפלים ותבלינים',
    mealType: 'breakfast',
    calories: 400,
    protein: 22,
    carbs: 35,
    fat: 15,
    isVegetarian: true,
    allergens: ['eggs'],
    prepTime: 20,
    ingredients: [
      { name: 'ביצים', amount: '4 יחידות' },
      { name: 'עגבניות', amount: '4 יחידות גדולות' },
      { name: 'פלפל אדום', amount: '1 יחידה' },
      { name: 'בצל', amount: '1 יחידה' },
      { name: 'שום', amount: '3 שיניים' },
      { name: 'פפריקה מתוקה', amount: '1 כפית' },
      { name: 'כמון', amount: '½ כפית' },
      { name: 'שמן זית', amount: '2 כפות' },
      { name: 'מלח ופלפל שחור', amount: 'לפי הטעם' }
    ],
    instructions: [
      'קצוץ את הבצל, השום והפלפל.',
      'חמם שמן זית בסיר רחב ותטגן את הבצל 5 דקות.',
      'הוסף שום ופלפל ובשל 2 דקות נוספות.',
      'הוסף עגבניות קצוצות, פפריקה, כמון, מלח ופלפל.',
      'בשל את הרוטב על אש קטנה 10 דקות עד שיסמיך.',
      'צור 4 גומות ברוטב ושבור פנימה ביצה לכל גומה.',
      'כסה ובשל 5-7 דקות עד שהחלבון יתגבש אך החלמון יישאר רך.',
      'הגש ישירות מהסיר עם לחם.'
    ],
    createDate: '2025-01-10T08:30:00Z',
    updateDate: '2025-01-10T08:30:00Z'
  },
  {
    recipeId: 3,
    name: 'חזה עוף עם אורז',
    description: 'ארוחת צהריים עשירה בחלבון עם אורז בסמטי',
    mealType: 'lunch',
    calories: 550,
    protein: 45,
    carbs: 60,
    fat: 10,
    isVegetarian: false,
    allergens: [],
    prepTime: 30,
    ingredients: [
      { name: 'חזה עוף', amount: '200 גרם' },
      { name: 'אורז בסמטי', amount: '¾ כוס' },
      { name: 'שמן זית', amount: '1 כף' },
      { name: 'מיץ לימון', amount: '2 כפות' },
      { name: 'שום', amount: '2 שיניים' },
      { name: 'פפריקה מעושנת', amount: '½ כפית' },
      { name: 'מלח, פלפל, כורכום', amount: 'לפי הטעם' }
    ],
    instructions: [
      'שטוף את האורז ובשל לפי הוראות האריזה (כ-18 דקות).',
      'חתוך את חזה העוף לפרוסות שוות.',
      'ערבב שמן זית, מיץ לימון, שום כתוש, פפריקה, מלח ופלפל.',
      'שרה את העוף במרינדה 10 דקות לפחות.',
      'חמם מחבת גריל על אש גבוהה וצלה את העוף 4-5 דקות מכל צד.',
      'הנח על האורז ופזר כורכום לצבע.'
    ],
    createDate: '2025-01-11T08:00:00Z',
    updateDate: '2025-01-11T08:00:00Z'
  },
  {
    recipeId: 4,
    name: 'סלט קינואה',
    description: 'סלט מזין עם קינואה, ירקות צבעוניים וגרעינים',
    mealType: 'lunch',
    calories: 420,
    protein: 18,
    carbs: 55,
    fat: 14,
    isVegetarian: true,
    allergens: [],
    prepTime: 25,
    ingredients: [
      { name: 'קינואה', amount: '½ כוס יבשה' },
      { name: 'מלפפון', amount: '1 יחידה' },
      { name: 'עגבנייה', amount: '1 יחידה' },
      { name: 'פלפל צהוב', amount: '½ יחידה' },
      { name: 'בצל ירוק', amount: '3 גבעולים' },
      { name: 'פטרוזיליה טרייה', amount: 'חופן' },
      { name: 'שמן זית', amount: '2 כפות' },
      { name: 'מיץ לימון', amount: '2 כפות' },
      { name: 'גרעיני חמנייה', amount: '2 כפות' },
      { name: 'מלח ופלפל', amount: 'לפי הטעם' }
    ],
    instructions: [
      'שטוף את הקינואה ובשל ב-1 כוס מים עם קורט מלח, 15 דקות על אש קטנה.',
      'תן לקינואה להתקרר לגמרי.',
      'חתוך את כל הירקות לקוביות קטנות.',
      'קצוץ את הפטרוזיליה.',
      'ערבב קינואה, ירקות ופטרוזיליה בקערה גדולה.',
      'הכן רוטב מ-שמן זית, מיץ לימון, מלח ופלפל.',
      'שפוך את הרוטב על הסלט, ערבב ופזר גרעיני חמנייה מעל.'
    ],
    createDate: '2025-01-11T08:30:00Z',
    updateDate: '2025-01-11T08:30:00Z'
  },
  {
    recipeId: 5,
    name: 'סלמון אפוי',
    description: 'פילה סלמון אפוי עם ירקות שורש ולימון',
    mealType: 'dinner',
    calories: 480,
    protein: 40,
    carbs: 20,
    fat: 22,
    isVegetarian: false,
    allergens: ['fish'],
    prepTime: 35,
    ingredients: [
      { name: 'פילה סלמון', amount: '200 גרם' },
      { name: 'גזר', amount: '1 יחידה' },
      { name: 'בטטה', amount: '1 קטנה' },
      { name: 'שמן זית', amount: '2 כפות' },
      { name: 'לימון', amount: '1 יחידה' },
      { name: 'שום', amount: '2 שיניים' },
      { name: 'שמיר טרי', amount: 'מעט' },
      { name: 'מלח, פלפל, פפריקה', amount: 'לפי הטעם' }
    ],
    instructions: [
      'חמם תנור ל-200 מעלות.',
      'חתוך את הגזר והבטטה לקוביות, ערבב עם שמן זית, מלח ופלפל.',
      'פרס את הירקות בתבנית ואפה 15 דקות.',
      'מרח את הסלמון בשמן זית, שום כתוש, פפריקה ומלח.',
      'הנח את הסלמון על הירקות בתבנית.',
      'סחט לימון מעל הסלמון ופזר שמיר.',
      'אפה 15-18 דקות נוספות עד שהסלמון מתפצל בקלות.'
    ],
    createDate: '2025-01-12T08:00:00Z',
    updateDate: '2025-01-12T08:00:00Z'
  },
  {
    recipeId: 6,
    name: 'פסטה ברוטב עגבניות',
    description: 'פסטה צמחונית קלאסית עם רוטב עגבניות טרי ובזיליקום',
    mealType: 'dinner',
    calories: 500,
    protein: 16,
    carbs: 80,
    fat: 12,
    isVegetarian: true,
    allergens: ['gluten'],
    prepTime: 25,
    ingredients: [
      { name: 'פסטה ספגטי', amount: '150 גרם' },
      { name: 'עגבניות טריות', amount: '4 יחידות' },
      { name: 'שום', amount: '4 שיניים' },
      { name: 'שמן זית', amount: '3 כפות' },
      { name: 'בזיליקום טרי', amount: 'חופן עלים' },
      { name: 'פרמזן מגורר', amount: '2 כפות' },
      { name: 'מלח, פלפל, סוכר', amount: 'לפי הטעם' }
    ],
    instructions: [
      'בשל את הפסטה במי מלח רותחים לפי הוראות האריזה.',
      'חתוך את העגבניות לקוביות גסות.',
      'חמם שמן זית במחבת, הוסף שום פרוס ותטגן דקה.',
      'הוסף את העגבניות, מלח, פלפל וקורט סוכר.',
      'בשל את הרוטב 10-12 דקות על אש בינונית עד שיסמיך.',
      'סנן את הפסטה ושמור כוס ממי הבישול.',
      'הוסף את הפסטה לרוטב, ערבב ואם נדרש הוסף מעט ממי הבישול.',
      'הגש עם בזיליקום טרי ופרמזן מגורר.'
    ],
    createDate: '2025-01-12T08:30:00Z',
    updateDate: '2025-01-12T08:30:00Z'
  }
];

// Auto-increment counter for new recipe IDs
let nextId = 7;

// Fetch all recipes with optional mealType and vegetarian filters
function getAll(filters) {
  let result = [...recipes];
  if (filters.mealType) {
    result = result.filter(r => r.mealType === filters.mealType);
  }
  if (filters.isVegetarian !== undefined) {
    const veg = filters.isVegetarian === 'true';
    result = result.filter(r => r.isVegetarian === veg);
  }
  return result;
}

// Find and return a single recipe by its unique ID
function getById(id) {
  return recipes.find(r => r.recipeId === id);
}

// Create a new recipe with generated ID and timestamps
function create(data) {
  const now = new Date().toISOString();
  const recipe = { recipeId: nextId++, ...data, createDate: now, updateDate: now };
  recipes.push(recipe);
  return recipe;
}

// Update existing recipe details by ID and refresh the update timestamp
function update(id, data) {
  const idx = recipes.findIndex(r => r.recipeId === id);
  if (idx === -1) return null;
  recipes[idx] = { ...recipes[idx], ...data, updateDate: new Date().toISOString() };
  return recipes[idx];
}

// Remove a recipe from the array by its ID
function remove(id) {
  const idx = recipes.findIndex(r => r.recipeId === id);
  if (idx === -1) return null;
  const removed = recipes[idx];
  recipes.splice(idx, 1);
  return removed;
}

module.exports = { getAll, getById, create, update, remove };
