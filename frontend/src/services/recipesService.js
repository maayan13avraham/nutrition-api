import api from './api';

// Fetch all recipes from the server, with optional mealType and isVegetarian filters
export async function getRecipes(filters = {}) {
  const params = new URLSearchParams();
  if (filters.mealType) params.append('mealType', filters.mealType);
  if (filters.isVegetarian !== undefined) params.append('isVegetarian', filters.isVegetarian);
  const res = await api.get(`/api/recipes?${params.toString()}`);
  return res.data;
}
