import { useState } from "react";
import { Search, Heart, Clock, DollarSign, ArrowRight, Star, HeartCrack } from "lucide-react";
import { SavedRecipe, Meal } from "../types";

interface SavedRecipesViewProps {
  savedRecipes: SavedRecipe[];
  onToggleFavorite: (id: string) => void;
  onRemoveSaved: (id: string) => void;
  onViewRecipe: (meal: Meal) => void;
  onScheduleRecipe?: (meal: Meal) => void;
  onRateRecipe: (id: string, rating: number) => void;
  onCookAgain: (id: string) => void;
}

export default function SavedRecipesView({ 
  savedRecipes, 
  onToggleFavorite, 
  onRemoveSaved, 
  onViewRecipe, 
  onScheduleRecipe,
  onRateRecipe,
  onCookAgain,
}: SavedRecipesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Breakfast", "Lunch", "Dinner", "Healthy"];

  const filteredRecipes = savedRecipes.filter((item) => {
    const matchesSearch = item.meal.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeCategory === "All") return matchesSearch;
    if (activeCategory === "Healthy") {
      // Custom heuristic for healthy category: fiber is high or calories < 400
      return matchesSearch && (item.meal.calories < 400 || item.meal.fiber >= 8);
    }
    return matchesSearch && item.meal.category === activeCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header and filters */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-white">Your Saved Cookbooks</h2>
          <p className="text-xs text-slate-400">Recall your favourite AI recommendations, rate meals, and track your cook history.</p>
        </div>

        {/* Categories Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap cursor-pointer transition ${
                activeCategory === cat
                  ? "bg-[#22C55E] text-white shadow-md shadow-emerald-500/15"
                  : "bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-850/20 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-900/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search by meal name or main ingredient..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E] text-slate-800 dark:text-white transition-all"
        />
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="glass-card rounded-[32px] p-12 text-center flex flex-col items-center justify-center space-y-3">
          <HeartCrack size={40} className="text-slate-300" />
          <h4 className="font-bold text-slate-800 dark:text-white font-display">No Recipes Saved Yet</h4>
          <p className="text-xs text-slate-400 max-w-xs">
            Start scanning your fridge or sharing your mood to receive customized recommendations, then save them here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group border border-slate-100 dark:border-slate-800"
            >
              <div className="relative">
                <img
                  src={item.meal.imageUrl}
                  alt={item.meal.name}
                  className="w-full h-44 object-cover group-hover:scale-102 transition duration-500"
                />
                
                {/* Favorites Trigger button overlay */}
                <button
                  onClick={() => onToggleFavorite(item.id)}
                  className="absolute right-3.5 top-3.5 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full text-amber-500 hover:scale-110 transition cursor-pointer shadow-sm"
                >
                  <Heart size={16} fill={item.isFavorite ? "currentColor" : "none"} className={item.isFavorite ? "text-rose-500" : "text-slate-400"} />
                </button>

                {/* Cook Counter badge overlay */}
                {item.cookCount && item.cookCount > 0 ? (
                  <span className="absolute left-3.5 top-3.5 px-2 py-1 bg-emerald-500 text-white text-[10px] font-mono font-bold rounded-lg shadow-sm">
                    Cooked {item.cookCount}x 🍳
                  </span>
                ) : null}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#22C55E] uppercase font-bold tracking-wider">
                    <span>{item.meal.category}</span>
                    <span className="bg-white/30 dark:bg-slate-850/30 border border-white/20 dark:border-slate-800/10 px-1.5 py-0.5 rounded text-slate-400 font-bold">
                      {item.meal.difficulty}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-base group-hover:text-[#22C55E] transition line-clamp-1">
                    {item.meal.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2">{item.meal.reason}</p>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Interactive Stars Rating System */}
                  <div className="flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                    <span className="text-[10px] text-slate-400 font-medium">Your Rating:</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => onRateRecipe(item.id, star)}
                          className="hover:scale-125 transition cursor-pointer"
                        >
                          <Star
                            size={14}
                            className={
                              star <= (item.rating || 0)
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-300 hover:text-amber-300"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Meal attributes */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono font-semibold">
                    <div className="bg-white/30 dark:bg-slate-850/30 border border-white/20 dark:border-slate-800/10 p-1.5 rounded-xl text-slate-700 dark:text-slate-300">
                      <span className="text-[8px] text-slate-400 block font-normal">Protein</span>
                      {item.meal.protein}g
                    </div>
                    <div className="bg-white/30 dark:bg-slate-850/30 border border-white/20 dark:border-slate-800/10 p-1.5 rounded-xl text-slate-700 dark:text-slate-300">
                      <span className="text-[8px] text-slate-400 block font-normal">Carbs</span>
                      {item.meal.carbs}g
                    </div>
                    <div className="bg-white/30 dark:bg-slate-850/30 border border-white/20 dark:border-slate-800/10 p-1.5 rounded-xl text-slate-700 dark:text-slate-300">
                      <span className="text-[8px] text-slate-400 block font-normal">Calories</span>
                      {item.meal.calories} kcal
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onRemoveSaved(item.id)}
                      className="px-2.5 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/15 text-red-500 text-xs font-semibold rounded-xl cursor-pointer transition"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => onCookAgain(item.id)}
                      className="px-2.5 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/15 text-amber-600 text-xs font-bold rounded-xl cursor-pointer transition flex items-center justify-center gap-0.5"
                      title="Mark as cooked again!"
                    >
                      Cooked 🍳
                    </button>
                    {onScheduleRecipe && (
                      <button
                        onClick={() => onScheduleRecipe(item.meal)}
                        className="px-2.5 py-2 bg-[#22C55E]/10 hover:bg-[#22C55E] hover:text-white text-[#22C55E] text-xs font-bold rounded-xl cursor-pointer transition flex items-center justify-center"
                        title="Schedule to Weekly Planner"
                      >
                        Schedule
                      </button>
                    )}
                    <button
                      onClick={() => onViewRecipe(item.meal)}
                      className="flex-1 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition"
                    >
                      Recipe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
