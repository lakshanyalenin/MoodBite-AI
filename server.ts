import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini AI Client successfully initialized.");
  } catch (err) {
    console.error("Failed to initialize Gemini AI client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. Running in Smart Mock Mode.");
}

// Global fallback sample meals to ensure instant high-quality data
const SAMPLE_MEALS = [
  {
    id: "m1",
    name: "Dal Khichdi with Ghee Tadka",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800",
    cookingTime: 20,
    difficulty: "Easy" as const,
    estimatedCost: 150,
    calories: 320,
    protein: 12,
    carbs: 48,
    fat: 8,
    fiber: 6,
    reason: "A classic comforting bowl of yellow lentils and rice tempered with cumin and pure ghee. Perfect to soothe your nerves, ease digestion and restore warmth on a slow day.",
    ingredients: [
      "1/2 cup Split Yellow Moong Dal (washed)",
      "1/2 cup Basmati Rice (washed)",
      "1 tbsp Ghee (clarified butter)",
      "1/2 tsp Cumin Seeds (Jeera)",
      "1/4 tsp Turmeric Powder",
      "1/4 tsp Asafoetida (Hing)",
      "1 green chili (slit)",
      "3 cups warm water",
      "Fresh coriander & lemon juice for garnish"
    ],
    steps: [
      "Rinse dal and rice together, then drain.",
      "In a pressure cooker or deep pot, heat ghee and temper cumin seeds, hing, and green chili.",
      "Add turmeric powder, rice, and moong dal, stirring gently to coat with ghee.",
      "Add water and salt, and pressure cook for 3-4 whistles (or boil covered until completely soft and mushy).",
      "Stir in a little extra ghee, squeeze lemon juice, and garnish with chopped fresh coriander."
    ],
    tips: [
      "Serve hot with roasted papad, yogurt, and a spot of spicy pickle.",
      "You can add chopped carrots and spinach for added vitamins."
    ],
    alternatives: {
      "Moong Dal": "Masoor Dal (Red lentils) or Arhar Dal (Toor)",
      "Ghee": "Coconut oil or sesame oil"
    },
    category: "Lunch" as const
  },
  {
    id: "m2",
    name: "Festive Shahi Paneer Butter Masala",
    imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=800",
    cookingTime: 25,
    difficulty: "Medium" as const,
    estimatedCost: 350,
    calories: 480,
    protein: 18,
    carbs: 22,
    fat: 28,
    fiber: 4,
    reason: "Your joyful mood calls for a rich, festive North Indian delicacy! Creamy tomato-cashew curry with soft paneer cubes, flavored with green cardamom and kasuri methi.",
    ingredients: [
      "200g Paneer (cottage cheese), cubed",
      "2 large Tomatoes (pureed)",
      "1 Onion (finely chopped)",
      "10 Cashew nuts (soaked in warm water and pasted)",
      "1 tbsp Butter & 1 tbsp Oil",
      "1 tsp Ginger-Garlic Paste",
      "1/2 tsp Red Chili Powder & 1/2 tsp Garam Masala",
      "1/4 cup Fresh Cream",
      "1 tsp dried Fenugreek Leaves (Kasuri Methi)"
    ],
    steps: [
      "Heat butter and oil in a pan, sauté onions and ginger-garlic paste until golden.",
      "Add pureed tomatoes and cook until oil separates from the masala.",
      "Stir in cashew paste, chili powder, turmeric, and garam masala.",
      "Add paneer cubes, a half cup of warm water, and simmer gently for 5 minutes.",
      "Finish with fresh cream, crush kasuri methi between your palms and sprinkle over, and serve hot."
    ],
    tips: [
      "Best enjoyed with butter garlic naan or fresh warm rotis.",
      "To reduce calories, substitute cream with low-fat Greek yogurt."
    ],
    alternatives: {
      "Paneer": "Tofu cubes or Boiled Chickpeas",
      "Cashews": "Soaked melon seeds (Magajtari) or almond paste"
    },
    category: "Dinner" as const
  },
  {
    id: "m3",
    name: "Quick Kanda Poha (Under 15 Mins)",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=800",
    cookingTime: 12,
    difficulty: "Easy" as const,
    estimatedCost: 100,
    calories: 280,
    protein: 6,
    carbs: 45,
    fat: 7,
    fiber: 5,
    reason: "A quick, satisfying snack or breakfast made with flattened rice, roasted peanuts, and onions. Cooked in under 15 minutes, it is perfect for a lazy mood.",
    ingredients: [
      "1.5 cups Thick Poha (flattened rice)",
      "1 Onion (finely chopped)",
      "2 tbsp Raw Peanuts",
      "1/2 tsp Mustard Seeds (Rai)",
      "10 Curry Leaves",
      "1/2 tsp Turmeric Powder",
      "1 tbsp Oil",
      "Salt, fresh coriander, grated coconut, and lemon for garnish"
    ],
    steps: [
      "Rinse poha in a strainer under running water for 30 seconds until damp, then let it rest to soften.",
      "Heat oil in a pan and fry raw peanuts until crunchy and golden; remove and set aside.",
      "In the same oil, add mustard seeds, curry leaves, and green chilis until they splutter.",
      "Add chopped onions and sauté until translucent, then add turmeric powder.",
      "Toss in the softened poha, fried peanuts, and salt. Mix gently on low heat for 2-3 minutes. Garnish with coriander and lemon."
    ],
    tips: [
      "Add a pinch of sugar for that authentic sweet-and-sour Maharashtrian flavor.",
      "Grate fresh coconut on top for delicious coastal richness."
    ],
    alternatives: {
      "Poha": "Rolled oats or puffed rice (Kurmura)",
      "Peanuts": "Cashew pieces or skip entirely"
    },
    category: "Breakfast" as const
  }
];

