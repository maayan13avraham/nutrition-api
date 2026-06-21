// Append-only seed: inserts 24 new fitness-focused recipes.
// Safe to run multiple times — skips any recipe whose name already exists in the DB.
// Does NOT use force:sync or truncate any table.
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { sequelize, Recipe, Ingredient } = require('../models');

// EN: Quinoa Fruit Yogurt Bowl
// EN: Oatmeal with Banana & Walnuts
// EN: Avocado Toast with Poached Egg
// EN: Greek Yogurt with Granola & Strawberries
// EN: Banana Protein Shake with Almond Milk
// EN: Scrambled Eggs with Cheese & Tomato
// EN: Oat Pancakes with Honey
// EN: Acai Bowl with Fruits & Nuts
// EN: Turkey Burger with Vegetables
// EN: Red Lentil Soup
// EN: Tuna Vegetable Wrap
// EN: Grilled Chicken with Roasted Vegetables
// EN: Falafel with Hummus & Salad
// EN: Mushroom Risotto
// EN: Stuffed Sweet Potato with Chicken & Beans
// EN: Brown Rice with Tofu & Asparagus
// EN: Baked Turkey Breast with Quinoa
// EN: Lentil & Spinach Stew
// EN: Baked Cod Fillet with Sweet Potato
// EN: Beef Meatballs with Vegetables
// EN: Herb Roasted Chicken
// EN: Stir-Fried Tofu with Asian Vegetables
// EN: Homemade Chicken Schnitzel with Rice
// EN: Mediterranean Sea Fish with Vegetables

