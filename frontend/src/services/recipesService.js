import api from './api';

// Fetch all recipes from the server, with optional mealType and isVegetarian filters
export async function getRecipes(filters = {}) {
  const params = new URLSearchParams();
  if (filters.mealType) params.append('mealType', filters.mealType);
  if (filters.isVegetarian !== undefined) params.append('isVegetarian', filters.isVegetarian);
  const res = await api.get(`/api/recipes?${params.toString()}`);
  return res.data;
}

// Create a new recipe (admin / nutritionist only)
export async function createRecipe(data) {
  const res = await api.post('/api/recipes', data);
  return res.data;
}

// Update an existing recipe by ID (admin / nutritionist only)
export async function updateRecipe(id, data) {
  const res = await api.put(`/api/recipes/${id}`, data);
  return res.data;
}

// Delete a recipe by ID (admin / nutritionist only)
export async function deleteRecipe(id) {
  const res = await api.delete(`/api/recipes/${id}`);
  return res.data;
}

// Generate a matched daily menu from the backend given the user's nutrition profile
export async function generateMenu(profile) {
  const res = await api.post('/api/menu/generate', {
    targetCalories: profile.calories,
    goal:           profile.goal,
    vegetarianOnly: !!profile.vegetarianOnly,
    allergies:      profile.allergies || [],
  });
  return res.data;
}
