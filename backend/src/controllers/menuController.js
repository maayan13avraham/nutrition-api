const { Recipe } = require('../../models');

const VALID_GOALS = ['loss', 'gain', 'health'];
const TOLERANCE = 100;

function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data, error: null });
}

function fail(res, code, message, details = {}, status = 400) {
  return res.status(status).json({ success: false, data: null, error: { code, message, details } });
}

function filterAllergens(recipes, allergies) {
  if (!allergies.length) return recipes;
  return recipes.filter((r) => !allergies.some((a) => (r.allergens || []).includes(a)));
}

function scaleRecipe(recipe, factor) {
  return {
    ...recipe,
    calories: Math.round(recipe.calories * factor),
    protein:  Math.round(recipe.protein  * factor * 10) / 10,
    carbs:    Math.round(recipe.carbs    * factor * 10) / 10,
    fat:      Math.round(recipe.fat      * factor * 10) / 10,
  };
}

async function generateMenu(req, res) {
  try {
    const { targetCalories, goal, vegetarianOnly, allergies: rawAllergies } = req.body;
    const allergies = Array.isArray(rawAllergies) ? rawAllergies : [];

    if (!targetCalories || typeof targetCalories !== 'number' || targetCalories <= 0)
      return fail(res, 'VALIDATION_ERROR', 'targetCalories must be a positive number', { field: 'targetCalories' });
    if (!goal || !VALID_GOALS.includes(goal))
      return fail(res, 'VALIDATION_ERROR', `goal must be one of: ${VALID_GOALS.join(', ')}`, { field: 'goal' });

    const where = {};
    if (vegetarianOnly) where.isVegetarian = true;

    const [breakfastRows, lunchRows, dinnerRows] = await Promise.all([
      Recipe.findAll({ where: { ...where, mealType: 'breakfast' } }),
      Recipe.findAll({ where: { ...where, mealType: 'lunch' } }),
      Recipe.findAll({ where: { ...where, mealType: 'dinner' } }),
    ]);

    const toPlain = (rows) => rows.map((r) => r.get({ plain: true }));
    const bList = filterAllergens(toPlain(breakfastRows), allergies);
    const lList = filterAllergens(toPlain(lunchRows), allergies);
    const dList = filterAllergens(toPlain(dinnerRows), allergies);

    if (goal === 'gain') {
      const byProtein = (a, b) => b.protein - a.protein;
      bList.sort(byProtein);
      lList.sort(byProtein);
      dList.sort(byProtein);
    }

    let best = null;
    let bestDiff = Infinity;

    outer:
    for (const b of bList) {
      for (const l of lList) {
        if (b.calories + l.calories > targetCalories + TOLERANCE) continue;
        for (const d of dList) {
          const total = b.calories + l.calories + d.calories;
          const diff = Math.abs(total - targetCalories);
          if (diff <= TOLERANCE && diff < bestDiff) {
            bestDiff = diff;
            best = { breakfast: b, lunch: l, dinner: d, totalCalories: total };
            if (goal === 'gain') break outer;
          }
        }
      }
    }

    if (!best) {
      if (!bList.length || !lList.length || !dList.length) {
        return fail(res, 'NO_MATCH', 'No recipes available for one or more meal types with current filters', {}, 404);
      }

      const topB = [...bList].sort((a, b) => b.calories - a.calories)[0];
      const topL = [...lList].sort((a, b) => b.calories - a.calories)[0];
      const topD = [...dList].sort((a, b) => b.calories - a.calories)[0];

      const rawTotal = topB.calories + topL.calories + topD.calories;
      const scale    = targetCalories / rawTotal;

      return ok(res, {
        breakfast:     scaleRecipe(topB, scale),
        lunch:         scaleRecipe(topL, scale),
        dinner:        scaleRecipe(topD, scale),
        totalCalories: targetCalories,
        scaled:        true,
        scaleFactor:   scale,
      });
    }

    return ok(res, best);
  } catch (err) {
    fail(res, 'INTERNAL_ERROR', err.message, {}, 500);
  }
}

module.exports = { generateMenu };
