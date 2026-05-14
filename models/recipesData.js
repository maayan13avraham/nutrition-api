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
    createDate: '2025-01-12T08:30:00Z',
    updateDate: '2025-01-12T08:30:00Z'
  }
];

let nextId = 7;

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

function getById(id) {
  return recipes.find(r => r.recipeId === id);
}

function create(data) {
  const now = new Date().toISOString();
  const recipe = { recipeId: nextId++, ...data, createDate: now, updateDate: now };
  recipes.push(recipe);
  return recipe;
}

function update(id, data) {
  const idx = recipes.findIndex(r => r.recipeId === id);
  if (idx === -1) return null;
  recipes[idx] = { ...recipes[idx], ...data, updateDate: new Date().toISOString() };
  return recipes[idx];
}

function remove(id) {
  const idx = recipes.findIndex(r => r.recipeId === id);
  if (idx === -1) return null;
  const removed = recipes[idx];
  recipes.splice(idx, 1);
  return removed;
}

module.exports = { getAll, getById, create, update, remove };
