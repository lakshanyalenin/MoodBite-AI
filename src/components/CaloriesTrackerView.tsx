import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Flame,
  Droplet,
  Dumbbell,
  Calculator,
  Plus,
  Minus,
  Apple,
  TrendingUp,
  Award,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { DailyLog } from "../types";
import { MOCK_CHARTS_DATA } from "../data";

interface CaloriesTrackerViewProps {
  log: DailyLog;
  onUpdateLog: (updated: DailyLog) => void;
}

export default function CaloriesTrackerView({ log, onUpdateLog }: CaloriesTrackerViewProps) {
  const [chartMode, setChartMode] = useState<"weekly" | "monthly">("weekly");
  const [bmiHeight, setBmiHeight] = useState<string>("178");
  const [bmiWeight, setBmiWeight] = useState<string>("72");
  const [bmiResult, setBmiResult] = useState<{ bmi: number; category: string } | null>({
    bmi: 22.7,
    category: "Normal",
  });

  const handleCalculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(bmiHeight) / 100;
    const w = parseFloat(bmiWeight);
    if (h > 0 && w > 0) {
      const bmi = parseFloat((w / (h * h)).toFixed(1));
      let category = "Normal";
      if (bmi < 18.5) category = "Underweight";
      else if (bmi >= 25 && bmi < 29.9) category = "Overweight";
      else if (bmi >= 30) category = "Obese";
      setBmiResult({ bmi, category });
    }
  };

  const handleWaterChange = (amount: number) => {
    const updated = {
      ...log,
      waterIntake: Math.max(0, log.waterIntake + amount),
    };
    onUpdateLog(updated);
  };

  // Calculating overall health score based on hydration progress and calorie ratios
  const calPercent = Math.min(100, Math.round((log.caloriesConsumed / log.caloriesTarget) * 100));
  const waterPercent = Math.min(100, Math.round((log.waterIntake / log.waterTarget) * 100));
  const macroBalancedPercent = Math.min(
    100,
    Math.round(
      ((log.proteinConsumed / log.proteinTarget +
        log.carbsConsumed / log.carbsTarget +
        log.fatConsumed / log.fatTarget) /
        3) *
        100
    )
  );

  const healthScore = Math.round(calPercent * 0.4 + waterPercent * 0.3 + macroBalancedPercent * 0.3);

  const chartData = chartMode === "weekly" ? MOCK_CHARTS_DATA.weekly : MOCK_CHARTS_DATA.monthly;

  return (
    <div className="space-y-6">
      {/* Health Score Overview Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Health Score Badge */}
        <div className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-[32px] p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
            <Award size={160} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100 block">Daily Health Index</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-extrabold font-mono tracking-tight">{healthScore}</span>
              <span className="text-emerald-100 text-sm font-medium">/ 100</span>
            </div>
            <p className="text-xs text-emerald-50/80 mt-2 max-w-[200px]">
              {healthScore >= 80 ? "Superb alignment of water, calories and proteins!" : "Keep logging to reach your targets."}
            </p>
          </div>
          <div className="mt-4 flex gap-1.5 items-center bg-white/10 w-fit px-3 py-1.5 rounded-full text-xs font-mono">
            🔥 Streaks: {log.streak} Days
          </div>
        </div>

        {/* Circular Gauges for Calories */}
        <div className="glass-card rounded-[32px] p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 font-display">
              <Flame size={18} className="text-amber-500" />
              Calories Energy
            </span>
            <span className="text-xs font-mono text-slate-400">
              {calPercent}%
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold font-mono text-slate-800 dark:text-white">
              {log.caloriesConsumed}
            </span>
            <span className="text-xs text-slate-400">/ {log.caloriesTarget} kcal</span>
          </div>
          <div className="w-full bg-slate-100/50 dark:bg-slate-800/50 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${calPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Circular Hydration Widget */}
        <div className="glass-card rounded-[32px] p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 font-display">
              <Droplet size={18} className="text-cyan-500" />
              Hydration Balance
            </span>
            <span className="text-xs font-mono text-slate-400">
              {waterPercent}%
            </span>
          </div>
          <div className="my-3 flex justify-between items-center">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-slate-800 dark:text-white">
                {log.waterIntake}
              </span>
              <span className="text-xs text-slate-400">/ {log.waterTarget} ml</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleWaterChange(-250)}
                className="p-1.5 bg-white/30 hover:bg-white/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer border border-white/40 dark:border-slate-700/30 transition"
              >
                <Minus size={14} />
              </button>
              <button
                onClick={() => handleWaterChange(250)}
                className="p-1.5 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/30 text-cyan-500 rounded-lg cursor-pointer transition"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="w-full bg-slate-100/50 dark:bg-slate-800/50 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${waterPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Macros Detailed Sub-card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Protein */}
        <div className="p-4 glass-card rounded-2xl">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Protein</span>
          <div className="text-xl font-bold font-mono text-slate-800 dark:text-white mt-1">
            {log.proteinConsumed}g <span className="text-xs text-slate-400 font-normal">/ {log.proteinTarget}g</span>
          </div>
          <div className="w-full bg-slate-100/50 dark:bg-slate-800/50 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-[#22C55E]" style={{ width: `${Math.min(100, (log.proteinConsumed / log.proteinTarget) * 100)}%` }}></div>
          </div>
        </div>
        {/* Carbs */}
        <div className="p-4 glass-card rounded-2xl">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Carbs</span>
          <div className="text-xl font-bold font-mono text-slate-800 dark:text-white mt-1">
            {log.carbsConsumed}g <span className="text-xs text-slate-400 font-normal">/ {log.carbsTarget}g</span>
          </div>
          <div className="w-full bg-slate-100/50 dark:bg-slate-800/50 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, (log.carbsConsumed / log.carbsTarget) * 100)}%` }}></div>
          </div>
        </div>
        {/* Fat */}
        <div className="p-4 glass-card rounded-2xl">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Fat</span>
          <div className="text-xl font-bold font-mono text-slate-800 dark:text-white mt-1">
            {log.fatConsumed}g <span className="text-xs text-slate-400 font-normal">/ {log.fatTarget}g</span>
          </div>
          <div className="w-full bg-slate-100/50 dark:bg-slate-800/50 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-rose-400" style={{ width: `${Math.min(100, (log.fatConsumed / log.fatTarget) * 100)}%` }}></div>
          </div>
        </div>
        {/* Fiber */}
        <div className="p-4 glass-card rounded-2xl">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Fiber</span>
          <div className="text-xl font-bold font-mono text-slate-800 dark:text-white mt-1">
            {log.fiberConsumed}g <span className="text-xs text-slate-400 font-normal">/ {log.fiberTarget}g</span>
          </div>
          <div className="w-full bg-slate-100/50 dark:bg-slate-800/50 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-indigo-400" style={{ width: `${Math.min(100, (log.fiberConsumed / log.fiberTarget) * 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Analytical Charts View & BMI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historic Energy Charts Panel */}
        <div className="lg:col-span-2 glass-card rounded-[32px] p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold font-display text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-[#22C55E]" />
                Historic Performance
              </h3>
              <p className="text-xs text-slate-500">Track your average intake compliance.</p>
            </div>
            <div className="flex bg-white/30 dark:bg-slate-800/40 p-1 border border-white/40 dark:border-slate-700/20 rounded-xl">
              <button
                onClick={() => setChartMode("weekly")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer transition ${chartMode === "weekly" ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm" : "text-slate-400"}`}
              >
                Weekly
              </button>
              <button
                onClick={() => setChartMode("monthly")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer transition ${chartMode === "monthly" ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm" : "text-slate-400"}`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="h-[240px] w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
                <Area type="monotone" dataKey="calories" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorCals)" name="Calories (kcal)" />
                <Area type="monotone" dataKey="water" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorWater)" name="Water (ml)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BMI Calculator Widget */}
        <div className="glass-card rounded-[32px] p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold font-display text-slate-800 dark:text-white flex items-center gap-2">
              <Calculator size={18} className="text-[#22C55E]" />
              Smart BMI Calculator
            </h3>
            <p className="text-xs text-slate-500">Find your ideal weight index in seconds.</p>
 
            <form onSubmit={handleCalculateBMI} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase">Height (cm)</label>
                  <input
                    type="number"
                    value={bmiHeight}
                    onChange={(e) => setBmiHeight(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/20 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase">Weight (kg)</label>
                  <input
                    type="number"
                    value={bmiWeight}
                    onChange={(e) => setBmiWeight(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/20 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#22C55E] text-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-white/50 hover:bg-[#22C55E]/20 dark:bg-slate-800/50 hover:dark:bg-[#22C55E]/20 border border-white/50 dark:border-slate-700/20 text-slate-800 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition"
              >
                Recalculate
              </button>
            </form>
          </div>
 
          {bmiResult && (
            <div className="mt-4 p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-white/20 dark:border-slate-800/10 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono uppercase tracking-wider block">Your BMI</span>
                <span className="text-2xl font-black font-mono text-slate-800 dark:text-white mt-0.5 block">{bmiResult.bmi}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Category</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">{bmiResult.category}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
