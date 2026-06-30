import React, { useState } from "react";
import { motion } from "motion/react";
import { Users, Plus, ShieldAlert, Sparkles, Trash2, Heart, Apple, CheckCircle } from "lucide-react";
import { FamilyMember } from "../types";

interface FamilyModeViewProps {
  familyMembers: FamilyMember[];
  onAddMember: (member: FamilyMember) => void;
  onRemoveMember: (id: string) => void;
}

interface FamilyRecommendation {
  breakfast: { name: string; description: string; alternatives: { member: string; alternative: string }[] };
  lunch: { name: string; description: string; alternatives: { member: string; alternative: string }[] };
  dinner: { name: string; description: string; alternatives: { member: string; alternative: string }[] };
}

export default function FamilyModeView({ familyMembers, onAddMember, onRemoveMember }: FamilyModeViewProps) {
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<FamilyRecommendation | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for new member
  const [name, setName] = useState("");
  const [age, setAge] = useState("25");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [healthGoal, setHealthGoal] = useState("Weight Loss");
  const [diet, setDiet] = useState("None");
  const [allergies, setAllergies] = useState("");
  const [conditions, setConditions] = useState("");

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const newMember: FamilyMember = {
        id: "f_" + Date.now(),
        name,
        age: parseInt(age),
        gender,
        weight: parseFloat(weight),
        height: parseFloat(height),
        healthGoal,
        diet,
        conditions: conditions ? conditions.split(",").map(s => s.trim()) : [],
        allergies: allergies ? allergies.split(",").map(s => s.trim()) : [],
      };
      onAddMember(newMember);
      setShowAddForm(false);
      // Reset form
      setName("");
      setAllergies("");
      setConditions("");
    }
  };

  const handleGenerateFamilyMeals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/family-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyMembers }),
      });
      const data = await res.json();
      setProposal(data);
    } catch (err) {
      console.error("Error generating family recommendation:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-[#16A34A] rounded-[32px] p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold font-display">Family Mode Dashboard</h2>
            <p className="text-amber-50/80 text-sm mt-1 max-w-md">
              Create combined dietary plans. Auto-safeguard meals with customized member-specific ingredients alternatives.
            </p>
          </div>
          <button
            onClick={handleGenerateFamilyMeals}
            disabled={loading || familyMembers.length === 0}
            className="px-6 py-3 bg-white text-emerald-600 hover:bg-amber-50 font-semibold rounded-2xl transition shadow-md flex items-center gap-2 cursor-pointer text-sm"
          >
            <Sparkles size={16} />
            {loading ? "Matching Allergies..." : "Create Safe Family Plan"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: Family Member Cards List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white font-display">Family Profiles</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <Plus size={14} /> Add Member
            </button>
          </div>

          {showAddForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              onSubmit={handleCreateProfile}
              className="glass-card rounded-[24px] p-5 space-y-3 shadow-md"
            >
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Lucy Carter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/20 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Age</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full mt-1 px-2 py-1.5 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/20 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Gender</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full mt-1 px-1 py-1.5 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/20 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-800 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Weight (kg)</label>
                  <input
                    type="number"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full mt-1 px-2 py-1.5 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/20 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Diet</label>
                  <select
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                    className="w-full mt-1 px-2 py-1.5 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/20 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-800 dark:text-white"
                  >
                    <option value="None">None</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Keto">Keto</option>
                    <option value="Paleo">Paleo</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Goal</label>
                  <input
                    type="text"
                    required
                    value={healthGoal}
                    onChange={(e) => setHealthGoal(e.target.value)}
                    placeholder="Muscle Gain"
                    className="w-full mt-1 px-2 py-1.5 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/20 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase">Allergies (comma separated)</label>
                <input
                  type="text"
                  placeholder="Peanuts, Gluten"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/20 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase">Conditions (comma separated)</label>
                <input
                  type="text"
                  placeholder="Diabetes, Acidity"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/20 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer text-center"
                >
                  Save Profile
                </button>
              </div>
            </motion.form>
          )}

          <div className="space-y-3">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 glass-card rounded-2xl relative shadow-sm hover:border-[#22C55E] transition-all"
              >
                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="absolute right-3 top-3 text-slate-300 hover:text-red-500 transition cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
                <h4 className="font-bold text-slate-800 dark:text-white">{member.name}</h4>
                <div className="flex gap-3 text-[10px] text-slate-400 font-mono mt-1">
                  <span>Age: {member.age}</span>
                  <span>{member.gender}</span>
                  <span>{member.weight} kg</span>
                  <span>{member.height} cm</span>
                </div>

                <div className="mt-2.5 space-y-1">
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-medium">Goal: {member.healthGoal}</span>
                    {member.diet !== "None" && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-medium">Diet: {member.diet}</span>
                    )}
                  </div>
                  {member.allergies.length > 0 && (
                    <div className="flex gap-1 text-[10px] text-red-500 font-bold items-center mt-1">
                      <ShieldAlert size={10} /> Allergies: {member.allergies.join(", ")}
                    </div>
                  )}
                  {member.conditions.length > 0 && (
                    <div className="text-[10px] text-amber-500 font-medium">
                      Conditions: {member.conditions.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Custom Family Plan Proposal */}
        <div className="lg:col-span-2">
          {loading && (
            <div className="glass-card rounded-[32px] p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
              <h3 className="text-lg font-bold font-display text-slate-800 dark:text-white">Synthesizing Allergy-Safe Family Plate...</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Gemini is auditing every single ingredient swap against medical files, ensuring no allergen crosses the kitchen.
              </p>
            </div>
          )}

          {!loading && !proposal && (
            <div className="glass-card rounded-[32px] p-12 text-center flex flex-col items-center justify-center space-y-3">
              <Users size={40} className="text-slate-400" />
              <h4 className="font-bold text-slate-800 dark:text-white font-display">No Family Meal Proposal Created</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Click "Create Safe Family Plan" above to generate a perfectly balanced daily breakfast, lunch, and dinner list with customized alternative suggestions.
              </p>
            </div>
          )}

          {proposal && !loading && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white font-display flex items-center gap-2">
                <CheckCircle size={18} className="text-[#22C55E]" />
                Your AI Family Meal Recommendations
              </h3>

              {/* Breakfast, Lunch, Dinner Blocks */}
              {["breakfast", "lunch", "dinner"].map((mealKey) => {
                const mealData = (proposal as any)[mealKey];
                if (!mealData) return null;
                return (
                  <motion.div
                    key={mealKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 glass-card rounded-2xl shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono uppercase tracking-wider font-extrabold text-amber-500 block">
                        {mealKey}
                      </span>
                      <Apple size={16} className="text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-base">{mealData.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{mealData.description}</p>
                    </div>

                    {/* Member Specific alternatives warning */}
                    {mealData.alternatives && mealData.alternatives.length > 0 && (
                      <div className="mt-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-wide flex items-center gap-1">
                          <ShieldAlert size={10} /> Safe Substitutions Needed:
                        </span>
                        {mealData.alternatives.map((alt: any, i: number) => (
                          <div key={i} className="text-xs text-slate-600 dark:text-slate-400">
                            <strong className="text-slate-800 dark:text-white">{alt.member}:</strong> {alt.alternative}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