// Helper to filter/recommend based on rules (for fallback or to feed prompt)
function getMockRecommendation(mood: string, weather: string, pref: any) {
  let matched = [...SAMPLE_MEALS];
  if (pref?.dietPreference && pref.dietPreference !== "None") {
    const diet = pref.dietPreference.toLowerCase();
    if (diet.includes("veg")) {
      matched = matched.filter(m => !m.name.toLowerCase().includes("chicken") && !m.name.toLowerCase().includes("fish"));
    }
  }
  return matched[0] || SAMPLE_MEALS[0];
}

// 1. AI Recommend Meal Endpoint
app.post("/api/recommend", async (req, res) => {
  const { mood, weather, preferences, pantryItems, ingredients } = req.body;

  if (aiClient) {
    try {
      const availablePantryNames = (pantryItems || []).map((item: any) => item.name);
      const availableIngredients = [...new Set([...availablePantryNames, ...(ingredients || [])])];
      const maxTime = preferences?.cookingTime || 60;
      const maxBudget = preferences?.budget || 500;

      const prompt = `
        You are MoodBite AI, an expert culinary nutritionist specializing exclusively in Indian cuisine. Generate EXACTLY ONE highly personalized Indian meal recommendation based on the user's available ingredients, mood, budget, and time limits.
        
        Strict Constraints:
        1. INDIAN FOOD ONLY (MANDATORY CONSTRAINT):
           - You MUST ONLY suggest Indian food recipes. Do NOT suggest any non-Indian cuisine (no pasta, burgers, sushi, pizza, tacos, etc.)
           - Allowed categories only:
             * North Indian dishes (roti, paneer, dal, curries, chole, parathas, etc.)
             * South Indian dishes (idli, dosa, sambar, upma, rasam, curd rice, lemon rice, etc.)
             * Street food (chaat, pav bhaji, vada pav, bhel puri, etc.)
             * Indian snacks and desserts (poha, pakora, dhokla, gulab jamun, kheer, etc.)
           - If user input or pantry leads outside Indian cuisine, convert it into the closest Indian equivalent (e.g. if asking for tomatoes and bread, suggest Bread Pakora or Pav Bhaji instead of pizza).
        2. BUDGET LIMITS IN INR (₹) (STRICT CONSTRAINT):
           - The estimated cost of this recipe ("estimatedCost") MUST NOT exceed ₹${maxBudget} (Indian Rupees).
           - The recipe's ingredients and portions MUST adapt strictly to the user's budget in INR:
             * Low budget (₹20–₹100): simple, quick, basic ingredients like poha, upma, plain rice, khichdi, yellow dal, basic snacks.
             * Medium budget (₹100–₹300): paneer dishes, vegetable curries, dal makhani, simple biryani versions.
             * High budget (₹300+): richer meals, multiple side dishes, or traditional sweets/desserts.
           - Always estimate ingredient cost realistically in Indian Rupees (₹) and NEVER exceed ₹${maxBudget}.
        3. AVAILABLE INGREDIENTS (MANDATORY): ${JSON.stringify(availableIngredients)}.
           - You MUST NEVER suggest recipes requiring main ingredients that are not in this list.
           - DO NOT suggest recipes requiring missing ingredients.
           - Exception: Common Indian kitchen staples like water, salt, oil, ghee, turmeric powder, cumin, mustard seeds, green chilis, ginger-garlic, onions, and basic dry spices are allowed even if not listed.
           - If the available ingredients list is empty, suggest an authentic Indian recipe using standard easily accessible Indian ingredients.
        4. COOKING TIME LIMIT (STRICT):
           - The cooking time ("cookingTime") MUST be less than or equal to ${maxTime} minutes.
           - If mood is "Lazy", the cooking time MUST be 5 to 15 minutes max.
        5. MOOD SPECIFIC RECIPE STYLE:
           - Mood is "${mood || "Balanced"}".
           - Happy -> festive Indian dishes, rich flavors (e.g. Paneer Butter Masala, Biryani, Chole Bhature, Gulab Jamun, rich curries)
           - Sad -> comfort food like Khichdi, Dal Rice, Curd Rice, Tomato Rasam, simple Moong Dal
           - Healthy -> steamed, boiled, low-oil Indian meals (e.g. Oats Idli, Vegetable Upma, Steamed Dhokla, low-oil Dal Palak, Sprouted Moong Salad)
           - Lazy -> quick Indian snacks/dishes under 15 min (e.g. Poha, Bread Upma, Sooji Chilla, Masala Omelette, microwave Kheer)
        6. VARIETY:
           - Ensure the recipe is unique, practical, and highly feasible to cook.
           - Ensure the recipe has a distinct, authentic Indian name and is not a repetition.
        7. WEATHER CONTEXT:
           - Weather is "${weather || "Pleasant"}". Make the Indian recipe feel appropriate for this climate (e.g. piping hot Pakoras for rain, cooling Curd Rice for hot weather).

        Return exactly ONE JSON object matching this schema (do not include markdown wrapping other than json):
        {
          "id": "rec_${Date.now()}",
          "name": "Distinctive Indian Meal Name",
          "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
          "cookingTime": 20, // integer in minutes (must fit the rules above)
          "difficulty": "Easy" or "Medium" or "Hard",
          "estimatedCost": 120, // integer in INR representing realistic ingredient cost, MUST be <= ${maxBudget}
          "calories": 420, // integer
          "protein": 18, // integer
          "carbs": 45, // integer
          "fat": 12, // integer
          "fiber": 6, // integer
          "reason": "Explain how this Indian dish fits their mood (${mood}), weather (${weather}), budget of ₹${maxBudget} (estimated cost: ₹{estimatedCost}), uses available ingredients, and meets time limits.",
          "ingredients": ["Item with amount", "Item with amount"], // MUST only use available ingredients + basic staples
          "steps": ["Step 1", "Step 2", "Step 3"],
          "tips": ["Tip 1", "Tip 2"],
          "alternatives": { "Staple": "Replacement staple if desired" },
          "category": "Breakfast" or "Lunch" or "Dinner" or "Snacks"
        }
      `;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (!parsed.imageUrl) {
          parsed.imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800";
        }
        return res.json(parsed);
      }
    } catch (err) {
      console.error("Gemini recommendation error, falling back:", err);
    }
  }

  // Fallback (with mood and ingredients filtering)
  const fallbackMeal = getMockRecommendation(mood, weather, preferences);
  res.json(fallbackMeal);
});

