import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Apple, Sparkles, DollarSign, ListTodo, Flame, Trash2, Edit2, Plus, Check, X, ShieldAlert, Share2, Clipboard } from "lucide-react";
import { WeeklyPlanResponse, DayPlan, PlanItem } from "../types";
import { compileSmartShoppingList } from "../lib/shoppingUtils";

interface WeeklyPlannerViewProps {
  preferences: any;
  pantryItems: any[];
  userIngredients: string[];
  onAddCalories: (cals: number, prot: number, carbs: number, fat: number) => void;
  weeklyPlan: WeeklyPlanResponse | null;
  onUpdateWeeklyPlan: (plan: WeeklyPlanResponse | null) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function WeeklyPlannerView({
  preferences,
  pantryItems,
  userIngredients,
  onAddCalories,
  weeklyPlan,
  onUpdateWeeklyPlan,
  showToast,
}: WeeklyPlannerViewProps) {
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  
  // Editing states for recipe
  const [editingMeal, setEditingMeal] = useState<{ day: string; type: string } | null>(null);
  const [editName, setEditName] = useState("");
  const [editCalories, setEditCalories] = useState(0);
  const [editProtein, setEditProtein] = useState(0);
  const [editIngredients, setEditIngredients] = useState("");
  const [editSteps, setEditSteps] = useState("");
  const [editCookingTime, setEditCookingTime] = useState(20);
  const [editMoodTag, setEditMoodTag] = useState("Healthy");
  const [editCost, setEditCost] = useState(120);

  // Expanded meal view state
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null); // Format: "Day-MealType"

  // Manual Add state
  const [addingMeal, setAddingMeal] = useState<{ day: string; type: string } | null>(null);

  // New shopping item state
  const [newShoppingItem, setNewShoppingItem] = useState("");

