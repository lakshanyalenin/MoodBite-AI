import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Sparkles, Smile, Bot, Check } from "lucide-react";
import { ChatMessage, Meal } from "../types";

interface ChatBotProps {
  onViewRecipe: (meal: Meal) => void;
}

export default function ChatBot({ onViewRecipe }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello! I'm your MoodBite AI wellness coach. How are you feeling today? Tell me what you're craving, what's in your fridge, or ask for nutrition advice!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedPrompts = [
    "I have eggs.",
    "I want muscle gain.",
    "I have ₹100.",
    "I'm feeling stressed."
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: "u_" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-6), // Send last 6 messages as context
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: "a_" + Date.now(),
        sender: "assistant",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mealsSuggested: data.mealsSuggested,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat message error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer relative hover:shadow-emerald-500/20"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
        )}
      </motion.button>

      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-[360px] sm:w-[400px] h-[550px] glass-card rounded-[32px] shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold font-display text-sm">MoodBite Wellness AI</h4>
                  <span className="text-[10px] text-emerald-100 flex items-center gap-1">
                    <Sparkles size={8} /> Clinical assistant online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg cursor-pointer text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white/10 dark:bg-slate-950/20">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs shadow-sm ${
                      msg.sender === "user"
                        ? "bg-[#22C55E] text-white rounded-br-none"
                        : "bg-white/60 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 rounded-bl-none border border-white/50 dark:border-slate-800/40"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                    
                    {/* Render custom meal recommendations inside chatbot */}
                    {msg.mealsSuggested && msg.mealsSuggested.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-white/20 dark:border-slate-800/40 space-y-2">
                        <span className="text-[9px] font-mono font-bold text-amber-500 uppercase block">Suggested Meal:</span>
                        {msg.mealsSuggested.map((meal) => (
                          <div
                            key={meal.id}
                            onClick={() => onViewRecipe(meal)}
                            className="p-2 bg-white/40 dark:bg-slate-800/40 rounded-xl flex items-center gap-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 cursor-pointer transition border border-white/20 dark:border-slate-700/20"
                          >
                            <img src={meal.imageUrl} alt={meal.name} className="w-8 h-8 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-slate-800 dark:text-white truncate text-[11px]">{meal.name}</h5>
                              <span className="text-[9px] text-slate-400 font-mono">{meal.calories} kcal • {meal.cookingTime}m</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <span className={`text-[8px] font-mono block text-right mt-1.5 ${msg.sender === "user" ? "text-emerald-100" : "text-slate-400"}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/60 dark:bg-slate-900/60 border border-white/50 dark:border-slate-800/40 rounded-2xl rounded-bl-none p-3.5 text-xs text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested prompts footer chips */}
            {messages.length === 1 && (
              <div className="px-4 py-2 bg-white/20 dark:bg-slate-900/20 flex gap-1.5 overflow-x-auto scrollbar-none">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-2.5 py-1 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/20 text-[10px] text-slate-600 dark:text-slate-300 font-semibold rounded-lg whitespace-nowrap cursor-pointer hover:border-[#22C55E] hover:text-[#22C55E] transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Footer Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="p-3 bg-white/20 dark:bg-slate-900/20 border-t border-white/10 dark:border-slate-800/40 flex gap-2 items-center"
            >
              <input
                type="text"
                placeholder="Ask nutrition swap, recipes..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/20 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#22C55E] transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-white/20 dark:disabled:bg-slate-800/20 text-white disabled:text-slate-400 rounded-xl cursor-pointer transition"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
