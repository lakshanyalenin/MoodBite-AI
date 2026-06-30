import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  X,
  Home,
  Calendar,
  Camera,
  Activity,
  Heart,
  User,
  LogOut,
  Sliders,
  ChevronRight,
  Sparkles,
  Search,
  CheckCircle2,
  Star,
  Clock,
  DollarSign,
  Droplet,
  Flame,
  Sun,
  Moon,
  ShieldCheck,
  CloudSun,
  CloudRain,
  Snowflake,
  Mic,
  MessageSquare,
  Users,
  Utensils,
  BookOpen
} from "lucide-react";

import { Meal, SavedRecipe, PantryItem, FamilyMember, DailyLog, UserPreferences, WeeklyPlanResponse, Toast } from "./types";
import { db, doc, onSnapshot, setDoc, updateDoc } from "./lib/firebase";
import {
  INITIAL_PREFERENCES,
  INITIAL_PANTRY,
  INITIAL_FAMILY,
  SAMPLE_MEAL_PHOTOS,
  ACHIEVEMENTS,
  INITIAL_SAVED,
  INITIAL_LOG
} from "./data";

import Splash from "./components/Splash";
import Auth from "./components/Auth";
import WeeklyPlannerView from "./components/WeeklyPlannerView";
import CaloriesTrackerView from "./components/CaloriesTrackerView";
import FamilyModeView from "./components/FamilyModeView";
import PantryView from "./components/PantryView";
import SavedRecipesView from "./components/SavedRecipesView";
import ChatBot from "./components/ChatBot";

