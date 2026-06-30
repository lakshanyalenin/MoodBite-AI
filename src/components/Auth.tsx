import React, { useState } from "react";
import { motion } from "motion/react";
import { LogIn, UserPlus, ArrowLeft, Mail, Lock, User, Sparkles } from "lucide-react";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "../lib/firebase";

interface AuthProps {
  onSuccess: (user: { email: string; name: string }) => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [view, setView] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("demo@moodbite.ai");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("Alex Carter");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Support Demo Mode instantly
    if (email === "demo@moodbite.ai" && password === "password123") {
      setTimeout(() => {
        setLoading(false);
        onSuccess({ email, name: "Demo User" });
      }, 800);
      return;
    }

    try {
      if (view === "login") {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const displayName = userCredential.user.displayName || email.split("@")[0];
        setLoading(false);
        onSuccess({ email, name: displayName });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // We can't set display name instantly without updateProfile, but we can store it or pass it.
        setLoading(false);
        setMessage({ type: "success", text: "Registered successfully! Signing you in..." });
        setTimeout(() => {
          onSuccess({ email, name: name });
        }, 1000);
      }
    } catch (err: any) {
      setLoading(false);
      let errorText = err.message || "An authentication error occurred.";
      if (err.code === "auth/user-not-found") {
        errorText = "No account found with this email.";
      } else if (err.code === "auth/wrong-password") {
        errorText = "Incorrect password. Please try again.";
      } else if (err.code === "auth/email-already-in-use") {
        errorText = "This email is already registered.";
      } else if (err.code === "auth/weak-password") {
        errorText = "Password should be at least 6 characters.";
      }
      setMessage({ type: "error", text: errorText });
    }
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({ email: "google.user@gmail.com", name: "Google Buddy" });
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-12 transition-colors duration-500 relative overflow-hidden">
      {/* Background Decor Circles */}
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-[#22C55E]/10 dark:bg-[#22C55E]/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-[#F59E0B]/10 dark:bg-[#F59E0B]/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <div className="w-full max-w-md bg-white/70 dark:bg-[#1E293B]/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 shadow-2xl relative z-10 transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-3">
            <Sparkles size={24} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            MoodBite <span className="text-[#22C55E]">AI</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {view === "login" 
              ? "Welcome back! Access your customized healthy plans." 
              : "Join us today and feel the magic of AI-driven nutrition."}
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl text-sm mb-6 ${
            message.type === "success" 
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20" 
              : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {view === "register" && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-450 dark:text-slate-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Carter"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-450 dark:text-slate-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-450 dark:text-slate-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:from-[#16A34A] hover:to-[#15803D] text-white font-semibold rounded-2xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : view === "login" ? (
              <>
                <LogIn size={18} /> Sign In
              </>
            ) : (
              <>
                <UserPlus size={18} /> Join MoodBite
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-3 bg-white dark:bg-[#1E293B] text-slate-500 dark:text-slate-400 transition-colors">
              Or continue with
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-medium rounded-2xl border border-slate-200 dark:border-slate-800 transition flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-.14 3.09-1.29 4.14l3.1 2.4c1.8-1.66 2.83-4.11 2.83-7.1h1.5z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.1-2.4c-.9.6-2.04.96-3.32.96-2.55 0-4.71-1.73-5.48-4.05L1.87 18a12 12 0 0 0 10.13 6z"
            />
            <path
              fill="#FBBC05"
              d="M6.52 14.73c-.21-.63-.33-1.3-.33-1.99s.12-1.36.33-2L1.87 7.05A12 12 0 0 0 1.87 19l4.65-4.27z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0 7.37 0 3.3 2.65 1.87 7.05l4.65 4.27c.77-2.32 2.93-4.57 5.48-4.57z"
            />
          </svg>
          Google Authenticator
        </button>

        <div className="text-center mt-8 text-xs text-slate-500 dark:text-slate-400">
          {view === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                onClick={() => setView("register")}
                className="text-[#22C55E] font-bold hover:underline bg-transparent border-none cursor-pointer"
              >
                Register Free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => setView("login")}
                className="text-[#22C55E] font-bold hover:underline bg-transparent border-none cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