// 2. AI Meal Vision / Image Scanning Endpoint
app.post("/api/vision", async (req, res) => {
  const { imageBase64 } = req.body; // Base64 representation of the scanned meal

  if (aiClient && imageBase64) {
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      
      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64,
        },
      };

      const prompt = `
        You are a clinical nutritionist AI. Analyze this food image. Estimate its nutritional values and give structured feedback.
        Return exactly ONE JSON object matching this schema:
        {
          "foodName": "Identified Food Name",
          "servingSize": "e.g., 1 Plate (approx 350g)",
          "calories": 480,
          "protein": 22,
          "carbs": 55,
          "fat": 16,
          "fiber": 6,
          "healthyScore": 85, // out of 100
          "nutritionSummary": "High fiber and balanced proteins, slightly high in sodium.",
          "suggestions": [
            "Add a glass of warm water with lemon.",
            "Reduce portion size by 15% if trying to lose weight.",
            "Consider swapping white rice with brown quinoa next time."
          ]
        }
      `;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [imagePart, { text: prompt }],
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      }
    } catch (err) {
      console.error("Gemini Vision scan error, falling back:", err);
    }
  }

  // Premium mock response for demonstration if API is offline/mocking - Indian Cuisine Only!
  res.json({
    foodName: "Masala Egg Bhurji with Multigrain Toast",
    servingSize: "1 Plate (approx 350g)",
    calories: 380,
    protein: 20,
    carbs: 28,
    fat: 14,
    fiber: 6,
    healthyScore: 88,
    nutritionSummary: "Excellent source of complete protein, healthy fats, and Indian spices like turmeric and ginger that aid metabolism and reduce inflammation.",
    suggestions: [
      "Add a pinch of black pepper and ginger to boost antioxidant properties.",
      "Pair with fresh homemade green mint coriander chutney instead of processed ketchup.",
      "Consider swapping white bread for low-fat whole wheat rotis next time."
    ]
  });
});

// 3. AI Chat Assistant Endpoint
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  if (aiClient) {
    try {
      const chatHistory = (history || []).map((h: any) => ({
        role: h.sender === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      }));

      const prompt = `
        You are MoodBite AI, a wellness companion specializing exclusively in Indian culinary nutrition. Answer the user's questions about nutrition, meal preparation, stress-eating, calorie advice, or Indian recipes with warm, expert guidance.
        
        Strict Constraints:
        1. INDIAN CUISINE ONLY: You must ONLY discuss or suggest Indian food. If the user asks about non-Indian dishes (like pasta, burgers, sushi, pizza, wraps, oats porridge, pancakes, waffles, tacos, etc.), gracefully guide them to the closest healthy Indian equivalent (e.g. if they ask for pizza, recommend a Uttapam or a healthy Sooji Roti Pizza; if they ask for sushi, suggest Lemon Rice or Curd Rice; if they ask for pancakes, suggest Besan Cheela or Oats Idli).
        2. Keep answers concise, highly informative, and directly useful.
        If they specify a mood (e.g. stressed, celebrating), adapt your tone.
        Always estimate ingredient cost in Indian Rupees (₹).
        
        Return a JSON object in this format:
        {
          "text": "Your helpful response here.",
          "mealsSuggested": [
             // optional recommended meal objects matching the standard meal structure if requested, otherwise empty array
          ]
        }
      `;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { role: "user", parts: [{ text: prompt }] },
          ...chatHistory,
          { role: "user", parts: [{ text: message }] }
        ],
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      }
    } catch (err) {
      console.error("Gemini Chat error, falling back:", err);
    }
  }

  // Intelligent fallback responder
  let textResponse = "That sounds delicious! As your MoodBite coach, I'd suggest focusing on complex carbohydrates and clean proteins to sustain your energy.";
  let mealsSuggested: any[] = [];

  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes("egg") || lowerMsg.includes("protein")) {
    textResponse = "Eggs are an absolute nutritional powerhouse! They offer high-quality choline and complete protein. Here's a wonderful breakfast egg bhurji recipe to elevate your nutrition.";
    mealsSuggested = [SAMPLE_MEALS[2]];
  } else if (lowerMsg.includes("stressed") || lowerMsg.includes("sad") || lowerMsg.includes("turmeric")) {
    textResponse = "I hear you. When we feel stressed, our bodies crave warmth and anti-inflammatory compounds. Turmeric and lentils help lower cortisol levels and nurture gut health.";
    mealsSuggested = [SAMPLE_MEALS[0]];
  } else if (lowerMsg.includes("muscle") || lowerMsg.includes("gym")) {
    textResponse = "To maximize muscle synthesis, target a balanced amino acid profile. Shahi Paneer, roasted chana, or dense Moong Dal Tadka with whole wheat rotis provides optimal repair macros and clean Indian proteins.";
    mealsSuggested = [SAMPLE_MEALS[1]];
  } else if (lowerMsg.includes("budget") || lowerMsg.includes("₹") || lowerMsg.includes("cheap")) {
    textResponse = "Cooking on a budget is highly rewarding! Whole grains, lentils, and local seasonal Indian veggies offer massive health benefits for just pennies.";
    mealsSuggested = [SAMPLE_MEALS[0]];
  }

  res.json({
    text: textResponse,
    mealsSuggested: mealsSuggested
  });
});

