import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, Plus, Calendar, AlertTriangle, ArrowRight, Trash2, CookingPot, Sparkles } from "lucide-react";
import { PantryItem, Meal } from "../types";

interface PantryViewProps {
  pantryItems: PantryItem[];
  onAddItem: (item: PantryItem) => void;
  onRemoveItem: (id: string) => void;
  onViewRecipe: (meal: Meal) => void;
}

export default function PantryView({ pantryItems, onAddItem, onRemoveItem, onViewRecipe }: PantryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiRecipe, setAiRecipe] = useState<Meal | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("200g");
  const [expiryDate, setExpiryDate] = useState("2026-07-05");
  const [category, setCategory] = useState("Vegetables");

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const newItem: PantryItem = {
        id: "p_" + Date.now(),
        name,
        quantity,
        expiryDate,
        category,
      };
      onAddItem(newItem);
      setShowAddForm(false);
      setName("");
    }
  };

  const getExpiryDays = (dateStr: string) => {
    const exp = new Date(dateStr);
    const today = new Date("2026-06-29"); // Use fixed current metadata date for matching consistency
    const diff = exp.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const handleCookFromPantry = async () => {
    setLoading(true);
    setAiRecipe(null);
    try {
      // Get expiring items to cook
      const expiringList = pantryItems.slice(0, 3).map(i => i.name);
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: "Excited",
          weather: "Sunny",
          ingredients: expiringList,
        }),
      });
      const data = await res.json();
      setAiRecipe(data);
    } catch (err) {
      console.error("Pantry recipe recommendation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = pantryItems.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-500 to-[#16A34A] rounded-[32px] p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display">Smart AI Pantry</h2>
          <p className="text-emerald-50/80 text-sm mt-1 max-w-sm">
            Log raw goods and track expiration. Generate custom, zero-waste recipes using ingredients before they expire.
          </p>
        </div>
        <button
          onClick={handleCookFromPantry}
          disabled={loading || pantryItems.length === 0}
          className="px-6 py-3 bg-white text-emerald-600 hover:bg-emerald-50 font-semibold rounded-2xl transition shadow-md flex items-center gap-2 cursor-pointer text-sm"
        >
          <CookingPot size={16} />
          {loading ? "Matching Ingredients..." : "Cook from Expiring Items"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: Pantry List and Add Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search ingredients in your pantry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E] text-slate-800 dark:text-white transition-all"
              />
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 text-sm cursor-pointer transition"
            >
              <Plus size={16} /> Add Ingredient
            </button>
          </div>

          {showAddForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              onSubmit={handleCreateItem}
              className="p-5 glass-card rounded-[24px] grid grid-cols-1 md:grid-cols-4 gap-3 shadow-md"
            >
              <div>
                <label className="text-[10px] text-slate-400 font-semibold uppercase">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="Cherry Tomatoes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/20 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-semibold uppercase">Quantity</label>
                <input
                  type="text"
                  required
                  placeholder="250g or 2 Liters"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/20 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-semibold uppercase">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/20 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-800 dark:text-white"
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 px-2 py-2 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/20 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-800 dark:text-white"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains & Pulses">Grains & Pulses</option>
                    <option value="Meats & Protein">Meats & Protein</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#22C55E] text-white text-xs font-semibold rounded-xl h-[36px] hover:bg-[#16A34A] transition cursor-pointer"
                >
                  Save
                </button>
              </div>
            </motion.form>
          )}

          {/* Pantry Cards list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const daysLeft = getExpiryDays(item.expiryDate);
              const isExpiringSoon = daysLeft <= 3;
              const isExpired = daysLeft < 0;

              return (
                <div
                  key={item.id}
                  className="p-4 glass-card rounded-2xl flex justify-between items-center relative hover:border-[#22C55E] transition-all shadow-sm"
                >
                  <div>
                    <span className="text-[9px] font-mono bg-slate-50 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-slate-800 dark:text-white mt-1">{item.name}</h4>
                    <div className="flex gap-3 text-[10px] text-slate-400 font-mono mt-1">
                      <span>Qty: {item.quantity}</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} /> Exp: {item.expiryDate}
                      </span>
                    </div>

                    <div className="mt-2.5">
                      {isExpired ? (
                        <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-bold">
                          Expired
                        </span>
                      ) : isExpiringSoon ? (
                        <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold flex items-center gap-1 w-fit">
                          <AlertTriangle size={10} /> Expires in {daysLeft} Days
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold">
                          Fresh ({daysLeft} days left)
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Zero Waste Chef Panel */}
        <div className="lg:col-span-1">
          {loading && (
            <div className="glass-card rounded-[32px] p-8 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
              <h4 className="font-bold text-slate-800 dark:text-white font-display">Simulating Recipe Fusion...</h4>
              <p className="text-xs text-slate-500">Gemini AI is finding ideal macro pairings to prevent waste.</p>
            </div>
          )}

          {!loading && !aiRecipe && (
            <div className="glass-card rounded-[32px] p-8 text-center flex flex-col items-center justify-center space-y-3">
              <CookingPot size={36} className="text-slate-400" />
              <h4 className="font-bold text-slate-800 dark:text-white font-display">Zero-Waste suggestions</h4>
              <p className="text-xs text-slate-500">
                Click "Cook from Expiring Items" to request Gemini to invent delicious recipes utilizing your active pantry.
              </p>
            </div>
          )}

          {aiRecipe && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-[32px] overflow-hidden shadow-md flex flex-col"
            >
              <img
                src={aiRecipe.imageUrl}
                alt={aiRecipe.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-5 space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-emerald-500 uppercase font-bold tracking-wider">
                    AI Expiring Solution
                  </span>
                  <h4 className="font-bold text-lg text-slate-800 dark:text-white mt-1">
                    {aiRecipe.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">
                    {aiRecipe.reason}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono font-bold">
                  <div className="bg-white/30 dark:bg-slate-850/30 border border-white/20 dark:border-slate-800/10 p-2 rounded-xl">
                    <span className="text-[9px] text-slate-400 block font-normal">Calories</span>
                    {aiRecipe.calories} kcal
                  </div>
                  <div className="bg-white/30 dark:bg-slate-850/30 border border-white/20 dark:border-slate-800/10 p-2 rounded-xl">
                    <span className="text-[9px] text-slate-400 block font-normal">Cooking</span>
                    {aiRecipe.cookingTime} Min
                  </div>
                </div>

                <button
                  onClick={() => onViewRecipe(aiRecipe)}
                  className="w-full py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-semibold rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  View Full Recipe <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