export default function App() {
  // 1. Core App Lifecycle States
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [firestoreLoaded, setFirestoreLoaded] = useState(false);

  // 2. Hydrated State Managers (with localStorage fallback)
  const [activeTab, setActiveTab] = useState<string>("home");
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem("mb_pref");
    return saved ? JSON.parse(saved) : INITIAL_PREFERENCES;
  });
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
    const saved = localStorage.getItem("mb_pantry");
    return saved ? JSON.parse(saved) : INITIAL_PANTRY;
  });
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem("mb_family");
    return saved ? JSON.parse(saved) : INITIAL_FAMILY;
  });
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>(() => {
    const saved = localStorage.getItem("mb_saved");
    return saved ? JSON.parse(saved) : INITIAL_SAVED;
  });
  const [dailyLog, setDailyLog] = useState<DailyLog>(() => {
    const saved = localStorage.getItem("mb_log");
    return saved ? JSON.parse(saved) : INITIAL_LOG;
  });

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanResponse | null>(() => {
    const saved = localStorage.getItem("mb_weekly_plan");
    return saved ? JSON.parse(saved) : null;
  });

  // Scheduling states
  const [mealToAssign, setMealToAssign] = useState<Meal | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignDay, setAssignDay] = useState("Monday");
  const [assignMealType, setAssignMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snacks">("Breakfast");

  // 3. Feature Specific Interactive States
  const [currentWeather, setCurrentWeather] = useState<"Sunny" | "Rainy" | "Cold" | "Cloudy">("Sunny");
  const [weatherRecommendation, setWeatherRecommendation] = useState<string>(
    "Warm, crisp sunshine perfect for raw fresh greens, proteins and cold-pressed berry infusions."
  );
  
  // Mood State
  const [selectedMood, setSelectedMood] = useState<string>("");
  
  // AI Active recommendations
  const [currentRecommendation, setCurrentRecommendation] = useState<Meal | null>(null);
  const [recommending, setRecommending] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState<Meal | null>(null);

  // Vision scanner states
  const [visionImage, setVisionImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  // Extra features
  const [voiceInput, setVoiceInput] = useState("");
  const [voiceActive, setVoiceActive] = useState(false);
  const [userIngredients, setUserIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Recipe loading screen dynamic messages state
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const loadingMessages = [
    "Cooking your recipe… 🍳",
    "Finding best Indian dish for you… 🍛",
    "Spicing up your palette… 🌶️",
    "Blending fine masalas… 🥣",
    "Plating your premium Indian culinary delight… ✨"
  ];

  useEffect(() => {
    if (!recommending) return;
    setLoadingMsgIdx(0);
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [recommending]);

  // Sync state to local storage on changes
  useEffect(() => {
    localStorage.setItem("mb_pref", JSON.stringify(preferences));
  }, [preferences]);
  useEffect(() => {
    localStorage.setItem("mb_pantry", JSON.stringify(pantryItems));
  }, [pantryItems]);
  useEffect(() => {
    localStorage.setItem("mb_family", JSON.stringify(familyMembers));
  }, [familyMembers]);
  useEffect(() => {
    localStorage.setItem("mb_saved", JSON.stringify(savedRecipes));
  }, [savedRecipes]);
  useEffect(() => {
    localStorage.setItem("mb_log", JSON.stringify(dailyLog));
  }, [dailyLog]);
  useEffect(() => {
    localStorage.setItem("mb_weekly_plan", JSON.stringify(weeklyPlan));
  }, [weeklyPlan]);

  // Handle Initial Login Auth State
  useEffect(() => {
    const savedUser = localStorage.getItem("mb_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Real-time Firebase Firestore Sync
  useEffect(() => {
    if (!user?.email) {
      setFirestoreLoaded(false);
      return;
    }

    const userDocRef = doc(db, "users", user.email);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        
        // Deep string comparisons prevent infinite render loops
        if (data.preferences && JSON.stringify(data.preferences) !== JSON.stringify(preferences)) {
          setPreferences(data.preferences);
        }
        if (data.pantryItems && JSON.stringify(data.pantryItems) !== JSON.stringify(pantryItems)) {
          setPantryItems(data.pantryItems);
        }
        if (data.familyMembers && JSON.stringify(data.familyMembers) !== JSON.stringify(familyMembers)) {
          setFamilyMembers(data.familyMembers);
        }
        if (data.savedRecipes && JSON.stringify(data.savedRecipes) !== JSON.stringify(savedRecipes)) {
          setSavedRecipes(data.savedRecipes);
        }
        if (data.dailyLog && JSON.stringify(data.dailyLog) !== JSON.stringify(dailyLog)) {
          setDailyLog(data.dailyLog);
        }
        if (data.weeklyPlan && JSON.stringify(data.weeklyPlan) !== JSON.stringify(weeklyPlan)) {
          setWeeklyPlan(data.weeklyPlan);
        }
      } else {
        // Document does not exist yet. Create and initialize it!
        setDoc(userDocRef, {
          preferences,
          pantryItems,
          familyMembers,
          savedRecipes,
          dailyLog,
          weeklyPlan: weeklyPlan || null
        }).catch((e) => console.error("Error setting initial document:", e));
      }
      setFirestoreLoaded(true);
    });

    return () => unsubscribe();
  }, [user?.email]);

  // Synchronize state changes back to Firebase Firestore
  useEffect(() => {
    if (user?.email && firestoreLoaded) {
      handleUpdateFirestore("preferences", preferences);
    }
  }, [preferences, user?.email, firestoreLoaded]);

  useEffect(() => {
    if (user?.email && firestoreLoaded) {
      handleUpdateFirestore("pantryItems", pantryItems);
    }
  }, [pantryItems, user?.email, firestoreLoaded]);

  useEffect(() => {
    if (user?.email && firestoreLoaded) {
      handleUpdateFirestore("familyMembers", familyMembers);
    }
  }, [familyMembers, user?.email, firestoreLoaded]);

  useEffect(() => {
    if (user?.email && firestoreLoaded) {
      handleUpdateFirestore("savedRecipes", savedRecipes);
    }
  }, [savedRecipes, user?.email, firestoreLoaded]);

  useEffect(() => {
    if (user?.email && firestoreLoaded) {
      handleUpdateFirestore("dailyLog", dailyLog);
    }
  }, [dailyLog, user?.email, firestoreLoaded]);

  // Local effect syncs to Firestore on client-side state edits
  const handleUpdateFirestore = async (key: string, data: any) => {
    if (!user?.email) return;
    const userDocRef = doc(db, "users", user.email);
    try {
      await updateDoc(userDocRef, { [key]: data });
    } catch {
      await setDoc(userDocRef, { [key]: data }, { merge: true });
    }
  };

  const handleWeeklyPlanUpdate = (plan: WeeklyPlanResponse | null) => {
    setWeeklyPlan(plan);
    handleUpdateFirestore("weeklyPlan", plan);
  };

  const handleAssignMeal = (day: string, mealType: string, meal: Meal) => {
    const basePlan = weeklyPlan || {
      weeklyCalories: 0,
      weeklyBudget: 0,
      nutritionSummary: { protein: 0, carbs: 0, fat: 0 },
      shoppingList: [],
      plan: {
        Monday: { Breakfast: { name: "", calories: 0, protein: 0 }, Lunch: { name: "", calories: 0, protein: 0 }, Dinner: { name: "", calories: 0, protein: 0 }, Snacks: { name: "", calories: 0, protein: 0 } },
        Tuesday: { Breakfast: { name: "", calories: 0, protein: 0 }, Lunch: { name: "", calories: 0, protein: 0 }, Dinner: { name: "", calories: 0, protein: 0 }, Snacks: { name: "", calories: 0, protein: 0 } },
        Wednesday: { Breakfast: { name: "", calories: 0, protein: 0 }, Lunch: { name: "", calories: 0, protein: 0 }, Dinner: { name: "", calories: 0, protein: 0 }, Snacks: { name: "", calories: 0, protein: 0 } },
        Thursday: { Breakfast: { name: "", calories: 0, protein: 0 }, Lunch: { name: "", calories: 0, protein: 0 }, Dinner: { name: "", calories: 0, protein: 0 }, Snacks: { name: "", calories: 0, protein: 0 } },
        Friday: { Breakfast: { name: "", calories: 0, protein: 0 }, Lunch: { name: "", calories: 0, protein: 0 }, Dinner: { name: "", calories: 0, protein: 0 }, Snacks: { name: "", calories: 0, protein: 0 } },
        Saturday: { Breakfast: { name: "", calories: 0, protein: 0 }, Lunch: { name: "", calories: 0, protein: 0 }, Dinner: { name: "", calories: 0, protein: 0 }, Snacks: { name: "", calories: 0, protein: 0 } },
        Sunday: { Breakfast: { name: "", calories: 0, protein: 0 }, Lunch: { name: "", calories: 0, protein: 0 }, Dinner: { name: "", calories: 0, protein: 0 }, Snacks: { name: "", calories: 0, protein: 0 } }
      }
    };

    const updatedPlan = JSON.parse(JSON.stringify(basePlan.plan));
    if (!updatedPlan[day]) {
      updatedPlan[day] = {
        Breakfast: { name: "", calories: 0, protein: 0 },
        Lunch: { name: "", calories: 0, protein: 0 },
        Dinner: { name: "", calories: 0, protein: 0 },
        Snacks: { name: "", calories: 0, protein: 0 }
      };
    }

    updatedPlan[day][mealType] = {
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      ingredients: meal.ingredients || [],
      steps: meal.steps || [],
      cookingTime: meal.cookingTime || 20,
      moodTag: selectedMood || "Healthy",
      estimatedCost: meal.estimatedCost || 120
    };

    // Recalculate stats
    let totalCalories = 0;
    let totalProtein = 0;
    let totalBudget = 0;
    Object.values(updatedPlan).forEach((dayPlan: any) => {
      Object.values(dayPlan).forEach((item: any) => {
        totalCalories += item.calories || 0;
        totalProtein += item.protein || 0;
        totalBudget += item.estimatedCost || 0;
      });
    });

    const currentShoppingList = [...(basePlan.shoppingList || [])];
    meal.ingredients?.forEach((ing) => {
      if (!currentShoppingList.includes(ing)) {
        currentShoppingList.push(ing);
      }
    });

    const finalPlan: WeeklyPlanResponse = {
      ...basePlan,
      weeklyCalories: totalCalories,
      weeklyBudget: totalBudget,
      nutritionSummary: {
        ...basePlan.nutritionSummary,
        protein: totalProtein,
        carbs: basePlan.nutritionSummary.protein ? (totalProtein * 2) : 250,
        fat: basePlan.nutritionSummary.fat || Math.round(totalCalories * 0.03)
      },
      shoppingList: currentShoppingList,
      plan: updatedPlan
    };

    handleWeeklyPlanUpdate(finalPlan);
    setShowAssignModal(false);
    setMealToAssign(null);
    showToast("Added to weekly planner 📅", "success");
  };

  const handleLoginSuccess = (usr: { email: string; name: string }) => {
    setUser(usr);
    localStorage.setItem("mb_user", JSON.stringify(usr));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("mb_user");
  };

  // Weather triggers specific suggestions dynamically
  useEffect(() => {
    let rec = "";
    if (currentWeather === "Sunny") rec = "Warm, crisp sunshine perfect for raw fresh greens, clean proteins, and cold-pressed hydrating fruit juices.";
    else if (currentWeather === "Rainy") rec = "Humid cozy showers request spicy ginger stews, baked root potatoes, and hot immunity-boosting herbal broths.";
    else if (currentWeather === "Cold") rec = "Chilly conditions demand dense roasted protein platters, toasted grain soups, and hot thermal turmeric drinks.";
    else rec = "Misty overcast conditions require fiber-rich legume wraps, light steamed dim sums, and gut-healthy prebiotic warm oats.";
    setWeatherRecommendation(rec);
  }, [currentWeather]);

  // Toggle Dark Theme
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // AI Recommendation Trigger (Endpoint: /api/recommend)
  const getAIRecommendation = async (mood: string) => {
    setSelectedMood(mood);
    setRecommending(true);
    setCurrentRecommendation(null);
    setActiveTab("home");

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          weather: currentWeather,
          preferences,
          pantryItems: pantryItems.slice(0, 3), // Pass soon-to-expire items
          ingredients: userIngredients,
        }),
      });
      const data = await res.json();
      setCurrentRecommendation(data);
    } catch (err) {
      console.error("AI Recommendation failed:", err);
    } finally {
      setRecommending(false);
    }
  };

  // Saved Recipes functions
  const toggleRecipeFavorite = (id: string) => {
    setSavedRecipes(prev => {
      const updated = prev.map(r => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
      const target = updated.find(r => r.id === id);
      if (target) {
        showToast(target.isFavorite ? "Added to favorites ❤️" : "Removed from favorites 💔", "success");
      }
      return updated;
    });
  };

  const removeSavedRecipe = (id: string) => {
    setSavedRecipes(prev => prev.filter(r => r.id !== id));
    showToast("Removed successfully 🗑️", "success");
  };

  const handleRateRecipe = (id: string, rating: number) => {
    setSavedRecipes(prev => {
      const updated = prev.map(r => (r.id === id ? { ...r, rating } : r));
      showToast(`Recipe rated ${rating} stars ⭐`, "success");
      return updated;
    });
  };

  const handleCookAgain = (id: string) => {
    setSavedRecipes(prev => {
      const updated = prev.map(r => (r.id === id ? { ...r, cookCount: (r.cookCount || 0) + 1 } : r));
      const recipe = updated.find(r => r.id === id);
      if (recipe) {
        showToast(`Incremented cook count! Total: ${recipe.cookCount || 1} 🍳`, "success");
      }
      return updated;
    });
  };

  const saveCurrentRecipe = (meal: Meal) => {
    const isAlreadySaved = savedRecipes.some(r => r.meal.id === meal.id);
    if (!isAlreadySaved) {
      const newSaved: SavedRecipe = {
        id: "s_" + Date.now(),
        meal,
        savedAt: new Date().toLocaleDateString(),
        isFavorite: false,
        rating: 0,
        cookCount: 0
      };
      setSavedRecipes(prev => [newSaved, ...prev]);
      showToast("Recipe saved successfully ✔️", "success");
    } else {
      showToast("Recipe is already saved! ❤️", "info");
    }
  };

  // Pantry functions
  const handleAddPantry = (item: PantryItem) => {
    setPantryItems(prev => [item, ...prev]);
  };

  const handleRemovePantry = (id: string) => {
    setPantryItems(prev => prev.filter(i => i.id !== id));
  };

  // Family functions
  const handleAddFamily = (member: FamilyMember) => {
    setFamilyMembers(prev => [...prev, member]);
  };

  const handleRemoveFamily = (id: string) => {
    setFamilyMembers(prev => prev.filter(f => f.id !== id));
  };

  // Calories log updates
  const handleAddCaloriesFromMeal = (cals: number, prot: number, carbs: number, fat: number) => {
    setDailyLog((prev) => ({
      ...prev,
      caloriesConsumed: prev.caloriesConsumed + cals,
      proteinConsumed: prev.proteinConsumed + Math.round(prot),
      carbsConsumed: prev.carbsConsumed + Math.round(carbs),
      fatConsumed: prev.fatConsumed + Math.round(fat),
    }));
  };

  // Image Upload / Camera Scan simulation
  const handleImageSelect = (base64: string) => {
    setVisionImage(base64);
    handleTriggerScan(base64);
  };

  const handleTriggerScan = async (base64: string) => {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = await res.json();
      setScanResult(data);
    } catch (err) {
      console.error("AI Vision scan error:", err);
    } finally {
      setScanning(false);
    }
  };

  const handleAddScanToCalories = () => {
    if (scanResult) {
      handleAddCaloriesFromMeal(
        scanResult.calories,
        scanResult.protein,
        scanResult.carbs,
        scanResult.fat
      );
      setScanResult(null);
      setVisionImage(null);
      setActiveTab("calories");
    }
  };

  // Voice Search simulation
  const triggerVoiceSearch = () => {
    setVoiceActive(true);
    setVoiceInput("Simulating voice tracking...");
    setTimeout(() => {
      setVoiceInput("Healthy High-Protein Vegetarian Bowl");
    }, 1500);
    setTimeout(() => {
      setVoiceActive(false);
      getAIRecommendation("Relaxed");
    }, 2500);
  };

  // Render Screens depending on tab
  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  if (!user) {
    return <Auth onSuccess={handleLoginSuccess} />;
  }

  // Mood prescriptive assets helper
  const moodCards = [
    { emoji: "😊", name: "Happy", color: "from-amber-400 to-amber-500" },
    { emoji: "😔", name: "Sad", color: "from-blue-400 to-blue-500" },
    { emoji: "😴", name: "Tired", color: "from-indigo-400 to-indigo-500" },
    { emoji: "😡", name: "Angry", color: "from-red-400 to-red-500" },
    { emoji: "🤒", name: "Sick", color: "from-teal-400 to-teal-500" },
    { emoji: "🥳", name: "Celebrating", color: "from-pink-400 to-pink-500" },
    { emoji: "😰", name: "Stressed", color: "from-orange-400 to-orange-500" },
    { emoji: "😌", name: "Relaxed", color: "from-emerald-400 to-emerald-500" },
    { emoji: "😍", name: "Romantic", color: "from-rose-400 to-rose-500" },
  ];

  return (
    <div className="min-h-screen bg-transparent font-sans transition-colors duration-500 pb-24 md:pb-6 text-slate-800 dark:text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Background Decor Circles */}
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-[#22C55E]/10 dark:bg-[#22C55E]/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[20%] left-[-100px] w-80 h-80 bg-[#F59E0B]/10 dark:bg-[#F59E0B]/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>

      {/* Dynamic Floating Chat Companion */}
      <ChatBot onViewRecipe={(meal) => setActiveRecipe(meal)} />

      {/* Top Professional Header Bar */}
      <header className="sticky top-0 bg-white/40 dark:bg-[#0F172A]/40 backdrop-blur-xl border-b border-white/60 dark:border-slate-800/40 z-30 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full rounded-b-[24px]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-2xl text-white shadow-md shadow-emerald-500/10">
            <Utensils size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black font-display tracking-tight text-slate-900 dark:text-white">
              MoodBite <span className="text-[#22C55E]">AI</span>
            </h1>
            <span className="text-[10px] text-slate-400 font-mono">Wellness Engine Active</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggler */}
          <button
            onClick={toggleTheme}
            className="p-2.5 bg-white/50 hover:bg-white/80 dark:bg-slate-900/50 dark:hover:bg-slate-800/80 border border-white/40 dark:border-slate-800/30 rounded-xl transition cursor-pointer text-slate-500 dark:text-slate-400"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Quick Profile Icon indicator */}
          <div className="hidden sm:flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-slate-800/40 p-1.5 pr-3 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white rounded-lg flex items-center justify-center font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="text-left">
              <span className="text-xs font-bold block leading-none">{user.name}</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">{user.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Grid Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Sidebar Navigation - Desktop */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4">
          <div className="glass-card rounded-[32px] p-6 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-bold">Portal Menu</span>
              <h3 className="font-bold text-slate-800 dark:text-white font-display">Workspace Nav</h3>
            </div>

            <nav className="space-y-1">
              {[
                { id: "home", label: "Dashboard", icon: Home },
                { id: "planner", label: "AI Weekly Planner", icon: Calendar },
                { id: "vision", label: "AI Meal Vision", icon: Camera },
                { id: "calories", label: "Calories Tracker", icon: Activity },
                { id: "family", label: "Family Mode", icon: Users },
                { id: "pantry", label: "Smart Pantry", icon: Utensils },
                { id: "saved", label: "Saved Recipes", icon: BookOpen },
                { id: "profile", label: "My Profile", icon: User },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setCurrentRecommendation(null);
                    }}
                    className={`w-full px-4 py-3 text-sm font-semibold rounded-2xl flex items-center gap-3 transition cursor-pointer ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white shadow-md shadow-emerald-500/20"
                        : "text-slate-700 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/5 dark:hover:bg-red-500/10 rounded-2xl flex items-center gap-3 transition cursor-pointer"
            >
              <LogOut size={18} />
              Logout Session
            </button>
          </div>
        </aside>

        {/* Dynamic Center Workstage Screen content */}
        <section className="lg:col-span-9 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {/* Dashboard HOME Tab */}
              {activeTab === "home" && (
                <div className="space-y-6">
                  {/* Greeting segment */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
                        Good Morning, <span className="text-emerald-500">{user.name.split(" ")[0]}</span>!
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        "Your health is an investment, not an expense." How are you feeling today?
                      </p>
                    </div>

                    {/* Voice search button */}
                    <button
                      onClick={triggerVoiceSearch}
                      className={`px-4 py-2.5 rounded-2xl border text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all ${
                        voiceActive
                          ? "bg-red-500 text-white border-transparent animate-pulse"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <Mic size={14} />
                      {voiceActive ? "Listening..." : "Voice Search"}
                    </button>
                  </div>

                  {/* Weather Recommendation block */}
                  <div className="glass-card p-5 rounded-[32px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex gap-4 items-center">
                      <div className="p-3 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-2xl">
                        {currentWeather === "Sunny" && <Sun size={24} />}
                        {currentWeather === "Rainy" && <CloudRain size={24} />}
                        {currentWeather === "Cold" && <Snowflake size={24} />}
                        {currentWeather === "Cloudy" && <CloudSun size={24} />}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Smart Weather Recommendation</span>
                        <h4 className="font-bold text-slate-800 dark:text-white mt-0.5">
                          Detected today as <span className="text-amber-500">{currentWeather}</span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
                          {weatherRecommendation}
                        </p>
                      </div>
                    </div>

                    {/* Quick Weather Picker */}
                    <div className="flex gap-1 bg-white/20 dark:bg-slate-800/40 border border-white/40 dark:border-slate-700/30 p-1 rounded-xl self-stretch sm:self-auto">
                      {(["Sunny", "Rainy", "Cold", "Cloudy"] as const).map((w) => (
                        <button
                          key={w}
                          onClick={() => setCurrentWeather(w)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition ${
                            currentWeather === w
                              ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm"
                              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mood Selector Grid */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white font-display">How are you feeling right now?</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-9 gap-3">
                      {moodCards.map((m) => (
                        <button
                          key={m.name}
                          onClick={() => getAIRecommendation(m.name)}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-slate-800/40 backdrop-blur-md cursor-pointer hover:border-emerald-500/50 hover:scale-105 hover:shadow-lg transition group ${
                            selectedMood === m.name ? "border-[#22C55E] bg-[#22C55E]/10 ring-1 ring-[#22C55E]" : ""
                          }`}
                        >
                          <span className="text-2xl block group-hover:scale-110 transition">{m.emoji}</span>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 text-center mt-1.5 truncate w-full">
                            {m.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferences Drawer Panel */}
                  <div className="glass-card p-6 rounded-[32px] space-y-4">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white font-display flex items-center gap-2">
                      <Sliders size={18} className="text-[#22C55E]" />
                      Adjust Your Meal Preferences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Budget */}
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Max Budget: ₹{preferences.budget}</label>
                        <input
                          type="range"
                          min="50"
                          max="2000"
                          step="50"
                          value={preferences.budget}
                          onChange={(e) => setPreferences({ ...preferences, budget: parseInt(e.target.value) })}
                          className="w-full mt-2 accent-[#22C55E]"
                        />
                      </div>
                      {/* Cooking Time */}
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Max Prep Time: {preferences.cookingTime} Mins</label>
                        <input
                          type="range"
                          min="5"
                          max="120"
                          step="5"
                          value={preferences.cookingTime}
                          onChange={(e) => setPreferences({ ...preferences, cookingTime: parseInt(e.target.value) })}
                          className="w-full mt-2 accent-[#22C55E]"
                        />
                      </div>
                      {/* Diet Preferences */}
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Diet Goal</label>
                        <select
                          value={preferences.dietPreference}
                          onChange={(e) => setPreferences({ ...preferences, dietPreference: e.target.value })}
                          className="w-full mt-1.5 px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/30 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-white"
                        >
                          <option value="None">None (Balanced)</option>
                          <option value="Vegetarian">Vegetarian</option>
                          <option value="Vegan">Vegan</option>
                          <option value="Keto">Keto High-Fat</option>
                          <option value="High Protein">High Protein</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* User Ingredients / Fridge Scan Entry */}
                  <div className="glass-card p-6 rounded-[32px] space-y-4">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white font-display">What ingredients do you have?</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type raw items e.g., eggs, paneer, oats..."
                        value={newIngredient}
                        onChange={(e) => setNewIngredient(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newIngredient.trim()) {
                            e.preventDefault();
                            setUserIngredients([...userIngredients, newIngredient.trim()]);
                            setNewIngredient("");
                          }
                        }}
                        className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => {
                          if (newIngredient.trim()) {
                            setUserIngredients([...userIngredients, newIngredient.trim()]);
                            setNewIngredient("");
                          }
                        }}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    {userIngredients.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {userIngredients.map((ing, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold"
                          >
                            {ing}
                            <button
                              onClick={() => setUserIngredients(userIngredients.filter((_, i) => i !== idx))}
                              className="hover:text-red-500 transition font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recommending AI Loading Screen */}
                  {recommending && (
                    <div className="glass-card rounded-[32px] p-12 text-center flex flex-col items-center justify-center space-y-4">
                      <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <h3 className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                        {loadingMessages[loadingMsgIdx]}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                        Injecting current mood, weather conditions, expiring pantry logs, and active family targets into the neural model.
                      </p>
                    </div>
                  )}

                  {/* Display Active AI Recommendation Card */}
                  {currentRecommendation && !recommending && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="glass-card rounded-[32px] overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        <img
                          src={currentRecommendation.imageUrl}
                          alt={currentRecommendation.name}
                          className="w-full h-64 md:h-full object-cover"
                        />
                        <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs font-mono font-extrabold text-amber-500 uppercase">
                              <span className="bg-amber-500/10 px-2 py-0.5 rounded">{currentRecommendation.category}</span>
                              <span className="bg-white/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                                {currentRecommendation.difficulty}
                              </span>
                            </div>
                            <h3 className="text-2xl font-bold font-display text-slate-950 dark:text-white">
                              {currentRecommendation.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              {currentRecommendation.reason}
                            </p>

                            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono font-bold pt-2">
                              <div className="bg-white/30 dark:bg-slate-800/40 border border-white/20 dark:border-slate-800/20 p-2.5 rounded-2xl">
                                <span className="text-[8px] text-slate-400 block font-normal">Calories</span>
                                {currentRecommendation.calories} kcal
                              </div>
                              <div className="bg-white/30 dark:bg-[#0F172A]/40 border border-white/20 dark:border-slate-800/20 p-2.5 rounded-2xl">
                                <span className="text-[8px] text-slate-400 block font-normal">Protein</span>
                                {currentRecommendation.protein}g
                              </div>
                              <div className="bg-white/30 dark:bg-[#0F172A]/40 border border-white/20 dark:border-slate-800/20 p-2.5 rounded-2xl">
                                <span className="text-[8px] text-slate-400 block font-normal">Carbs</span>
                                {currentRecommendation.carbs}g
                              </div>
                              <div className="bg-white/30 dark:bg-[#0F172A]/40 border border-white/20 dark:border-slate-800/20 p-2.5 rounded-2xl">
                                <span className="text-[8px] text-slate-400 block font-normal">Time</span>
                                {currentRecommendation.cookingTime}m
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4">
                            <button
                              onClick={() => saveCurrentRecipe(currentRecommendation)}
                              className="px-3 py-3 bg-white/40 hover:bg-[#22C55E] dark:bg-slate-800/40 hover:text-white rounded-2xl text-[11px] font-semibold cursor-pointer transition border border-white/50 dark:border-slate-700/20 flex items-center justify-center gap-0.5"
                              title="Save recipe"
                            >
                              <Heart size={13} /> Save
                            </button>
                            <button
                              onClick={() => {
                                setMealToAssign(currentRecommendation);
                                setAssignDay("Monday");
                                setAssignMealType(currentRecommendation.category || "Breakfast");
                                setShowAssignModal(true);
                              }}
                              className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[11px] font-bold cursor-pointer transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                              title="Save recipe to weekly planner"
                            >
                              <Calendar size={13} /> Save to Weekly Planner
                            </button>
                            <button
                              onClick={() => setActiveRecipe(currentRecommendation)}
                              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl text-[11px] font-bold cursor-pointer transition flex items-center justify-center gap-0.5"
                            >
                              View Detail <ChevronRight size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Top Rated & Frequently Cooked Section */}
                  {savedRecipes.length > 0 && (
                    <div className="mt-10 space-y-6">
                      <div className="border-t border-slate-100 dark:border-slate-800/60 pt-8">
                        <h3 className="text-xl font-bold font-display text-slate-800 dark:text-white flex items-center gap-2">
                          <Star className="text-amber-500 fill-amber-500" size={18} />
                          Your Top Rated & Frequently Cooked
                        </h3>
                        <p className="text-xs text-slate-400">Recipes you rated highly or prepare most often.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Top Rated Column */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            ⭐️ Top Rated Recipes
                          </h4>
                          {savedRecipes.filter(r => r.rating && r.rating >= 4).length > 0 ? (
                            <div className="space-y-2.5">
                              {savedRecipes.filter(r => r.rating && r.rating >= 4).slice(0, 3).map((item) => (
                                <div 
                                  key={item.id}
                                  onClick={() => setActiveRecipe(item.meal)}
                                  className="p-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-emerald-500/30 transition-all shadow-sm hover:shadow group"
                                >
                                  <img 
                                    src={item.meal.imageUrl} 
                                    alt={item.meal.name}
                                    className="w-12 h-12 rounded-xl object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-emerald-500 transition line-clamp-1">{item.meal.name}</h5>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      {Array.from({ length: item.rating || 0 }).map((_, i) => (
                                        <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
                                      ))}
                                    </div>
                                  </div>
                                  <ChevronRight size={14} className="text-slate-300" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center py-6">
                              <p className="text-xs text-slate-400 italic">No highly-rated recipes yet. Rate saved recipes 4+ stars to feature them here!</p>
                            </div>
                          )}
                        </div>

                        {/* Frequently Cooked Column */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            🍳 Prepared Often
                          </h4>
                          {savedRecipes.filter(r => r.cookCount && r.cookCount >= 1).length > 0 ? (
                            <div className="space-y-2.5">
                              {savedRecipes
                                .filter(r => r.cookCount && r.cookCount >= 1)
                                .sort((a, b) => (b.cookCount || 0) - (a.cookCount || 0))
                                .slice(0, 3)
                                .map((item) => (
                                  <div 
                                    key={item.id}
                                    onClick={() => setActiveRecipe(item.meal)}
                                    className="p-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-emerald-500/30 transition-all shadow-sm hover:shadow group"
                                  >
                                    <img 
                                      src={item.meal.imageUrl} 
                                      alt={item.meal.name}
                                      className="w-12 h-12 rounded-xl object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h5 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-emerald-500 transition line-clamp-1">{item.meal.name}</h5>
                                      <span className="inline-block px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-mono font-bold rounded-md mt-0.5">
                                        Cooked {item.cookCount} times
                                      </span>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-300" />
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center py-6">
                              <p className="text-xs text-slate-400 italic">No cook history logged yet. Click 'Cooked' on saved cards to track your creations!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Meal Vision tab */}
              {activeTab === "vision" && (
                <div className="space-y-6">
                  <div className="text-left space-y-1">
                    <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">AI Meal Vision Scanner</h2>
                    <p className="text-xs text-slate-400">Capture or upload healthy meals. Instantly gauge calories and macronutrients.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Scanner interface */}
                    <div className="glass-card rounded-[32px] p-6 space-y-6">
                      <h3 className="font-bold text-base text-slate-800 dark:text-white font-display">Scan Ingredient or Plate</h3>

                      {/* File Inputs or Mock Samples */}
                      <div className="border-2 border-dashed border-white/40 dark:border-slate-700/30 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-4">
                        {visionImage ? (
                          <img src={visionImage} alt="Scanned meal" className="w-full h-44 object-cover rounded-xl" />
                        ) : (
                          <div className="p-4 bg-[#22C55E]/10 text-[#22C55E] rounded-2xl">
                            <Camera size={32} />
                          </div>
                        )}

                        <div>
                          <p className="text-xs text-slate-500 font-semibold">Drag-and-drop or trigger device camera</p>
                          <input
                            type="file"
                            accept="image/*"
                            id="camera-upload"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (typeof reader.result === "string") {
                                    handleImageSelect(reader.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <label
                            htmlFor="camera-upload"
                            className="mt-3 inline-block px-4 py-2 bg-white/50 hover:bg-white/80 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer border border-white/40 dark:border-slate-700/30 transition"
                          >
                            Select Image file
                          </label>
                        </div>
                      </div>

                      {/* Pick a high quality pre-packaged simulation file card to demo instantly */}
                      <div className="space-y-3">
                        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">
                          Instant Demo: Pick a preset food photo
                        </span>
                        <div className="grid grid-cols-3 gap-3">
                          {SAMPLE_MEAL_PHOTOS.map((photo, i) => (
                            <div
                              key={i}
                              onClick={() => handleImageSelect(photo.imageUrl)}
                              className="p-1.5 border border-white/40 dark:border-slate-800/20 rounded-xl cursor-pointer hover:border-[#22C55E] hover:scale-102 transition bg-white/20 dark:bg-slate-800/20"
                            >
                              <img src={photo.imageUrl} alt={photo.name} className="w-full h-16 object-cover rounded-lg" />
                              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 block text-center mt-1 truncate">
                                {photo.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Scanner Output Results panel */}
                    <div className="space-y-4">
                      {scanning && (
                        <div className="glass-card rounded-[32px] p-12 text-center flex flex-col items-center justify-center space-y-4 h-full">
                          <div className="w-12 h-12 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
                          <h3 className="text-base font-bold font-display text-slate-800 dark:text-white">AI Analyzing Plate Composition...</h3>
                          <p className="text-xs text-slate-500">Gemini is segmenting visual components to isolate ingredients and portion sizes.</p>
                        </div>
                      )}

                      {!scanning && !scanResult && (
                        <div className="glass-card rounded-[32px] p-12 text-center flex flex-col items-center justify-center space-y-3 h-full">
                          <ShieldCheck size={40} className="text-slate-400" />
                          <h4 className="font-bold text-slate-800 dark:text-white font-display">Scan Results Pending</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs font-medium">
                            Select a sample picture or upload a food photo on the left. The AI model will calculate exact nutritional breakdowns.
                          </p>
                        </div>
                      )}

                      {scanResult && !scanning && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass-card rounded-[32px] p-6 space-y-5"
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] text-emerald-500 font-mono font-bold uppercase tracking-wider block">
                                  Identified Food
                                </span>
                                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
                                  {scanResult.foodName}
                                </h3>
                              </div>
                              <div className="p-3 bg-emerald-500/10 text-[#22C55E] rounded-2xl text-center border border-emerald-500/10">
                                <span className="text-2xl font-black font-mono block leading-none">{scanResult.healthyScore}</span>
                                <span className="text-[8px] text-emerald-600 font-mono font-bold uppercase block mt-1">Health score</span>
                              </div>
                            </div>
                            <span className="text-xs text-slate-400 font-mono block mt-2">Serving: {scanResult.servingSize}</span>
                          </div>

                          <div className="p-4 bg-white/30 dark:bg-slate-850/30 border border-white/20 dark:border-slate-800/10 rounded-2xl">
                            <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase mb-1">Nutrition Summary</span>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{scanResult.nutritionSummary}</p>
                          </div>

                          {/* Scan Macros detail */}
                          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono font-bold">
                            <div className="bg-white/30 dark:bg-[#0F172A]/40 border border-white/20 dark:border-slate-800/20 p-2 rounded-xl">
                              <span className="text-[8px] text-slate-400 block font-normal">Cals</span>
                              {scanResult.calories} kcal
                            </div>
                            <div className="bg-white/30 dark:bg-[#0F172A]/40 border border-white/20 dark:border-slate-800/20 p-2 rounded-xl">
                              <span className="text-[8px] text-slate-400 block font-normal">Protein</span>
                              {scanResult.protein}g
                            </div>
                            <div className="bg-white/30 dark:bg-[#0F172A]/40 border border-white/20 dark:border-slate-800/20 p-2 rounded-xl">
                              <span className="text-[8px] text-slate-400 block font-normal">Carbs</span>
                              {scanResult.carbs}g
                            </div>
                            <div className="bg-white/30 dark:bg-[#0F172A]/40 border border-white/20 dark:border-slate-800/20 p-2 rounded-xl">
                              <span className="text-[8px] text-slate-400 block font-normal">Fat</span>
                              {scanResult.fat}g
                            </div>
                          </div>

                          {/* Advice bullets */}
                          <div className="space-y-2">
                            <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase">Nutrition Suggestions</span>
                            <div className="space-y-1.5">
                              {scanResult.suggestions?.map((item: string, i: number) => (
                                <div key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                  <span className="text-[#22C55E] font-extrabold font-mono">✓</span>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={handleAddScanToCalories}
                            className="w-full py-3.5 bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold rounded-2xl transition-all shadow-md shadow-emerald-500/10 text-xs flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Plus size={14} /> Log To Calories Tracker
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Weekly Planner Tab */}
              {activeTab === "planner" && (
                <WeeklyPlannerView
                  preferences={preferences}
                  pantryItems={pantryItems}
                  userIngredients={userIngredients}
                  onAddCalories={handleAddCaloriesFromMeal}
                  weeklyPlan={weeklyPlan}
                  onUpdateWeeklyPlan={handleWeeklyPlanUpdate}
                  showToast={showToast}
                />
              )}

              {/* Calories Tracker tab */}
              {activeTab === "calories" && (
                <CaloriesTrackerView log={dailyLog} onUpdateLog={(log) => setDailyLog(log)} />
              )}

              {/* Family Mode tab */}
              {activeTab === "family" && (
                <FamilyModeView
                  familyMembers={familyMembers}
                  onAddMember={handleAddFamily}
                  onRemoveMember={handleRemoveFamily}
                />
              )}

              {/* Smart Pantry Tab */}
              {activeTab === "pantry" && (
                <PantryView
                  pantryItems={pantryItems}
                  onAddItem={handleAddPantry}
                  onRemoveItem={handleRemovePantry}
                  onViewRecipe={(meal) => setActiveRecipe(meal)}
                />
              )}

              {/* Saved Recipes tab */}
              {activeTab === "saved" && (
                <SavedRecipesView
                  savedRecipes={savedRecipes}
                  onToggleFavorite={toggleRecipeFavorite}
                  onRemoveSaved={removeSavedRecipe}
                  onViewRecipe={(meal) => setActiveRecipe(meal)}
                  onRateRecipe={handleRateRecipe}
                  onCookAgain={handleCookAgain}
                  onScheduleRecipe={(meal) => {
                    setMealToAssign(meal);
                    setAssignDay("Monday");
                    setAssignMealType(meal.category || "Breakfast");
                    setShowAssignModal(true);
                  }}
                />
              )}

              {/* Profile Screen Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  {/* Avatar and bio details */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center font-black text-2xl text-white shadow-md">
                      {user.name.charAt(0)}
                    </div>
                    <div className="text-center sm:text-left flex-1 space-y-1">
                      <h3 className="text-xl font-bold font-display text-slate-850 dark:text-white">{user.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">Member Since: June 2026</p>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 pt-1.5">
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                          Goal: {preferences.healthGoal}
                        </span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                          Daily Target: {preferences.waterIntakeGoal} ml Water
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Achievements and milestones list */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white font-display">Earned Health Badges</h3>
                    <p className="text-xs text-slate-400">Unlock these achievements by executing daily calorie logging targets and water goals.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {ACHIEVEMENTS.map((ach) => (
                        <div
                          key={ach.id}
                          className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                            ach.achieved
                              ? "bg-emerald-500/5 border-emerald-100 dark:border-emerald-950/40"
                              : "bg-slate-50/50 dark:bg-slate-800/20 border-slate-200/50 dark:border-slate-800 opacity-60"
                          }`}
                        >
                          <div className={`p-3 rounded-xl ${ach.achieved ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400"}`}>
                            <Sparkles size={18} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">{ach.name}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

      {/* Schedule Selection Modal Overlay */}
      <AnimatePresence>
        {showAssignModal && mealToAssign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setMealToAssign(null);
                }}
                className="absolute right-5 top-5 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 rounded-full cursor-pointer transition"
              >
                <X size={15} />
              </button>

              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-2 pr-6">
                Schedule to Weekly Plan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Assign <strong className="text-slate-800 dark:text-white">"{mealToAssign.name}"</strong> to a specific day in your calendar schedule.
              </p>

              <div className="space-y-4 mt-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Choose Day</label>
                  <select
                    value={assignDay}
                    onChange={(e) => setAssignDay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-850 dark:text-white focus:outline-none"
                  >
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Choose Meal Slot</label>
                  <select
                    value={assignMealType}
                    onChange={(e) => setAssignMealType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-850 dark:text-white focus:outline-none"
                  >
                    {["Breakfast", "Lunch", "Dinner", "Snacks"].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2.5 pt-3">
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setMealToAssign(null);
                    }}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAssignMeal(assignDay, assignMealType, mealToAssign)}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-500/10 cursor-pointer"
                  >
                    Add to Calendar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </section>
      </main>

      {/* Full-Screen Beautiful Recipe Detail View Modal Overlay */}
      <AnimatePresence>
        {activeRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-end transition-all"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="w-full max-w-xl bg-white dark:bg-slate-900 h-full overflow-y-auto flex flex-col shadow-2xl relative"
            >
              <button
                onClick={() => setActiveRecipe(null)}
                className="absolute left-6 top-6 z-10 p-2.5 bg-white/90 dark:bg-slate-900/95 backdrop-blur rounded-full text-slate-700 dark:text-white hover:scale-110 shadow transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <img
                src={activeRecipe.imageUrl}
                alt={activeRecipe.name}
                className="w-full h-64 object-cover"
              />

              <div className="p-6 md:p-8 space-y-6 flex-1">
                <div>
                  <div className="flex justify-between items-center text-xs font-mono font-extrabold text-emerald-500 uppercase">
                    <span>{activeRecipe.category}</span>
                    <span className="bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-bold">
                      {activeRecipe.difficulty}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1.5">
                    {activeRecipe.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                    "{activeRecipe.reason}"
                  </p>
                </div>

                {/* Macros Breakdown */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono font-bold">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl text-slate-700 dark:text-slate-300">
                    <span className="text-[8px] text-slate-400 block font-normal">Cals</span>
                    {activeRecipe.calories} kcal
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl text-slate-700 dark:text-slate-300">
                    <span className="text-[8px] text-slate-400 block font-normal">Protein</span>
                    {activeRecipe.protein}g
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl text-slate-700 dark:text-slate-300">
                    <span className="text-[8px] text-slate-400 block font-normal">Carbs</span>
                    {activeRecipe.carbs}g
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl text-slate-700 dark:text-slate-300">
                    <span className="text-[8px] text-slate-400 block font-normal">Fat</span>
                    {activeRecipe.fat}g
                  </div>
                </div>

                {/* Ingredients & Cost panel */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider font-mono">
                      Needed Ingredients
                    </h4>
                    <span className="text-xs font-mono font-bold text-amber-500 flex items-center">
                      Est. Cost: <DollarSign size={12} className="ml-0.5" /> {activeRecipe.estimatedCost} INR
                    </span>
                  </div>
                  <div className="space-y-2">
                    {activeRecipe.ingredients?.map((ing, i) => (
                      <div key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <span>{ing}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider font-mono">
                    Cooking Steps
                  </h4>
                  <div className="space-y-3.5">
                    {activeRecipe.steps?.map((step, i) => (
                      <div key={i} className="flex gap-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        <span className="font-mono font-extrabold text-emerald-500">{i + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Swaps & Alternatives */}
                {activeRecipe.alternatives && Object.keys(activeRecipe.alternatives).length > 0 && (
                  <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl space-y-2.5">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold block uppercase">
                      Suggested Ingredient Swaps
                    </span>
                    <div className="space-y-1.5">
                      {Object.entries(activeRecipe.alternatives).map(([original, replaced]) => (
                        <div key={original} className="text-xs text-slate-600 dark:text-slate-400">
                          <strong className="text-slate-800 dark:text-white">{original}:</strong> replace with {replaced}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-6">
                  <button
                    onClick={() => {
                      setMealToAssign(activeRecipe);
                      setAssignDay("Monday");
                      setAssignMealType(activeRecipe.category || "Breakfast");
                      setShowAssignModal(true);
                      setActiveRecipe(null);
                    }}
                    className="px-4 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-2xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                  >
                    <Calendar size={14} /> Save to Weekly Planner
                  </button>
                  <button
                    onClick={() => {
                      handleAddCaloriesFromMeal(
                        activeRecipe.calories,
                        activeRecipe.protein,
                        activeRecipe.carbs,
                        activeRecipe.fat
                      );
                      setActiveRecipe(null);
                      setActiveTab("calories");
                    }}
                    className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-2xl cursor-pointer transition text-center"
                  >
                    Add Meal to Calories Log
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glassmorphic Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-900 py-3 px-4 flex justify-around items-center lg:hidden z-30">
        {[
          { id: "home", label: "Home", icon: Home },
          { id: "planner", label: "Planner", icon: Calendar },
          { id: "vision", label: "Scan", icon: Camera },
          { id: "calories", label: "Cal Tracker", icon: Activity },
          { id: "profile", label: "Profile", icon: User },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setCurrentRecommendation(null);
              }}
              className={`flex flex-col items-center justify-center cursor-pointer transition ${
                activeTab === item.id ? "text-emerald-500 scale-105" : "text-slate-400"
              }`}
            >
              <Icon size={18} />
              <span className="text-[9px] font-bold mt-1">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Floating Toast Notification Feed */}
      <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none max-w-xs sm:max-w-sm w-full p-4">
        <AnimatePresence>
          {toasts.map((toastItem) => (
            <motion.div
              key={toastItem.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto p-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl flex items-center justify-between gap-3 pointer-events-auto"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${
                  toastItem.type === "success" ? "bg-emerald-500" : toastItem.type === "error" ? "bg-red-500" : "bg-blue-500"
                }`} />
                <span className="text-xs font-semibold text-slate-850 dark:text-slate-100 leading-tight">
                  {toastItem.message}
                </span>
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toastItem.id))}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition text-[10px] p-0.5"
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