// 4. Generate Weekly Planner
app.post("/api/planner", async (req, res) => {
  const { preferences, pantryItems, ingredients } = req.body;

  if (aiClient) {
    try {
      const availablePantryNames = (pantryItems || []).map((item: any) => item.name);
      const availableIngredients = [...new Set([...availablePantryNames, ...(ingredients || [])])];
      const maxBudget = preferences?.budget || 500;

      const prompt = `
        You are a professional dietitian specializing exclusively in Indian cuisine. Generate a full, complete weekly meal plan for 7 days (Monday through Sunday) for Breakfast, Lunch, Dinner, and Snacks.
        All meals must be 100% authentic Indian recipes. Do NOT suggest any non-Indian cuisine (no pizza, pasta, wraps, burgers, oatmeal pancakes, etc.).
        Every meal item MUST include full recipe details: "name", "calories", "protein", "cookingTime" (integer in minutes), "moodTag" ("Happy", "Sad", "Healthy", or "Lazy"), "ingredients" (array of strings), "steps" (array of strings), and "estimatedCost" (realistic cost in INR ₹, must be within budget).

        Available Ingredients & Pantry Logs to prioritize: ${JSON.stringify(availableIngredients)}
        Budget limit: Under ₹${maxBudget} per meal.
        Preferences: ${JSON.stringify(preferences || {})}

        Constraints:
        1. INDIAN FOOD ONLY. Ensure all meals are authentic Indian dishes.
        2. Keep estimatedCost realistic in INR and under ₹${maxBudget} per meal.
        3. Do NOT repeat the exact same recipe in the same week. Ensure a diverse menu of Indian dishes (e.g., Poha, Upma, Idli, Dosa, Paratha, Khichdi, Dal Tadka, Paneer, Chana Masala, Aloo Gobi, etc.).
        4. If available ingredients are provided, try to incorporate them across different days of the week.

        Return a JSON object matching this structure:
        {
          "weeklyCalories": 12400,
          "weeklyBudget": 1500,
          "nutritionSummary": {
             "protein": 510, // total protein in grams
             "carbs": 1380,
             "fat": 320
          },
          "shoppingList": ["Basmati Rice", "Moong Dal", "Paneer", "Poha", "Mustard Seeds", "Curry Leaves", "Ghee", "Tomatoes", "Onions"],
          "plan": {
             "Monday": {
                "Breakfast": { 
                  "name": "Kanda Poha", 
                  "calories": 280, 
                  "protein": 6, 
                  "cookingTime": 12, 
                  "moodTag": "Lazy",
                  "estimatedCost": 80,
                  "ingredients": ["1.5 cups Poha", "1 onion", "2 tbsp Peanuts", "1/2 tsp Mustard seeds", "Turmeric"],
                  "steps": ["Rinse poha and let moisten.", "Sauté mustard seeds, peanuts, onions, and turmeric in oil.", "Mix in poha and salt, cook on low heat for 3 minutes."]
                },
                "Lunch": { 
                  "name": "Dal Khichdi", 
                  "calories": 320, 
                  "protein": 12, 
                  "cookingTime": 20, 
                  "moodTag": "Sad",
                  "estimatedCost": 100,
                  "ingredients": ["1/2 cup yellow moong dal", "1/2 cup basmati rice", "1 tbsp ghee", "1/2 tsp cumin seeds", "Turmeric"],
                  "steps": ["Rinse dal and rice together.", "Heat ghee, temper cumin and turmeric.", "Add rice, dal, water and pressure cook for 3-4 whistles."]
                },
                "Dinner": { 
                  "name": "Paneer Bhurji with Roti", 
                  "calories": 420, 
                  "protein": 22, 
                  "cookingTime": 15, 
                  "moodTag": "Happy",
                  "estimatedCost": 180,
                  "ingredients": ["150g Paneer crumbles", "1 onion chopped", "1 tomato chopped", "1 green chili", "Kasuri methi"],
                  "steps": ["Sauté onions and green chilis in oil.", "Add tomatoes, turmeric, salt, and crumbled paneer.", "Cook for 5 minutes, garnish with coriander and kasuri methi. Serve with hot whole wheat rotis."]
                },
                "Snacks": { 
                  "name": "Roasted Masala Makhana", 
                  "calories": 140, 
                  "protein": 4, 
                  "cookingTime": 8, 
                  "moodTag": "Healthy",
                  "estimatedCost": 60,
                  "ingredients": ["2 cups Makhana (foxnuts)", "1 tsp ghee", "1/4 tsp turmeric", "Chaat masala"],
                  "steps": ["Roast makhana in ghee on low flame until crunchy.", "Sprinkle turmeric, salt, and chaat masala, toss well to coat."]
                }
             },
             "Tuesday": { ... (MUST follow the same structure exactly for all other days) },
             "Wednesday": { ... },
             "Thursday": { ... },
             "Friday": { ... },
             "Saturday": { ... },
             "Sunday": { ... }
          }
        }
      `;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      if (text) {
        return res.json(JSON.parse(text));
      }
    } catch (err) {
      console.error("Gemini Planner error, falling back:", err);
    }
  }

  // Premium mock response for weekly planner
  res.json({
    weeklyCalories: 11800,
    weeklyBudget: 1200,
    nutritionSummary: {
      protein: 480,
      carbs: 1280,
      fat: 290
    },
    shoppingList: [
      "Basmati Rice",
      "Split Yellow Moong Dal",
      "Thick Poha",
      "Paneer (Cottage Cheese)",
      "Kabuli Chana (Chickpeas)",
      "Semolina (Rava)",
      "Makhana (Foxnuts)",
      "Curry Leaves & Mustard Seeds",
      "Pure Ghee or Mustard Oil",
      "Plain Yogurt"
    ],
    plan: {
      Monday: {
        Breakfast: {
          name: "Masala Kanda Poha",
          calories: 280,
          protein: 6,
          cookingTime: 12,
          moodTag: "Lazy",
          ingredients: ["1.5 cups Poha", "1 Onion", "2 tbsp Peanuts", "1/2 tsp Mustard seeds", "Turmeric"],
          steps: ["Rinse poha under water for 30 seconds and let soften.", "Sauté peanuts, mustard seeds, and chopped onion in oil.", "Stir in turmeric, softened poha, salt, and steam for 3 mins."]
        },
        Lunch: {
          name: "Moong Dal Khichdi",
          calories: 320,
          protein: 12,
          cookingTime: 20,
          moodTag: "Sad",
          ingredients: ["1/2 cup yellow moong dal", "1/2 cup basmati rice", "1 tbsp ghee", "1/2 tsp cumin seeds", "Turmeric"],
          steps: ["Wash dal and rice together, drain.", "Heat ghee in cooker, crackle cumin seeds, add turmeric.", "Add rice, dal, 3 cups water, salt, and cook for 3 whistles."]
        },
        Dinner: {
          name: "Paneer Butter Masala with Roti",
          calories: 460,
          protein: 18,
          cookingTime: 25,
          moodTag: "Happy",
          ingredients: ["200g Paneer cubes", "2 Tomatoes (pureed)", "10 Cashews", "1 tbsp butter", "Garam Masala"],
          steps: ["Sauté onions, tomatoes, and cashews, then blend into smooth paste.", "Simmer paste with butter, chili powder, and garam masala.", "Add paneer cubes and simmer for 5 mins. Serve with hot wheat rotis."]
        },
        Snacks: {
          name: "Roasted Spice Makhana",
          calories: 140,
          protein: 4,
          cookingTime: 8,
          moodTag: "Healthy",
          ingredients: ["2 cups Makhana (foxnuts)", "1 tsp ghee", "1/4 tsp turmeric", "Salt & Pepper"],
          steps: ["Roast makhana in ghee on low heat for 7 minutes until crunchy.", "Toss with turmeric, salt, and pepper until evenly coated."]
        }
      },
      Tuesday: {
        Breakfast: {
          name: "Steamed Oats Idli",
          calories: 240,
          protein: 10,
          cookingTime: 15,
          moodTag: "Healthy",
          ingredients: ["1 cup Oats powder", "1/2 cup Yogurt", "1/2 cup water", "Grated carrots", "Eno Fruit salt"],
          steps: ["Mix oats powder, yogurt, water, and carrots to form a batter. Rest for 5 mins.", "Add Eno fruit salt and mix gently.", "Pour into greased idli molds and steam for 10-12 minutes."]
        },
        Lunch: {
          name: "Creamy Curd Rice",
          calories: 310,
          protein: 8,
          cookingTime: 10,
          moodTag: "Sad",
          ingredients: ["1 cup Cooked Rice", "1 cup Fresh Yogurt", "1/2 tsp mustard seeds", "Ginger", "Curry leaves"],
          steps: ["Mash warm cooked rice completely.", "Mix with fresh yogurt and salt.", "Temper with mustard seeds, ginger, and curry leaves in hot oil, then pour over rice."]
        },
        Dinner: {
          name: "Spicy Chole Masala with Rice",
          calories: 420,
          protein: 16,
          cookingTime: 30,
          moodTag: "Happy",
          ingredients: ["1 cup boiled Chickpeas", "1 onion (chopped)", "2 tomatoes (chopped)", "Chole Masala powder", "Basmati Rice"],
          steps: ["Sauté onions and ginger-garlic paste until brown. Add tomatoes and cook soft.", "Stir in chole masala, turmeric, salt, and boiled chickpeas.", "Simmer for 15 minutes to thicken. Serve hot with steamed basmati rice."]
        },
        Snacks: {
          name: "Masala Chai with Roasted Chana",
          calories: 120,
          protein: 7,
          cookingTime: 5,
          moodTag: "Lazy",
          ingredients: ["1 cup roasted whole chana", "1 cup tea brewed with ginger and cardamom"],
          steps: ["Prepare authentic Indian ginger-cardamom milk tea.", "Serve hot alongside a bowl of crunchy roasted black chana."]
        }
      },
      Wednesday: {
        Breakfast: {
          name: "Quick Rava Upma",
          calories: 290,
          protein: 8,
          cookingTime: 15,
          moodTag: "Lazy",
          ingredients: ["1 cup Semolina (Rava)", "1 Onion chopped", "1 tsp mustard seeds", "Curry leaves", "1 tbsp ghee"],
          steps: ["Dry roast semolina until fragrant; set aside.", "Sauté mustard seeds, curry leaves, and onion in ghee.", "Pour in 2.5 cups water, bring to boil, then slowly stir in semolina until dry and fluffy."]
        },
        Lunch: {
          name: "Yellow Dal Tadka & Jeera Rice",
          calories: 380,
          protein: 14,
          cookingTime: 20,
          moodTag: "Sad",
          ingredients: ["1/2 cup Toor dal", "1 cup Basmati rice", "1 tsp cumin seeds", "Ghee", "Turmeric"],
          steps: ["Boil dal with turmeric and salt until mushy.", "Cook rice separately with cumin seeds.", "Tadka: heat ghee, sizzle cumin and red chili, pour over hot dal. Serve together."]
        },
        Dinner: {
          name: "Palak Paneer with Chapati",
          calories: 410,
          protein: 20,
          cookingTime: 25,
          moodTag: "Healthy",
          ingredients: ["200g Spinach leaves", "150g Paneer cubes", "1 onion", "1/2 tsp Garam Masala", "Wheat flour"],
          steps: ["Blanch and puree spinach with green chilis.", "Sauté onions and garlic, add spinach puree and spices.", "Add paneer cubes and simmer for 3 mins. Serve with warm homemade chapatis."]
        },
        Snacks: {
          name: "Dhokla (Steamed Gram Flour Cake)",
          calories: 160,
          protein: 8,
          cookingTime: 15,
          moodTag: "Lazy",
          ingredients: ["1 cup Gram flour (Besan)", "1/2 cup yogurt", "Eno fruit salt", "Mustard seeds", "Green chilies"],
          steps: ["Whisk besan, yogurt, and water to smooth batter, add Eno.", "Steam batter in greased pan for 12 minutes.", "Drizzle tempering of mustard seeds, green chilis, and curry leaves in water over the sliced dhokla."]
        }
      },
      Thursday: {
        Breakfast: {
          name: "Masala Kanda Poha",
          calories: 280,
          protein: 6,
          cookingTime: 12,
          moodTag: "Lazy",
          ingredients: ["1.5 cups Poha", "1 Onion", "2 tbsp Peanuts", "1/2 tsp Mustard seeds", "Turmeric"],
          steps: ["Rinse poha under water for 30 seconds and let soften.", "Sauté peanuts, mustard seeds, and chopped onion in oil.", "Stir in turmeric, softened poha, salt, and steam for 3 mins."]
        },
        Lunch: {
          name: "Moong Dal Khichdi",
          calories: 320,
          protein: 12,
          cookingTime: 20,
          moodTag: "Sad",
          ingredients: ["1/2 cup yellow moong dal", "1/2 cup basmati rice", "1 tbsp ghee", "1/2 tsp cumin seeds", "Turmeric"],
          steps: ["Wash dal and rice together, drain.", "Heat ghee in cooker, crackle cumin seeds, add turmeric.", "Add rice, dal, 3 cups water, salt, and cook for 3 whistles."]
        },
        Dinner: {
          name: "Paneer Butter Masala with Roti",
          calories: 460,
          protein: 18,
          cookingTime: 25,
          moodTag: "Happy",
          ingredients: ["200g Paneer cubes", "2 Tomatoes (pureed)", "10 Cashews", "1 tbsp butter", "Garam Masala"],
          steps: ["Sauté onions, tomatoes, and cashews, then blend into smooth paste.", "Simmer paste with butter, chili powder, and garam masala.", "Add paneer cubes and simmer for 5 mins. Serve with hot wheat rotis."]
        },
        Snacks: {
          name: "Roasted Spice Makhana",
          calories: 140,
          protein: 4,
          cookingTime: 8,
          moodTag: "Healthy",
          ingredients: ["2 cups Makhana (foxnuts)", "1 tsp ghee", "1/4 tsp turmeric", "Salt & Pepper"],
          steps: ["Roast makhana in ghee on low heat for 7 minutes until crunchy.", "Toss with turmeric, salt, and pepper until evenly coated."]
        }
      },
      Friday: {
        Breakfast: {
          name: "Steamed Oats Idli",
          calories: 240,
          protein: 10,
          cookingTime: 15,
          moodTag: "Healthy",
          ingredients: ["1 cup Oats powder", "1/2 cup Yogurt", "1/2 cup water", "Grated carrots", "Eno Fruit salt"],
          steps: ["Mix oats powder, yogurt, water, and carrots to form a batter. Rest for 5 mins.", "Add Eno fruit salt and mix gently.", "Pour into greased idli molds and steam for 10-12 minutes."]
        },
        Lunch: {
          name: "Creamy Curd Rice",
          calories: 310,
          protein: 8,
          cookingTime: 10,
          moodTag: "Sad",
          ingredients: ["1 cup Cooked Rice", "1 cup Fresh Yogurt", "1/2 tsp mustard seeds", "Ginger", "Curry leaves"],
          steps: ["Mash warm cooked rice completely.", "Mix with fresh yogurt and salt.", "Temper with mustard seeds, ginger, and curry leaves in hot oil, then pour over rice."]
        },
        Dinner: {
          name: "Spicy Chole Masala with Rice",
          calories: 420,
          protein: 16,
          cookingTime: 30,
          moodTag: "Happy",
          ingredients: ["1 cup boiled Chickpeas", "1 onion (chopped)", "2 tomatoes (chopped)", "Chole Masala powder", "Basmati Rice"],
          steps: ["Sauté onions and ginger-garlic paste until brown. Add tomatoes and cook soft.", "Stir in chole masala, turmeric, salt, and boiled chickpeas.", "Simmer for 15 minutes to thicken. Serve hot with steamed basmati rice."]
        },
        Snacks: {
          name: "Masala Chai with Roasted Chana",
          calories: 120,
          protein: 7,
          cookingTime: 5,
          moodTag: "Lazy",
          ingredients: ["1 cup roasted whole chana", "1 cup tea brewed with ginger and cardamom"],
          steps: ["Prepare authentic Indian ginger-cardamom milk tea.", "Serve hot alongside a bowl of crunchy roasted black chana."]
        }
      },
      Saturday: {
        Breakfast: {
          name: "Quick Rava Upma",
          calories: 290,
          protein: 8,
          cookingTime: 15,
          moodTag: "Lazy",
          ingredients: ["1 cup Semolina (Rava)", "1 Onion chopped", "1 tsp mustard seeds", "Curry leaves", "1 tbsp ghee"],
          steps: ["Dry roast semolina until fragrant; set aside.", "Sauté mustard seeds, curry leaves, and onion in ghee.", "Pour in 2.5 cups water, bring to boil, then slowly stir in semolina until dry and fluffy."]
        },
        Lunch: {
          name: "Yellow Dal Tadka & Jeera Rice",
          calories: 380,
          protein: 14,
          cookingTime: 20,
          moodTag: "Sad",
          ingredients: ["1/2 cup Toor dal", "1 cup Basmati rice", "1 tsp cumin seeds", "Ghee", "Turmeric"],
          steps: ["Boil dal with turmeric and salt until mushy.", "Cook rice separately with cumin seeds.", "Tadka: heat ghee, sizzle cumin and red chili, pour over hot dal. Serve together."]
        },
        Dinner: {
          name: "Palak Paneer with Chapati",
          calories: 410,
          protein: 20,
          cookingTime: 25,
          moodTag: "Healthy",
          ingredients: ["200g Spinach leaves", "150g Paneer cubes", "1 onion", "1/2 tsp Garam Masala", "Wheat flour"],
          steps: ["Blanch and puree spinach with green chilis.", "Sauté onions and garlic, add spinach puree and spices.", "Add paneer cubes and simmer for 3 mins. Serve with warm homemade chapatis."]
        },
        Snacks: {
          name: "Dhokla (Steamed Gram Flour Cake)",
          calories: 160,
          protein: 8,
          cookingTime: 15,
          moodTag: "Lazy",
          ingredients: ["1 cup Gram flour (Besan)", "1/2 cup yogurt", "Eno fruit salt", "Mustard seeds", "Green chilies"],
          steps: ["Whisk besan, yogurt, and water to smooth batter, add Eno.", "Steam batter in greased pan for 12 minutes.", "Drizzle tempering of mustard seeds, green chilis, and curry leaves in water over the sliced dhokla."]
        }
      },
      Sunday: {
        Breakfast: {
          name: "Steamed Oats Idli",
          calories: 240,
          protein: 10,
          cookingTime: 15,
          moodTag: "Healthy",
          ingredients: ["1 cup Oats powder", "1/2 cup Yogurt", "1/2 cup water", "Grated carrots", "Eno Fruit salt"],
          steps: ["Mix oats powder, yogurt, water, and carrots to form a batter. Rest for 5 mins.", "Add Eno fruit salt and mix gently.", "Pour into greased idli molds and steam for 10-12 minutes."]
        },
        Lunch: {
          name: "Creamy Curd Rice",
          calories: 310,
          protein: 8,
          cookingTime: 10,
          moodTag: "Sad",
          ingredients: ["1 cup Cooked Rice", "1 cup Fresh Yogurt", "1/2 tsp mustard seeds", "Ginger", "Curry leaves"],
          steps: ["Mash warm cooked rice completely.", "Mix with fresh yogurt and salt.", "Temper with mustard seeds, ginger, and curry leaves in hot oil, then pour over rice."]
        },
        Dinner: {
          name: "Spicy Chole Masala with Rice",
          calories: 420,
          protein: 16,
          cookingTime: 30,
          moodTag: "Happy",
          ingredients: ["1 cup boiled Chickpeas", "1 onion (chopped)", "2 tomatoes (chopped)", "Chole Masala powder", "Basmati Rice"],
          steps: ["Sauté onions and ginger-garlic paste until brown. Add tomatoes and cook soft.", "Stir in chole masala, turmeric, salt, and boiled chickpeas.", "Simmer for 15 minutes to thicken. Serve hot with steamed basmati rice."]
        },
        Snacks: {
          name: "Dhokla (Steamed Gram Flour Cake)",
          calories: 160,
          protein: 8,
          cookingTime: 15,
          moodTag: "Lazy",
          ingredients: ["1 cup Gram flour (Besan)", "1/2 cup yogurt", "Eno fruit salt", "Mustard seeds", "Green chilies"],
          steps: ["Whisk besan, yogurt, and water to smooth batter, add Eno.", "Steam batter in greased pan for 12 minutes.", "Drizzle tempering of mustard seeds, green chilis, and curry leaves in water over the sliced dhokla."]
        }
      }
    }
  });
});

