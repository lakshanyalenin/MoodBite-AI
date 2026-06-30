import { PantryItem, FamilyMember, Meal, SavedRecipe, UserPreferences, DailyLog } from "./types";

export const INITIAL_PREFERENCES: UserPreferences = {
  budget: 500,
  cookingTime: 30,
  cuisine: "Indian",
  dietPreference: "None",
  healthGoal: "Balanced Wellness",
  spiceLevel: "Medium",
  waterIntakeGoal: 2500, // 2.5L
};

export const INITIAL_PANTRY: PantryItem[] = [
  { id: "p1", name: "Fresh Spinach", expiryDate: "2026-07-02", quantity: "200g", category: "Vegetables" },
  { id: "p2", name: "Red Lentils", expiryDate: "2027-01-15", quantity: "1kg", category: "Grains & Pulses" },
  { id: "p3", name: "Skimmed Milk", expiryDate: "2026-07-01", quantity: "1 Liter", category: "Dairy" },
  { id: "p4", name: "Avocados", expiryDate: "2026-07-03", quantity: "3 pcs", category: "Fruits" },
  { id: "p5", name: "Paneer / Organic Tofu", expiryDate: "2026-07-04", quantity: "400g", category: "Dairy & Alternatives" },
];

export const INITIAL_FAMILY: FamilyMember[] = [
  {
    id: "f1",
    name: "John (Self)",
    age: 24,
    gender: "Male",
    weight: 72,
    height: 178,
    healthGoal: "Muscle Gain",
    diet: "High Protein",
    conditions: [],
    allergies: ["Peanuts"]
  },
  {
    id: "f2",
    name: "Emma (Sister)",
    age: 22,
    gender: "Female",
    weight: 58,
    height: 165,
    healthGoal: "Weight Management & Detox",
    diet: "Vegetarian",
    conditions: ["Acidity"],
    allergies: ["Gluten"]
  }
];

export const SAMPLE_MEAL_PHOTOS = [
  {
    name: "Avocado Fried Egg Toast",
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600",
    description: "Creamy smashed avocado, multi-grain sourdough, soft-fried organic egg with a sprinkle of chili flakes."
  },
  {
    name: "Grilled Chicken Quinoa Bowl",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600",
    description: "Herb-marinated grilled chicken breast slices, fluffy red quinoa, roasted cherry tomatoes, and warm broccoli."
  },
  {
    name: "Berry Protein Pancakes",
    imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=600",
    description: "Fluffy whole-grain pancakes loaded with fresh blueberries, raspberry sauce, and greek yogurt swirl."
  }
];

export const ACHIEVEMENTS = [
  { id: "a1", name: "Hydration Hero", description: "Met 100% of water goal for 3 days in a row", icon: "Droplet", achieved: true },
  { id: "a2", name: "Macro Master", description: "Balanced proteins, carbs, and fats perfectly", icon: "Sliders", achieved: true },
  { id: "a3", name: "Fridge Scanner", description: "Scanned an ingredient using AI Vision", icon: "Camera", achieved: true },
  { id: "a4", name: "Streak Starter", description: "Logged healthy meals for 5 consecutive days", icon: "Flame", achieved: false },
];

export const INITIAL_SAVED: SavedRecipe[] = [
  {
    id: "s1",
    savedAt: "2026-06-28",
    isFavorite: true,
    meal: {
      id: "m1",
      name: "Golden Turmeric Lentil Soup",
      imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800",
      cookingTime: 25,
      difficulty: "Easy",
      estimatedCost: 250,
      calories: 320,
      protein: 18,
      carbs: 45,
      fat: 6,
      fiber: 12,
      reason: "Warm comforting spices like turmeric and protein-rich lentils will soothe your nerves and boost immunity.",
      ingredients: [
        "1 cup Red Lentils (washed)",
        "1 tsp Turmeric Powder",
        "1 Onion (chopped)",
        "2 cloves Garlic (minced)",
        "1 tbsp Ginger (grated)",
        "4 cups Vegetable Broth",
        "1 tbsp Olive Oil"
      ],
      steps: [
        "Sauté onions, garlic, and ginger in olive oil.",
        "Stir in turmeric and lentils, then add vegetable broth.",
        "Simmer for 15-20 minutes until tender."
      ],
      tips: ["Serve with fresh lemon juice squeeze."],
      alternatives: { "Red Lentils": "Chickpeas" },
      category: "Lunch"
    }
  }
];

export const INITIAL_LOG: DailyLog = {
  date: "2026-06-29",
  caloriesConsumed: 1150,
  caloriesTarget: 2000,
  proteinConsumed: 54,
  proteinTarget: 80,
  carbsConsumed: 140,
  carbsTarget: 220,
  fatConsumed: 40,
  fatTarget: 65,
  fiberConsumed: 18,
  fiberTarget: 30,
  waterIntake: 1200,
  waterTarget: 2500,
  streak: 5,
};

export const MOCK_CHARTS_DATA = {
  weekly: [
    { name: "Mon", calories: 1850, water: 2200 },
    { name: "Tue", calories: 1980, water: 2600 },
    { name: "Wed", calories: 1720, water: 2000 },
    { name: "Thu", calories: 2050, water: 2500 },
    { name: "Fri", calories: 1800, water: 2400 },
    { name: "Sat", calories: 2100, water: 2800 },
    { name: "Sun", calories: 1950, water: 2500 },
  ],
  monthly: [
    { name: "Week 1", calories: 1890, water: 2300 },
    { name: "Week 2", calories: 1940, water: 2450 },
    { name: "Week 3", calories: 1820, water: 2200 },
    { name: "Week 4", calories: 1990, water: 2600 },
  ]
};