const NEW_RECIPES = [
  // ── BREAKFAST (8) ────────────────────────────────────────────────
  {
    name: 'קינואה עם פירות ויוגורט',
    description: 'קערת קינואה עשירה בחלבון עם פירות טריים ויוגורט יווני — ארוחת בוקר מזינה ומשביעה',
    mealType: 'breakfast', calories: 380, protein: 18, carbs: 52, fat: 9,
    isVegetarian: true, allergens: ['dairy'], prepTime: 10,
    instructions: [
      'בשל את הקינואה ב-1 כוס מים כ-15 דקות, תן להתקרר.',
      'חתוך תותים, בננה ומנגו לקוביות.',
      'מזוג יוגורט יווני לקערה.',
      'הוסף מעל את הקינואה הקרה.',
      'סדר את הפירות וטפטף דבש לסיום.',
    ],
    ingredients: [
      { name: 'קינואה מבושלת', amount: '½ כוס' },
      { name: 'יוגורט יווני', amount: '150 גרם' },
      { name: 'תותים', amount: '6 יחידות' },
      { name: 'בננה', amount: '½ יחידה' },
      { name: 'מנגו', amount: '¼ יחידה' },
      { name: 'דבש', amount: '1 כפית' },
    ],
  },
  {
    name: 'דייסת שיבולת שועל עם בננה ואגוזים',
    description: 'דייסה חמה ומשביעה עשירה בסיבים, אנרגיה ושומנים בריאים — הבחירה הקלאסית לבוקר פעיל',
    mealType: 'breakfast', calories: 420, protein: 14, carbs: 60, fat: 14,
    isVegetarian: true, allergens: ['nuts', 'gluten', 'dairy'], prepTime: 10,
    instructions: [
      'חמם חלב בסיר קטן על אש בינונית.',
      'הוסף את שיבולת השועל וערבב.',
      'בשל 5 דקות תוך ערבוב מתמיד עד לקבלת מרקם סמיך.',
      'מזוג לקערה, פרס בננה מעל.',
      'פזר אגוזי מלך קצוצים וטפטף דבש.',
    ],
    ingredients: [
      { name: 'שיבולת שועל גלגולים', amount: '½ כוס' },
      { name: 'חלב', amount: '1 כוס' },
      { name: 'בננה', amount: '1 יחידה' },
      { name: 'אגוזי מלך', amount: '2 כפות' },
      { name: 'דבש', amount: '1 כפית' },
      { name: 'קינמון', amount: '¼ כפית' },
    ],
  },
  {
    name: 'טוסט אבוקדו עם ביצה עלומה',
    description: 'טוסט על לחם שיפון עם ממרח אבוקדו וביצה עלומה — שילוב מנצח של שומנים בריאים וחלבון',
    mealType: 'breakfast', calories: 350, protein: 16, carbs: 30, fat: 19,
    isVegetarian: true, allergens: ['eggs', 'gluten'], prepTime: 12,
    instructions: [
      'קלה פרוסת לחם שיפון בטוסטר.',
      'כתוש אבוקדו עם מיץ לימון, מלח ופלפל.',
      'מרח את האבוקדו על הטוסט.',
      'בסיר עמוק הרתח מים, הוסף כף חומץ והמעט את האש.',
      'שבר ביצה למרכז המים ובשל 3 דקות עד שהחלבון יתגבש.',
      'הנח את הביצה על הטוסט ופזר פתיתי צ\'ילי.',
    ],
    ingredients: [
      { name: 'לחם שיפון', amount: '1 פרוסה' },
      { name: 'אבוקדו', amount: '½ יחידה' },
      { name: 'ביצה', amount: '1 יחידה' },
      { name: 'מיץ לימון', amount: '1 כפית' },
      { name: 'פתיתי צ\'ילי', amount: 'קורט' },
      { name: 'מלח ופלפל', amount: 'לפי הטעם' },
    ],
  },
  {
    name: 'יוגורט יווני עם גרנולה ותותים',
    description: 'קערת יוגורט עשיר בחלבון עם גרנולה פריכה ותותים טריים — מהיר, קל ומלא ערך תזונתי',
    mealType: 'breakfast', calories: 310, protein: 20, carbs: 38, fat: 7,
    isVegetarian: true, allergens: ['dairy', 'gluten', 'nuts'], prepTime: 5,
    instructions: [
      'מזוג יוגורט יווני לקערה.',
      'פזר גרנולה מעל.',
      'חתוך תותים לחצאים וסדר על הגרנולה.',
      'טפטף מעט דבש לסיום.',
    ],
    ingredients: [
      { name: 'יוגורט יווני 0%', amount: '200 גרם' },
      { name: 'גרנולה', amount: '3 כפות' },
      { name: 'תותים', amount: '8 יחידות' },
      { name: 'דבש', amount: '1 כפית' },
    ],
  },
  {
    name: 'שייק חלבון עם חלב שקדים ובננה',
    description: 'שייק חלבון עשיר לאחר אימון — מהיר להכנה, טעים ומכיל את כל חומרי המזון הדרושים להתאוששות',
    mealType: 'breakfast', calories: 290, protein: 28, carbs: 35, fat: 6,
    isVegetarian: true, allergens: ['nuts'], prepTime: 5,
    instructions: [
      'מזוג חלב שקדים לבלנדר.',
      'הוסף בננה קפואה, אבקת חלבון ואבקת קקאו.',
      'ערבב עד לקבלת מרקם חלק.',
      'הגש מיד עם קרח אם רצוי.',
    ],
    ingredients: [
      { name: 'חלב שקדים', amount: '300 מ"ל' },
      { name: 'בננה קפואה', amount: '1 יחידה' },
      { name: 'אבקת חלבון וניל', amount: '1 מנה (30 גרם)' },
      { name: 'אבקת קקאו', amount: '1 כף' },
      { name: 'קרח', amount: 'חופן' },
    ],
  },
  {
    name: 'ביצים מקושקשות עם גבינה ועגבנייה',
    description: 'ביצים מקושקשות קרמיות עם גבינה צהובה ועגבנייה טרייה — ארוחת בוקר קלאסית עשירה בחלבון',
    mealType: 'breakfast', calories: 340, protein: 24, carbs: 8, fat: 22,
    isVegetarian: true, allergens: ['eggs', 'dairy'], prepTime: 8,
    instructions: [
      'טרוף 3 ביצים עם כף חלב, מלח ופלפל.',
      'חמם מחבת עם כפית חמאה על אש נמוכה.',
      'מזוג את הביצים ובשל תוך ערבוב עדין ומתמיד.',
      'כשהביצים כמעט מוכנות, הוסף גבינה צהובה מגוררת.',
      'הגש מיד עם פרוסות עגבנייה טרייה בצד.',
    ],
    ingredients: [
      { name: 'ביצים', amount: '3 יחידות' },
      { name: 'גבינה צהובה מגוררת', amount: '30 גרם' },
      { name: 'עגבנייה', amount: '1 יחידה בינונית' },
      { name: 'חמאה', amount: '1 כפית' },
      { name: 'חלב', amount: '1 כף' },
      { name: 'מלח ופלפל שחור', amount: 'לפי הטעם' },
    ],
  },
  {
    name: 'פנקייק שיבולת שועל עם דבש',
    description: 'פנקייקים בריאים על בסיס שיבולת שועל — ללא קמח לבן, עשירים בסיבים ובטעם נהדר',
    mealType: 'breakfast', calories: 370, protein: 15, carbs: 55, fat: 10,
    isVegetarian: true, allergens: ['eggs', 'dairy', 'gluten'], prepTime: 15,
    instructions: [
      'טחן שיבולת שועל בבלנדר לקמח.',
      'ערבב קמח שיבולת שועל, ביצים, חלב, אבקת אפייה וקורט מלח.',
      'חמם מחבת אנטי-דביק על אש בינונית.',
      'מזוג מצקת בלילה למחבת וצלה 2 דקות מכל צד.',
      'הגש עם דבש ופירות עונה.',
    ],
    ingredients: [
      { name: 'שיבולת שועל', amount: '1 כוס' },
      { name: 'ביצים', amount: '2 יחידות' },
      { name: 'חלב', amount: '½ כוס' },
      { name: 'אבקת אפייה', amount: '1 כפית' },
      { name: 'דבש', amount: '2 כפות' },
      { name: 'מלח', amount: 'קורט' },
    ],
  },
  {
    name: 'קערת אסאי עם פירות ואגוזים',
    description: 'קערת אסאי סמיכה ואנרגטית עם פירות טריים, אגוזים וגרנולה — מלאת נוגדי חמצון',
    mealType: 'breakfast', calories: 400, protein: 10, carbs: 58, fat: 16,
    isVegetarian: true, allergens: ['nuts', 'gluten'], prepTime: 8,
    instructions: [
      'ערבב בלנדר אסאי קפוא, חלב שקדים ובננה קפואה.',
      'מזוג לקערה — המרקם צריך להיות סמיך מאוד.',
      'פרס בננה טרייה, תותים ואוכמניות מעל.',
      'פזר גרנולה ואגוזי קשיו לפריכות.',
      'טפטף מעט דבש לסיום.',
    ],
    ingredients: [
      { name: 'אסאי קפוא', amount: '100 גרם' },
      { name: 'חלב שקדים', amount: '100 מ"ל' },
      { name: 'בננה', amount: '1 יחידה' },
      { name: 'תותים', amount: '5 יחידות' },
      { name: 'אוכמניות', amount: '2 כפות' },
      { name: 'גרנולה', amount: '2 כפות' },
      { name: 'אגוזי קשיו', amount: '1 כף' },
      { name: 'דבש', amount: '1 כפית' },
    ],
  },

  // ── LUNCH (8) ─────────────────────────────────────────────────────
  {
    name: 'בורגר הודו עם ירקות',
    description: 'בורגר הודו רזה ועשיר בחלבון בלחמנייה מחיטה מלאה, עם ירקות טריים וחרדל דיז\'ון',
    mealType: 'lunch', calories: 480, protein: 42, carbs: 38, fat: 16,
    isVegetarian: false, allergens: ['gluten', 'eggs'], prepTime: 25,
    instructions: [
      'ערבב טחון הודו עם בצל מגורר, שום, ביצה, מלח ופלפל.',
      'צור קציצה שטוחה בגודל הלחמנייה.',
      'חמם מחבת גריל על אש גבוהה וצלה 5-6 דקות מכל צד.',
      'קלה קלות את הלחמנייה.',
      'הרכב: לחמנייה, חרדל, חסה, עגבנייה, הבורגר, מלפפון כבוש.',
    ],
    ingredients: [
      { name: 'טחון הודו', amount: '150 גרם' },
      { name: 'לחמנייה חיטה מלאה', amount: '1 יחידה' },
      { name: 'ביצה', amount: '1 יחידה' },
      { name: 'בצל', amount: '¼ יחידה' },
      { name: 'שום', amount: '1 שן' },
      { name: 'חרדל דיז\'ון', amount: '1 כף' },
      { name: 'חסה, עגבנייה, מלפפון כבוש', amount: 'לפי הטעם' },
      { name: 'מלח ופלפל', amount: 'לפי הטעם' },
    ],
  },
  {
    name: 'מרק עדשים אדומות',
    description: 'מרק עדשים אדומות עשיר ומחמם עם תבלינים מזרחיים — מקור מצוין לחלבון צמחי וסיבים',
    mealType: 'lunch', calories: 320, protein: 18, carbs: 48, fat: 5,
    isVegetarian: true, allergens: [], prepTime: 30,
    instructions: [
      'חמם שמן זית בסיר גדול ותטגן בצל עד להשחמה קלה.',
      'הוסף שום, כמון וכורכום ותטגן דקה נוספת.',
      'הוסף עדשים אדומות שטופות ו-1.2 ליטר מים.',
      'הביא לרתיחה, הנמך אש ובשל 25 דקות.',
      'טחן חלקית עם בלנדר שרביט.',
      'הגש עם לימון סחוט ופטרוזיליה קצוצה.',
    ],
    ingredients: [
      { name: 'עדשים אדומות', amount: '¾ כוס' },
      { name: 'בצל', amount: '1 יחידה גדולה' },
      { name: 'שום', amount: '3 שיניים' },
      { name: 'שמן זית', amount: '1 כף' },
      { name: 'כמון', amount: '1 כפית' },
      { name: 'כורכום', amount: '½ כפית' },
      { name: 'לימון', amount: '½ יחידה' },
      { name: 'פטרוזיליה', amount: 'קמצוץ' },
      { name: 'מלח ופלפל', amount: 'לפי הטעם' },
    ],
  },
  {
    name: 'עטיפת טונה עם ירקות',
    description: 'רול טונה קל ומשביע עם ירקות טריים ורוטב לימון — ארוחת צהריים מהירה ועשירה בחלבון',
    mealType: 'lunch', calories: 450, protein: 38, carbs: 42, fat: 12,
    isVegetarian: false, allergens: ['gluten', 'fish'], prepTime: 10,
    instructions: [
      'רוקן ויבש טונה משימורים.',
      'ערבב טונה עם גבינת שמנת דלת שומן, מיץ לימון ועירית.',
      'פרס טורטייה, מרח את תערובת הטונה.',
      'הנח עלי חסה, פרוסות מלפפון ועגבנייה.',
      'גלגל הדוק וחתוך לאלכסון.',
    ],
    ingredients: [
      { name: 'טונה בשימורים (במים)', amount: '1 פחית (160 גרם)' },
      { name: 'טורטייה חיטה מלאה', amount: '1 יחידה גדולה' },
      { name: 'גבינת שמנת דלת שומן', amount: '2 כפות' },
      { name: 'עלי חסה', amount: 'חופן' },
      { name: 'מלפפון', amount: '½ יחידה' },
      { name: 'עגבנייה', amount: '1 יחידה קטנה' },
      { name: 'מיץ לימון', amount: '1 כף' },
      { name: 'עירית', amount: 'מעט' },
    ],
  },
  {
    name: 'עוף בגריל עם ירקות צלויים',
    description: 'חזה עוף רזה מתובל על גריל עם ירקות צבעוניים צלויים — ארוחה קלאסית לבניית שריר',
    mealType: 'lunch', calories: 520, protein: 48, carbs: 22, fat: 18,
    isVegetarian: false, allergens: [], prepTime: 30,
    instructions: [
      'חמם תנור ל-200 מעלות.',
      'חתוך פלפלים, קישוא ובצל לפסים.',
      'ערבב ירקות עם שמן זית, מלח ופלפל ואפה 20 דקות.',
      'מרח עוף בשמן זית, לימון, שום ותבלינים.',
      'צלה על גריל חם 6-7 דקות מכל צד.',
      'הגש יחד עם הירקות הצלויים.',
    ],
    ingredients: [
      { name: 'חזה עוף', amount: '180 גרם' },
      { name: 'פלפל אדום וצהוב', amount: '1 יחידה כל אחד' },
      { name: 'קישוא', amount: '1 יחידה' },
      { name: 'בצל סגול', amount: '½ יחידה' },
      { name: 'שמן זית', amount: '2 כפות' },
      { name: 'שום', amount: '2 שיניים' },
      { name: 'לימון', amount: '½ יחידה' },
      { name: 'אורגנו, מלח, פלפל', amount: 'לפי הטעם' },
    ],
  },
  {
    name: 'פלאפל עם חומוס וסלט',
    description: 'פלאפל ביתי פריך עם חומוס קרמי וסלט ירקות טרי — ארוחת צהריים ים-תיכונית מלאת טעם',
    mealType: 'lunch', calories: 490, protein: 20, carbs: 58, fat: 20,
    isVegetarian: true, allergens: ['gluten'], prepTime: 35,
    instructions: [
      'השרה חומוס מבושל עם בצל, שום, פטרוזיליה, כוסברה, כמון ומלח בבלנדר.',
      'הוסף קמח וערבב לבצק אחיד.',
      'צור קציצות קטנות ועגולות.',
      'טגן בשמן על אש בינונית-גבוהה 3-4 דקות מכל צד.',
      'הגש על פיתה עם חומוס, סלט ישראלי וטחינה.',
    ],
    ingredients: [
      { name: 'חומוס מבושל', amount: '1 כוס' },
      { name: 'בצל', amount: '½ יחידה' },
      { name: 'שום', amount: '2 שיניים' },
      { name: 'פטרוזיליה וכוסברה', amount: 'חופן מכל' },
      { name: 'קמח לבן', amount: '2 כפות' },
      { name: 'כמון', amount: '1 כפית' },
      { name: 'חומוס מוכן', amount: '3 כפות' },
      { name: 'סלט ישראלי (עגבנייה, מלפפון, בצל)', amount: 'לפי הטעם' },
      { name: 'שמן לטיגון', amount: 'לפי הצורך' },
    ],
  },
  {
    name: 'ריזוטו פטריות',
    description: 'ריזוטו קרמי עם פטריות שיטאקי ופרמזן — ארוחת צהריים מפנקת ועשירה בטעמים',
    mealType: 'lunch', calories: 440, protein: 14, carbs: 68, fat: 12,
    isVegetarian: true, allergens: ['dairy'], prepTime: 35,
    instructions: [
      'חמם ציר ירקות בסיר נפרד.',
      'טגן בצל ושום בשמן זית עד לשקיפות.',
      'הוסף פטריות פרוסות ותטגן 5 דקות.',
      'הוסף אורז ארבוריו וערבב דקה.',
      'הוסף יין לבן וערבב עד לספיגה.',
      'הוסף ציר כף-כף תוך ערבוב מתמיד כ-18 דקות.',
      'סיים עם חמאה ופרמזן מגורר.',
    ],
    ingredients: [
      { name: 'אורז ארבוריו', amount: '¾ כוס' },
      { name: 'פטריות שיטאקי', amount: '150 גרם' },
      { name: 'ציר ירקות', amount: '3 כוסות' },
      { name: 'יין לבן יבש', amount: '¼ כוס' },
      { name: 'בצל', amount: '1 יחידה קטנה' },
      { name: 'שום', amount: '2 שיניים' },
      { name: 'פרמזן מגורר', amount: '3 כפות' },
      { name: 'חמאה', amount: '1 כף' },
      { name: 'שמן זית', amount: '1 כף' },
    ],
  },
  {
    name: 'בטטה ממולאת בעוף ושעועית',
    description: 'בטטה אפויה ממולאת בעוף מתובל ושעועית שחורה — ארוחה מאוזנת ומשביעה עשירה בסיבים',
    mealType: 'lunch', calories: 510, protein: 36, carbs: 56, fat: 10,
    isVegetarian: false, allergens: [], prepTime: 50,
    instructions: [
      'חמם תנור ל-200 מעלות.',
      'נקב בטטה בינונית עם מזלג ואפה 40-45 דקות.',
      'בינתיים טגן חזה עוף מגורר עם שעועית שחורה, פפריקה וכמון.',
      'חצה את הבטטה האפויה לאורכה.',
      'מלא בתערובת העוף ושעועית.',
      'הוסף יוגורט יווני ועירית מעל.',
    ],
    ingredients: [
      { name: 'בטטה בינונית', amount: '1 יחידה (200 גרם)' },
      { name: 'חזה עוף מגורר', amount: '120 גרם' },
      { name: 'שעועית שחורה מבושלת', amount: '½ כוס' },
      { name: 'פפריקה', amount: '1 כפית' },
      { name: 'כמון', amount: '½ כפית' },
      { name: 'יוגורט יווני', amount: '2 כפות' },
      { name: 'עירית', amount: 'מעט' },
      { name: 'מלח ופלפל', amount: 'לפי הטעם' },
    ],
  },
  {
    name: 'אורז חום עם טופו ואספרגוס',
    description: 'אורז חום מזין עם טופו מוקפץ ואספרגוס — ארוחה צמחונית עשירה בחלבון וסיבים',
    mealType: 'lunch', calories: 410, protein: 22, carbs: 60, fat: 10,
    isVegetarian: true, allergens: ['soy'], prepTime: 30,
    instructions: [
      'בשל אורז חום לפי הוראות האריזה (כ-25 דקות).',
      'לחץ טופו להסרת עודפי נוזלים, חתוך לקוביות.',
      'טגן טופו בשמן שומשום עד להשחמה מכל הצדדים.',
      'הוסף אספרגוס חתוך וסויה ובשל 3 דקות נוספות.',
      'הגש מעל האורז החום עם שומשום מפוזר.',
    ],
    ingredients: [
      { name: 'אורז חום', amount: '½ כוס יבש' },
      { name: 'טופו קשה', amount: '150 גרם' },
      { name: 'אספרגוס', amount: '8 ענפים' },
      { name: 'שמן שומשום', amount: '1 כף' },
      { name: 'רוטב סויה', amount: '2 כפות' },
      { name: 'שום', amount: '1 שן' },
      { name: 'שומשום לבן', amount: '1 כף' },
    ],
  },

  // ── DINNER (8) ────────────────────────────────────────────────────
  {
    name: 'חזה הודו אפוי עם קינואה',
    description: 'חזה הודו עסיסי ורזה אפוי בתנור לצד קינואה מבושלת — ארוחת ערב גבוהה בחלבון ונמוכה בשומן',
    mealType: 'dinner', calories: 480, protein: 52, carbs: 38, fat: 10,
    isVegetarian: false, allergens: [], prepTime: 40,
    instructions: [
      'חמם תנור ל-190 מעלות.',
      'מרח חזה הודו בשמן זית, שום, רוזמרין, מלח ופלפל.',
      'הנח בתבנית ואפה 30-35 דקות.',
      'בינתיים בשל קינואה ב-1 כוס ציר עוף 15 דקות.',
      'הנח את הקינואה בצלחת ופרס את ההודו מעל.',
    ],
    ingredients: [
      { name: 'חזה הודו', amount: '200 גרם' },
      { name: 'קינואה', amount: '½ כוס' },
      { name: 'ציר עוף', amount: '1 כוס' },
      { name: 'שמן זית', amount: '1 כף' },
      { name: 'שום', amount: '2 שיניים' },
      { name: 'רוזמרין', amount: '½ כפית' },
      { name: 'מלח ופלפל', amount: 'לפי הטעם' },
    ],
  },
  {
    name: 'תבשיל עדשים ותרד',
    description: 'תבשיל חם ומחזק של עדשים ירוקות ותרד — עשיר בברזל, סיבים וחלבון צמחי',
    mealType: 'dinner', calories: 370, protein: 22, carbs: 52, fat: 6,
    isVegetarian: true, allergens: [], prepTime: 35,
    instructions: [
      'חמם שמן זית ותטגן בצל ושום.',
      'הוסף עגבניות קצוצות ותבלינים ובשל 5 דקות.',
      'הוסף עדשים שטופות ו-2 כוסות מים.',
      'בשל 20-25 דקות עד שהעדשים מתרככות.',
      'הוסף תרד טרי ובשל 3 דקות נוספות.',
      'הגש עם לחם קל.',
    ],
    ingredients: [
      { name: 'עדשים ירוקות', amount: '¾ כוס' },
      { name: 'תרד טרי', amount: '2 כוסות' },
      { name: 'עגבניות קצוצות', amount: '2 יחידות' },
      { name: 'בצל', amount: '1 יחידה' },
      { name: 'שום', amount: '3 שיניים' },
      { name: 'שמן זית', amount: '1 כף' },
      { name: 'כמון, פפריקה, מלח', amount: 'לפי הטעם' },
    ],
  },
  {
    name: 'פילה בקלה אפוי עם בטטה',
    description: 'פילה בקלה לבן ועדין אפוי בתנור עם בטטה ורוטב לימון-שום — ארוחת ערב קלה ובריאה',
    mealType: 'dinner', calories: 420, protein: 40, carbs: 38, fat: 8,
    isVegetarian: false, allergens: ['fish'], prepTime: 35,
    instructions: [
      'חמם תנור ל-200 מעלות.',
      'חתוך בטטה לפרוסות דקות, ערבב עם שמן זית ומלח.',
      'אפה בטטה 20 דקות עד לריכוך.',
      'הנח פילה בקלה מעל, מרח ברוטב שום-לימון.',
      'אפה עוד 12-15 דקות.',
      'הגש עם לימון סחוט ופטרוזיליה.',
    ],
    ingredients: [
      { name: 'פילה בקלה', amount: '180 גרם' },
      { name: 'בטטה', amount: '1 בינונית' },
      { name: 'שמן זית', amount: '2 כפות' },
      { name: 'שום', amount: '2 שיניים' },
      { name: 'לימון', amount: '1 יחידה' },
      { name: 'פטרוזיליה', amount: 'מעט' },
      { name: 'מלח ופלפל', amount: 'לפי הטעם' },
    ],
  },
  {
    name: 'קציצות בקר עם ירקות',
    description: 'קציצות בקר רזות תבלוניות עם ירקות מוקפצים — ארוחת ערב ספורטיבית עשירה בחלבון',
    mealType: 'dinner', calories: 520, protein: 38, carbs: 28, fat: 24,
    isVegetarian: false, allergens: ['eggs'], prepTime: 30,
    instructions: [
      'ערבב טחון בקר עם ביצה, בצל מגורר, שום, פטרוזיליה ותבלינים.',
      'צור קציצות בגודל אחיד.',
      'טגן קציצות בשמן על אש בינונית-גבוהה 4-5 דקות מכל צד.',
      'הוציא, ובאותה מחבת הוסף שמן ומוקפץ ירקות.',
      'הגש קציצות מעל הירקות.',
    ],
    ingredients: [
      { name: 'טחון בקר רזה', amount: '150 גרם' },
      { name: 'ביצה', amount: '1 יחידה' },
      { name: 'בצל', amount: '½ יחידה' },
      { name: 'שום', amount: '2 שיניים' },
      { name: 'פטרוזיליה', amount: 'חופן' },
      { name: 'פלפלים מעורבים', amount: '1 כוס' },
      { name: 'קישוא', amount: '1 יחידה' },
      { name: 'שמן, מלח, פלפל, כמון', amount: 'לפי הטעם' },
    ],
  },
  {
    name: 'עוף צלוי בעשבי תיבול',
    description: 'ירך עוף צלויה עם שלל עשבי תיבול טריים — ארוחת ערב מפנקת ועשירה בטעמים עם מינימום פחמימות',
    mealType: 'dinner', calories: 450, protein: 45, carbs: 6, fat: 22,
    isVegetarian: false, allergens: [], prepTime: 45,
    instructions: [
      'חמם תנור ל-200 מעלות.',
      'ערבב שמן זית, שום, רוזמרין, טימין, מלח ופלפל.',
      'מרח את העוף היטב בתערובת.',
      'הנח בתבנית ואפה 35-40 דקות עד לגוון זהוב.',
      'הנח לנוח 5 דקות לפני ההגשה.',
    ],
    ingredients: [
      { name: 'ירך עוף ללא עור', amount: '200 גרם' },
      { name: 'שמן זית', amount: '2 כפות' },
      { name: 'שום', amount: '4 שיניים' },
      { name: 'רוזמרין טרי', amount: '2 ענפים' },
      { name: 'טימין טרי', amount: '1 ענף' },
      { name: 'לימון', amount: '½ יחידה' },
      { name: 'מלח גס ופלפל שחור', amount: 'לפי הטעם' },
    ],
  },
  {
    name: 'מוקפץ טופו עם ירקות אסיאתיים',
    description: 'טופו פריך מוקפץ עם פטריות, ברוקולי ומנגטו ברוטב טריאקי — ארוחת ערב צמחונית מלאת אומאמי',
    mealType: 'dinner', calories: 380, protein: 24, carbs: 34, fat: 18,
    isVegetarian: true, allergens: ['soy'], prepTime: 20,
    instructions: [
      'לחץ ויבש טופו, חתוך לקוביות.',
      'טגן טופו בשמן שומשום על אש גבוהה עד להשחמה.',
      'הוסף שום וג\'ינג\'ר טרי ותטגן 30 שניות.',
      'הוסף ברוקולי, פטריות ומנגטו.',
      'הוסף רוטב טריאקי וסויה, ערבב ובשל 3 דקות.',
      'הגש מעל אורז יסמין עם שומשום מפוזר.',
    ],
    ingredients: [
      { name: 'טופו קשה', amount: '150 גרם' },
      { name: 'ברוקולי', amount: '1 כוס פרחים' },
      { name: 'פטריות שיטאקי', amount: '80 גרם' },
      { name: 'מנגטו', amount: '½ כוס' },
      { name: 'שמן שומשום', amount: '1 כף' },
      { name: 'שום', amount: '2 שיניים' },
      { name: 'ג\'ינג\'ר טרי', amount: '1 ס"מ' },
      { name: 'רוטב טריאקי', amount: '2 כפות' },
      { name: 'רוטב סויה', amount: '1 כף' },
      { name: 'שומשום לבן', amount: '1 כף' },
    ],
  },
  {
    name: 'שניצל עוף ביתי עם אורז',
    description: 'שניצל עוף פריך בציפוי לחמניות ביתי לצד אורז לבן מאודה — ארוחת ערב מנחמת ועשירה בחלבון',
    mealType: 'dinner', calories: 560, protein: 44, carbs: 52, fat: 18,
    isVegetarian: false, allergens: ['eggs', 'gluten'], prepTime: 30,
    instructions: [
      'דקק חזה עוף לעובי אחיד.',
      'עבור את העוף בקמח, ביצה טרופה ולחמניות.',
      'חמם שמן בכמות בינונית על אש בינונית-גבוהה.',
      'טגן 4-5 דקות מכל צד עד לצבע זהוב עמוק.',
      'הנח על נייר ספיגה להסרת עודפי שמן.',
      'הגש עם אורז מאודה ולימון.',
    ],
    ingredients: [
      { name: 'חזה עוף', amount: '180 גרם' },
      { name: 'קמח לבן', amount: '3 כפות' },
      { name: 'ביצה', amount: '1 יחידה' },
      { name: 'לחמניות פירורי לחם', amount: '4 כפות' },
      { name: 'אורז לבן', amount: '½ כוס' },
      { name: 'שמן לטיגון', amount: 'לפי הצורך' },
      { name: 'לימון', amount: '½ יחידה' },
      { name: 'מלח ופלפל', amount: 'לפי הטעם' },
    ],
  },
  {
    name: 'דג ים תיכוני עם ירקות',
    description: 'פילה דג לבן (דניס או לברק) אפוי עם ירקות ים-תיכוניים ורוטב זיתים — ארוחת ערב קלילה ועשירה',
    mealType: 'dinner', calories: 400, protein: 36, carbs: 24, fat: 16,
    isVegetarian: false, allergens: ['fish'], prepTime: 30,
    instructions: [
      'חמם תנור ל-200 מעלות.',
      'חתוך עגבניות שרי, זיתים וצלפים.',
      'ערבב עם שמן זית, שום, לימון ואורגנו.',
      'הנח את הדג בתבנית, שפוך את תערובת הירקות מסביב.',
      'אפה 20-22 דקות עד שהדג מתפצל בקלות.',
      'הגש עם לחם לספיגת הרוטב.',
    ],
    ingredients: [
      { name: 'פילה דג לבן (דניס/לברק)', amount: '180 גרם' },
      { name: 'עגבניות שרי', amount: '10 יחידות' },
      { name: 'זיתים שחורים', amount: '10 יחידות' },
      { name: 'צלפים', amount: '1 כף' },
      { name: 'שמן זית', amount: '3 כפות' },
      { name: 'שום', amount: '3 שיניים' },
      { name: 'לימון', amount: '1 יחידה' },
      { name: 'אורגנו יבש', amount: '1 כפית' },
      { name: 'מלח ופלפל', amount: 'לפי הטעם' },
    ],
  },
];

async function run() {
  try {
    await sequelize.authenticate();
    console.log('DB connection established.');

    // Fetch all existing recipe names for duplicate check
    const existing = await Recipe.findAll({ attributes: ['name'] });
    const existingNames = new Set(existing.map((r) => r.name));
    console.log(`Found ${existingNames.size} existing recipe(s) in DB.`);

    let inserted = 0;
    let skipped = 0;

    for (const recipe of NEW_RECIPES) {
      if (existingNames.has(recipe.name)) {
        console.log(`  SKIP  : ${recipe.name}`);
        skipped++;
        continue;
      }

      const { ingredients, ...recipeData } = recipe;
      const created = await Recipe.create({
        ...recipeData,
        createDate: new Date(),
        updateDate: new Date(),
      });

      if (Array.isArray(ingredients) && ingredients.length) {
        await Ingredient.bulkCreate(
          ingredients.map((i) => ({ name: i.name, amount: i.amount, recipeId: created.recipeId }))
        );
      }

      console.log(`  INSERT: ${recipe.name}`);
      inserted++;
    }

    console.log(`\nDone. Inserted: ${inserted} | Skipped (already exists): ${skipped}`);
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

run();
