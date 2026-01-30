
export interface Ingredient {
  item: string;
  amount: string;
}

export interface Recipe {
  id: string;
  recipeName: string;
  description: string;
  prepTime: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: Ingredient[];
  steps: string[];
  servings: number;
  tags: string[];
  imageUrl?: string;
}

export interface RecipeResponse {
  recipes: Recipe[];
}
