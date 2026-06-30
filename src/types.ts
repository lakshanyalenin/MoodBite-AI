export interface Meal {
  id: string;
  name: string;
  imageUrl: string;
  cookingTime: number; // in minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedCost: number; // in USD or INR
  calories: number;
  protein: number; // in g
  carbs: number; // in g
  fat: number; // in g
  fiber: number; // in g
  reason: string;
  ingredients: string[];
  steps: string[];
  tips: string[];
  alternatives: Record<string, string>; // ingredient replacement map
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
}

export interface SavedRecipe {
  id: string;
  meal: Meal;
  savedAt: string;
  isFavorite: boolean;
  rating?: number; // 1-5 star rating
  cookCount?: number; // how many times cooked
}

export interface PantryItem {
  id: string;
  name: string;
  expiryDate: string;
  quantity: string;
  category: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  weight: number; // in kg
  height: number; // in cm
  healthGoal: string;
  diet: string;
  conditions: string[];
  allergies: string[];
}

export interface DailyLog {
  date: string;
  caloriesConsumed: number;
  caloriesTarget: number;
  proteinConsumed: number;
  proteinTarget: number;
  carbsConsumed: number;
  carbsTarget: number;
  fatConsumed: number;
  fatTarget: number;
  fiberConsumed: number;
  fiberTarget: number;
  waterIntake: number; // in ml
  waterTarget: number; // in ml
  streak: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  mealsSuggested?: Meal[];
}

export interface UserPreferences {
  budget: number; // Max budget per meal in INR/USD
  cookingTime: number; // Max cooking time in minutes
  cuisine: string;
  dietPreference: string;
  healthGoal: string;
  spiceLevel: 'Mild' | 'Medium' | 'Spicy' | 'Extra Hot';
  waterIntakeGoal: number; // ml
}

export interface PlanItem {
  name: string;
  calories: number;
  protein: number;
  ingredients?: string[];
  steps?: string[];
  cookingTime?: number;
  moodTag?: string;
  estimatedCost?: number;
}

export interface DayPlan {
  Breakfast: PlanItem;
  Lunch: PlanItem;
  Dinner: PlanItem;
  Snacks: PlanItem;
}

export interface WeeklyPlanResponse {
  weeklyCalories: number;
  weeklyBudget: number;
  nutritionSummary: { protein: number; carbs: number; fat: number };
  shoppingList: string[];
  checkedShoppingItems?: string[]; // checked items in shopping list
  plan: Record<string, DayPlan>;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