  const generateWeeklyPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences,
          pantryItems,
          ingredients: userIngredients
        }),
      });
      const data = await res.json();
      onUpdateWeeklyPlan(data);
      showToast("Added to weekly planner 📅", "success");
    } catch (err) {
      console.error("Error generating weekly plan:", err);
      showToast("Error: Try again later ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  const initEmptyPlan = (): WeeklyPlanResponse => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const emptyPlan: Record<string, DayPlan> = {};
    days.forEach((day) => {
      emptyPlan[day] = {
        Breakfast: { name: "", calories: 0, protein: 0, ingredients: [], steps: [], cookingTime: 0, moodTag: "" },
        Lunch: { name: "", calories: 0, protein: 0, ingredients: [], steps: [], cookingTime: 0, moodTag: "" },
        Dinner: { name: "", calories: 0, protein: 0, ingredients: [], steps: [], cookingTime: 0, moodTag: "" },
        Snacks: { name: "", calories: 0, protein: 0, ingredients: [], steps: [], cookingTime: 0, moodTag: "" },
      };
    });
    return {
      weeklyCalories: 0,
      weeklyBudget: 0,
      nutritionSummary: { protein: 0, carbs: 0, fat: 0 },
      shoppingList: [],
      plan: emptyPlan,
    };
  };

  const handleDeleteMeal = (day: string, type: string) => {
    if (!weeklyPlan) return;
    const updatedPlan = JSON.parse(JSON.stringify(weeklyPlan)) as WeeklyPlanResponse;
    if (updatedPlan.plan[day]) {
      updatedPlan.plan[day][type as keyof DayPlan] = { name: "", calories: 0, protein: 0, ingredients: [], steps: [], cookingTime: 0, moodTag: "" };
    }
    recalculateStats(updatedPlan);
  };

  const handleStartEdit = (day: string, type: string, current: PlanItem) => {
    setEditingMeal({ day, type });
    setEditName(current.name);
    setEditCalories(current.calories);
    setEditProtein(current.protein);
    setEditIngredients(current.ingredients?.join("\n") || "");
    setEditSteps(current.steps?.join("\n") || "");
    setEditCookingTime(current.cookingTime || 20);
    setEditMoodTag(current.moodTag || "Healthy");
    setEditCost(current.estimatedCost || 120);
  };

  const handleSaveEdit = () => {
    if (!editingMeal || !weeklyPlan) return;
    const { day, type } = editingMeal;
    const updatedPlan = JSON.parse(JSON.stringify(weeklyPlan)) as WeeklyPlanResponse;
    if (updatedPlan.plan[day]) {
      const ingList = editIngredients
        .split("\n")
        .map((i) => i.trim())
        .filter((i) => i.length > 0);
      const stepList = editSteps
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      updatedPlan.plan[day][type as keyof DayPlan] = {
        name: editName || "Custom Indian Meal",
        calories: Number(editCalories) || 0,
        protein: Number(editProtein) || 0,
        ingredients: ingList,
        steps: stepList,
        cookingTime: Number(editCookingTime) || 20,
        moodTag: editMoodTag || "Healthy",
        estimatedCost: Number(editCost) || 120,
      };
    }
    setEditingMeal(null);
    recalculateStats(updatedPlan);
  };

  const handleStartAdd = (day: string, type: string) => {
    setAddingMeal({ day, type });
    setEditName("");
    setEditCalories(150);
    setEditProtein(10);
    setEditIngredients("");
    setEditSteps("");
    setEditCookingTime(15);
    setEditMoodTag("Healthy");
    setEditCost(100);
  };

  const handleSaveAdd = () => {
    if (!addingMeal) return;
    const { day, type } = addingMeal;
    const basePlan = weeklyPlan ? JSON.parse(JSON.stringify(weeklyPlan)) : initEmptyPlan();
    
    if (basePlan.plan[day]) {
      const ingList = editIngredients
        .split("\n")
        .map((i) => i.trim())
        .filter((i) => i.length > 0);
      const stepList = editSteps
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      basePlan.plan[day][type as keyof DayPlan] = {
        name: editName || "New Indian Meal",
        calories: Number(editCalories) || 0,
        protein: Number(editProtein) || 0,
        ingredients: ingList,
        steps: stepList,
        cookingTime: Number(editCookingTime) || 15,
        moodTag: editMoodTag || "Healthy",
        estimatedCost: Number(editCost) || 100,
      };
    }
    setAddingMeal(null);
    recalculateStats(basePlan);
  };

  const recalculateStats = (planData: WeeklyPlanResponse) => {
    let totalCals = 0;
    let totalProt = 0;
    let totalCost = 0;
    const rawIngs: string[] = [];

    Object.values(planData.plan).forEach((dayPlan) => {
      Object.values(dayPlan).forEach((item) => {
        totalCals += item.calories || 0;
        totalProt += item.protein || 0;
        totalCost += item.estimatedCost || 0;
        if (item.ingredients && Array.isArray(item.ingredients)) {
          item.ingredients.forEach(ing => {
            if (ing.trim()) {
              rawIngs.push(ing.trim());
            }
          });
        }
      });
    });

    planData.weeklyCalories = totalCals;
    planData.weeklyBudget = totalCost;
    planData.nutritionSummary.protein = totalProt;
    planData.nutritionSummary.carbs = totalProt * 2; // Simulating balanced ratios
    planData.nutritionSummary.fat = Math.round(totalCals * 0.03);

    // Compile beautifully merged shopping list
    planData.shoppingList = compileSmartShoppingList(rawIngs);

    onUpdateWeeklyPlan(planData);
  };

  const handleAddShoppingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShoppingItem.trim()) return;
    const basePlan = weeklyPlan ? JSON.parse(JSON.stringify(weeklyPlan)) : initEmptyPlan();
    basePlan.shoppingList = compileSmartShoppingList([...(basePlan.shoppingList || []), newShoppingItem.trim()]);
    onUpdateWeeklyPlan(basePlan);
    setNewShoppingItem("");
    showToast("Added item to shopping list 🛒", "success");
  };

  const handleRemoveShoppingItem = (index: number) => {
    if (!weeklyPlan) return;
    const updated = JSON.parse(JSON.stringify(weeklyPlan)) as WeeklyPlanResponse;
    const itemToRemove = updated.shoppingList[index];
    updated.shoppingList = updated.shoppingList.filter((_, i) => i !== index);
    if (updated.checkedShoppingItems) {
      updated.checkedShoppingItems = updated.checkedShoppingItems.filter(item => item !== itemToRemove);
    }
    onUpdateWeeklyPlan(updated);
    showToast("Removed successfully 🗑️", "success");
  };

  const toggleShoppingItemChecked = (item: string) => {
    if (!weeklyPlan) return;
    const updated = JSON.parse(JSON.stringify(weeklyPlan)) as WeeklyPlanResponse;
    if (!updated.checkedShoppingItems) {
      updated.checkedShoppingItems = [];
    }
    const isChecked = updated.checkedShoppingItems.includes(item);
    if (isChecked) {
      updated.checkedShoppingItems = updated.checkedShoppingItems.filter(i => i !== item);
    } else {
      updated.checkedShoppingItems.push(item);
    }
    onUpdateWeeklyPlan(updated);
    showToast(isChecked ? "Item unchecked 🔲" : "Item checked off ✔️", "success");
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];

  const currentDayPlan = weeklyPlan?.plan?.[selectedDay] || null;

  return (
    <div className="space-y-6">
      {/* Header and Call-to-action */}
      <div className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-[32px] p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold font-display text-white">AI Weekly Meal Planner</h2>
            <p className="text-emerald-50/90 text-sm mt-1 max-w-lg">
              Set up a fully personalized 7-day calendar. Add, update, and delete meals. Save recommended recipes from the dashboard and sync across all devices!
            </p>
          </div>
          <button
            onClick={generateWeeklyPlan}
            disabled={loading}
            className="px-6 py-3.5 bg-white text-[#22C55E] hover:bg-emerald-50 disabled:bg-white/85 font-bold rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer self-stretch md:self-auto text-center justify-center text-sm"
          >
            <Sparkles size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Generating Schedule..." : "Auto-Generate AI Plan"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-[32px] p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Formulating Balanced Calorie Matrix...</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">
            Using Gemini AI to structure protein targets, daily fiber quotas, and compile your weekly smart shopping list.
          </p>
        </div>
      )}

      {!loading && !weeklyPlan && (
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-[32px] p-10 text-center flex flex-col items-center justify-center space-y-4">
          <Calendar size={48} className="text-amber-500" />
          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Start Your Weekly Planner</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
            You don't have an active plan yet. Generate an AI meal plan matching your diet preferences, or start by manually creating custom daily schedules.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => onUpdateWeeklyPlan(initEmptyPlan())}
              className="px-5 py-3 bg-slate-150 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 text-sm font-semibold rounded-xl transition cursor-pointer"
            >
              Start Empty Calendar
            </button>
            <button
              onClick={generateWeeklyPlan}
              className="px-5 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold rounded-xl transition cursor-pointer flex items-center gap-2"
            >
              <Sparkles size={14} /> Generate with AI
            </button>
          </div>
        </div>
      )}

      {weeklyPlan && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Plan Calendar UI */}
          <div className="lg:col-span-2 space-y-4">
            {/* Days Selection Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer border ${
                    selectedDay === day
                      ? "bg-[#22C55E] border-[#22C55E] text-white shadow-md shadow-emerald-500/10"
                      : "bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Daily Meals Breakdown */}
            <div className="space-y-4">
              {mealTypes.map((mealType) => {
                const meal = currentDayPlan ? currentDayPlan[mealType as keyof DayPlan] : null;
                const hasMeal = meal && meal.name;

                return (
                  <div
                    key={mealType}
                    className="p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-all"
                  >
                    {/* If editing this meal */}
                    {editingMeal?.day === selectedDay && editingMeal?.type === mealType ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono uppercase">
                            Edit {mealType} (Indian Recipe)
                          </span>
                          <button
                            onClick={() => setEditingMeal(null)}
                            className="text-slate-400 hover:text-red-500 cursor-pointer"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Recipe Name (Indian only)</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Calories (kcal)</label>
                            <input
                              type="number"
                              value={editCalories}
                              onChange={(e) => setEditCalories(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Protein (g)</label>
                            <input
                              type="number"
                              value={editProtein}
                              onChange={(e) => setEditProtein(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Cost (₹)</label>
                            <input
                              type="number"
                              value={editCost}
                              onChange={(e) => setEditCost(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 font-mono"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Cooking Time (min)</label>
                            <input
                              type="number"
                              value={editCookingTime}
                              onChange={(e) => setEditCookingTime(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Mood Tag</label>
                            <select
                              value={editMoodTag}
                              onChange={(e) => setEditMoodTag(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900"
                            >
                              <option value="Happy">Happy (Festive)</option>
                              <option value="Sad">Sad (Comfort)</option>
                              <option value="Healthy">Healthy (Nutritious)</option>
                              <option value="Lazy">Lazy (Under 15 min)</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Ingredients (One per line)</label>
                          <textarea
                            value={editIngredients}
                            onChange={(e) => setEditIngredients(e.target.value)}
                            placeholder="e.g.&#10;1 cup Basmati Rice&#10;1/2 cup Moong Dal&#10;1 tsp Turmeric"
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 font-sans"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Cooking Steps (One per line)</label>
                          <textarea
                            value={editSteps}
                            onChange={(e) => setEditSteps(e.target.value)}
                            placeholder="e.g.&#10;Wash rice and lentils together.&#10;Boil with water, salt and turmeric.&#10;Prepare seasoning and serve hot."
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 font-sans"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={handleSaveEdit}
                            className="px-4 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Save Recipe
                          </button>
                          <button
                            onClick={() => setEditingMeal(null)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : addingMeal?.day === selectedDay && addingMeal?.type === mealType ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                          <span className="text-xs font-bold text-[#22C55E] font-mono uppercase">
                            Add Custom {mealType} (Indian Recipe)
                          </span>
                          <button
                            onClick={() => setAddingMeal(null)}
                            className="text-slate-400 hover:text-red-500 cursor-pointer"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Recipe Name (Indian only)</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="e.g. Masala Poha"
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Calories (kcal)</label>
                            <input
                              type="number"
                              value={editCalories}
                              onChange={(e) => setEditCalories(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Protein (g)</label>
                            <input
                              type="number"
                              value={editProtein}
                              onChange={(e) => setEditProtein(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Cost (₹)</label>
                            <input
                              type="number"
                              value={editCost}
                              onChange={(e) => setEditCost(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 font-mono"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Cooking Time (min)</label>
                            <input
                              type="number"
                              value={editCookingTime}
                              onChange={(e) => setEditCookingTime(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Mood Tag</label>
                            <select
                              value={editMoodTag}
                              onChange={(e) => setEditMoodTag(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900"
                            >
                              <option value="Happy">Happy (Festive)</option>
                              <option value="Sad">Sad (Comfort)</option>
                              <option value="Healthy">Healthy (Nutritious)</option>
                              <option value="Lazy">Lazy (Under 15 min)</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Ingredients (One per line)</label>
                          <textarea
                            value={editIngredients}
                            onChange={(e) => setEditIngredients(e.target.value)}
                            placeholder="e.g.&#10;1 cup Poha (flattened rice)&#10;1 small Potato&#10;1/2 tsp Mustard Seeds"
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 font-sans"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Cooking Steps (One per line)</label>
                          <textarea
                            value={editSteps}
                            onChange={(e) => setEditSteps(e.target.value)}
                            placeholder="e.g.&#10;Rinse poha and set aside.&#10;Heat oil, temper mustard seeds, curry leaves.&#10;Add chopped potato, turmeric, sauté, then mix poha."
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 font-sans"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={handleSaveAdd}
                            className="px-4 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Add Recipe
                          </button>
                          <button
                            onClick={() => setAddingMeal(null)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>                    ) : hasMeal ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 text-[#22C55E] rounded-xl">
                              <Apple size={20} />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 flex-wrap">
                                {mealType}
                                {meal.moodTag && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded">
                                    {meal.moodTag}
                                  </span>
                                )}
                                {meal.cookingTime && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded">
                                    {meal.cookingTime} mins
                                  </span>
                                )}
                              </span>
                              <h4 className="font-bold text-slate-800 dark:text-white text-base mt-0.5">
                                {meal.name}
                              </h4>
                              <div className="flex gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1 flex-wrap">
                                <span className="flex items-center gap-1 font-mono font-semibold">
                                  <Flame size={12} className="text-amber-500" /> {meal.calories} kcal
                                </span>
                                <span className="font-mono font-semibold">Protein: {meal.protein}g</span>
                                {meal.estimatedCost && (
                                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Cost: ₹{meal.estimatedCost}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-1.5 items-center">
                            {/* Toggle Details */}
                            <button
                              onClick={() => setExpandedMeal(expandedMeal === `${selectedDay}-${mealType}` ? null : `${selectedDay}-${mealType}`)}
                              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-[#22C55E] hover:text-white cursor-pointer transition-all"
                            >
                              {expandedMeal === `${selectedDay}-${mealType}` ? "Hide Recipe" : "View Recipe"}
                            </button>

                            {/* Log calories */}
                            <button
                              onClick={() => onAddCalories(meal.calories, meal.protein, meal.protein * 2.5, meal.calories * 0.03)}
                              className="p-2 bg-emerald-500/10 hover:bg-[#22C55E] text-[#22C55E] hover:text-white rounded-xl transition cursor-pointer"
                              title="Add to daily log"
                            >
                              <Check size={14} />
                            </button>

                            {/* Edit meal */}
                            <button
                              onClick={() => handleStartEdit(selectedDay, mealType, meal)}
                              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-500 hover:text-white text-slate-500 dark:text-slate-400 rounded-xl transition cursor-pointer"
                              title="Edit meal"
                            >
                              <Edit2 size={14} />
                            </button>

                            {/* Delete meal */}
                            <button
                              onClick={() => handleDeleteMeal(selectedDay, mealType)}
                              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-500 dark:text-slate-400 rounded-xl transition cursor-pointer"
                              title="Delete meal"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Recipe Details */}
                        {expandedMeal === `${selectedDay}-${mealType}` && (
                          <div className="mt-3 pt-3 border-t border-slate-150 dark:border-slate-800 space-y-3 text-slate-700 dark:text-slate-300 text-xs">
                            {meal.ingredients && meal.ingredients.length > 0 ? (
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block mb-1">Ingredients:</span>
                                <ul className="list-disc pl-4 space-y-0.5">
                                  {meal.ingredients.map((ing, idx) => (
                                    <li key={idx}>{ing}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <p className="italic text-slate-400">No ingredients specified.</p>
                            )}
                            
                            {meal.steps && meal.steps.length > 0 ? (
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block mb-1">Steps:</span>
                                <ol className="list-decimal pl-4 space-y-1">
                                  {meal.steps.map((step, idx) => (
                                    <li key={idx}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                            ) : (
                              <p className="italic text-slate-400">No instructions specified.</p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 rounded-xl">
                            <Apple size={20} />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              {mealType}
                            </span>
                            <h4 className="font-semibold text-slate-400 dark:text-slate-500 text-sm italic mt-0.5">
                              No meal scheduled
                            </h4>
                          </div>
                        </div>

                        <button
                          onClick={() => handleStartAdd(selectedDay, mealType)}
                          className="px-3 py-1.5 border border-dashed border-[#22C55E]/40 hover:border-[#22C55E] text-[#22C55E] text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Plus size={12} /> Add Meal
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Section: Nutrition Summary & Shopping List */}
          <div className="space-y-6">
            {/* Week Summary */}
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 space-y-4 shadow-sm">
              <h3 className="font-bold font-display text-slate-850 dark:text-white flex items-center gap-2">
                Nutrition Summary
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl text-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Weekly Target</span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
                    {weeklyPlan.weeklyCalories}
                  </span>
                  <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wide">Calories</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl text-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Est. Budget</span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 block flex items-center justify-center gap-0.5">
                    <span className="text-emerald-500 font-sans">₹</span>
                    {weeklyPlan.weeklyBudget || "0"}
                  </span>
                  <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wide">INR / Week</span>
                </div>
              </div>

              {/* Macros Bars */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-350">
                    <span>Protein Target</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {weeklyPlan.nutritionSummary?.protein || 0}g
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-[#22C55E]" style={{ width: "75%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-350">
                    <span>Carbs Target</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {weeklyPlan.nutritionSummary?.carbs || 0}g
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-amber-500" style={{ width: "60%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-355">
                    <span>Fats Target</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {weeklyPlan.nutritionSummary?.fat || 0}g
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-rose-500" style={{ width: "45%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Shopping list */}
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="font-bold font-display text-slate-850 dark:text-white flex items-center gap-2">
                  <ListTodo size={18} className="text-[#22C55E]" />
                  Compiled Shopping List
                </h3>
                {weeklyPlan.shoppingList && weeklyPlan.shoppingList.length > 0 && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        const items = weeklyPlan.shoppingList.map((item) => {
                          const isChecked = weeklyPlan.checkedShoppingItems?.includes(item);
                          return `${isChecked ? "[x]" : "[ ]"} ${item}`;
                        }).join("\n");
                        const text = `🍛 MoodBite AI Indian Recipe Assistant - Grocery Shopping List:\n\n${items}\n\nGenerated on ${new Date().toLocaleDateString()}`;
                        navigator.clipboard.writeText(text);
                        showToast("Groceries copied to clipboard! 📋", "success");
                      }}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-lg cursor-pointer transition flex items-center justify-center"
                      title="Copy list to clipboard"
                    >
                      <Clipboard size={14} />
                    </button>
                    <button
                      onClick={() => {
                        const items = weeklyPlan.shoppingList.map((item) => {
                          const isChecked = weeklyPlan.checkedShoppingItems?.includes(item);
                          return `${isChecked ? "✅" : "▫️"} ${item}`;
                        }).join("\n");
                        const text = `🍛 *MoodBite AI Indian Recipe Assistant - Grocery Shopping List*:\n\n${items}\n\nGenerated on ${new Date().toLocaleDateString()}`;
                        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                        window.open(url, "_blank");
                        showToast("Opening WhatsApp... 📱", "success");
                      }}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-500 dark:text-emerald-400 rounded-lg cursor-pointer transition flex items-center justify-center"
                      title="Share to WhatsApp"
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ingredients compiled from all recipes inside your active weekly calendar schedule. Click on an item to check it off.
              </p>

              {/* Add Custom Shopping item form */}
              <form onSubmit={handleAddShoppingItem} className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Add groceries..."
                  value={newShoppingItem}
                  onChange={(e) => setNewShoppingItem(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="p-2 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl cursor-pointer transition"
                >
                  <Plus size={14} />
                </button>
              </form>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto pr-1">
                {weeklyPlan.shoppingList && weeklyPlan.shoppingList.length > 0 ? (
                  weeklyPlan.shoppingList.map((item, index) => {
                    const isChecked = weeklyPlan.checkedShoppingItems?.includes(item) || false;
                    return (
                      <div
                        key={index}
                        className="py-2.5 flex items-center justify-between text-sm text-slate-700 dark:text-slate-300 group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/10 px-1 rounded-lg"
                        onClick={() => toggleShoppingItemChecked(item)}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center text-[10px] transition-colors ${
                            isChecked 
                              ? "bg-emerald-500 border-emerald-500 text-white" 
                              : "border-slate-300 dark:border-slate-600 text-transparent bg-transparent"
                          }`}>
                            ✓
                          </div>
                          <span className={`text-xs font-medium transition-all ${
                            isChecked 
                              ? "line-through text-slate-400 dark:text-slate-500" 
                              : "text-slate-750 dark:text-slate-250"
                          }`}>
                            {item}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent checking/unchecking toggle
                            handleRemoveShoppingItem(index);
                          }}
                          className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer p-1"
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400 italic">
                    Shopping list is empty. Add meals to compile ingredients.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