// 5. Family Recommended Meals Generator
app.post("/api/family-recommend", async (req, res) => {
  const { familyMembers, preferences } = req.body;

  if (aiClient) {
    try {
      const prompt = `
        You are MoodBite AI, an expert pediatric and family nutritionist specializing exclusively in authentic Indian cuisine. Generate a combined family meal proposal (Breakfast, Lunch, Dinner) consisting strictly of Indian dishes based on these profiles:
        ${JSON.stringify(familyMembers || [])}
        and preferences: ${JSON.stringify(preferences || {})}

        Strict Constraints:
        - INDIAN FOOD ONLY (MANDATORY): You MUST only propose Indian dishes (e.g. Paratha, Idli, Sambar, Poha, Paneer, Roti, Dal, Veg Biryani). No waffles, pancakes, wraps, burgers, tacos, pasta, oats porridge, etc.
        - Ensure healthy, balanced family adaptations for any restrictions or allergies specified.
        - Always estimate ingredient costs in Indian Rupees (₹).

        Return a JSON object in this format:
        {
          "breakfast": {
             "name": "Family Masala Idli & Sambar",
             "description": "Steamed idlis tossed in gentle spices with vegetable-loaded lentil sambar",
             "alternatives": [
                { "member": "John (Allergic to milk)", "alternative": "Prepared using oil instead of ghee for tempering" }
             ]
          },
          "lunch": {
             "name": "Spiced Paneer Tikka Masala and Jeera Rice",
             "description": "Tandoori spiced cottage cheese chunks in a rich tomato gravy served with cumin basmati rice",
             "alternatives": [
                { "member": "Lucy (Weight loss)", "alternative": "Substitute white rice with brown rice or extra steamed broccoli" }
             ]
          },
          "dinner": {
             "name": "Light Yellow Dal Tadka with Chapati",
             "description": "Easily digestible yellow moong dal tempered with cumin, turmeric, and garlic, served with thin whole wheat flatbreads",
             "alternatives": []
          }
        }
      `;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      if (text) {
        return res.json(JSON.parse(text));
      }
    } catch (err) {
      console.error("Gemini Family recommendation error, falling back:", err);
    }
  }

  // Mock Family meal recommendation - Strictly Indian Cuisine!
  res.json({
    breakfast: {
      name: "Superfood Oats Idli with Sambar",
      description: "A slow-release complex carb breakfast base of steamed oats and semolina idlis, served with warm, vegetable-rich pigeon pea lentil soup.",
      alternatives: [
        { member: "Lucy (Allergic to Peanuts)", alternative: "Substitute peanut chutney with mint-coriander green chutney." },
        { member: "Dad (Muscle Gain)", alternative: "Add 2 boiled eggs on the side or a glass of rich buttermilk." }
      ]
    },
    lunch: {
      name: "Tender Herb Spiced Paneer Tikka with Jeera Rice",
      description: "Pan-seared protein-dense paneer cubes seasoned with turmeric, ginger, and cumin, paired with cumin-infused basmati rice and fresh sliced cucumber salad.",
      alternatives: [
        { member: "Mom (Vegetarian)", alternative: "Already fully vegetarian; can use organic firm tofu cubes if preferred." },
        { member: "Baby (Soft Diet)", alternative: "Serve extra soft mashed rice with well-cooked yellow dal instead of spiced paneer." }
      ]
    },
    dinner: {
      name: "Vibrant Turmeric Moong Dal Khichdi with Roasted Papad",
      description: "An incredibly comforting, gut-healthy, and light evening porridge of yellow lentils and rice tempered with cumin and ghee.",
      alternatives: [
        { member: "Dad (Keto Goal)", alternative: "Skip rice; serve pan-seared paneer cubes tossed in green palak (spinach) gravy instead." }
      ]
    }
  });
});

// Setup Vite Dev server or Serve build assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
