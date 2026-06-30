import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Utensils, Heart, Salad } from "lucide-react";

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return 100;
        }
        return prev + 4;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 via-cream to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500 z-50 p-6">
      {/* Decorative Floating Food Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[15%] text-emerald-500/20 dark:text-emerald-400/10"
        >
          <Salad size={48} />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 15, 0], rotate: [0, -12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[25%] right-[15%] text-amber-500/20 dark:text-amber-400/10"
        >
          <Utensils size={44} />
        </motion.div>
        <motion.div 
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[60%] left-[25%] text-red-500/10 dark:text-red-400/5"
        >
          <Heart size={40} />
        </motion.div>
      </div>

      <div className="w-full max-w-sm text-center flex flex-col items-center">
        {/* Animated Brand Mascot Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/30 dark:shadow-emerald-950/40 relative mb-6"
        >
          <Utensils className="text-white w-12 h-12" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1.5 shadow"
          >
            <Sparkles className="text-white w-4 h-4" />
          </motion.div>
        </motion.div>

        {/* Application Name and Slogan */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold font-display tracking-tight text-slate-900 dark:text-white"
        >
          MoodBite <span className="text-emerald-500">AI</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-slate-500 dark:text-slate-400 font-sans mt-2 text-sm font-medium tracking-wide"
        >
          "Your Mood. Your Meal. Your Health."
        </motion.p>

        {/* Loading Indicator */}
        <div className="w-full mt-12 px-6">
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-500"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
            />
          </div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xs text-slate-400 dark:text-slate-500 mt-3 font-mono"
          >
            Synthesizing nutritional neural paths... {progress}%
          </motion.p>
        </div>
      </div>
    </div>
  );
}
