"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiChevronDown, FiX, FiMapPin } from "react-icons/fi";

interface Recommendation {
  buildingId: number;
  score: number;
  reason: string;
  address: string;
  district: string;
  recommended?: boolean; // transient client-side flag
}

interface Message {
  sender: string;
  text: string;
  recommendations?: Recommendation[];
}

interface ChatResponse {
  sessionId: string;
  response: string;
  recommendations?: Recommendation[];
}

interface ChatBotProps {
  onRecommendationsUpdate?: (recommendations: Recommendation[]) => void;
}

export default function ChatBot({ onRecommendationsUpdate }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hello there! I'm your Eco Spirit. What kind of sustainable business are you dreaming about?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedIds, setRecommendedIds] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const cleanAIText = (text: string) =>
    text.replace(/```json[\s\S]*?```/g, "").trim();

  const saveRecommendationsToFile = async (recs: Recommendation[]) => {
    try {
      await fetch("/api/save-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendations: recs }),
      });
      console.log("Recommendations saved to public/recommendations.json");
    } catch (err) {
      console.error("Failed to save recommendations:", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = (await res.json()) as ChatResponse;

      const rawText = data.response || "✨ Let me think about that...";
      console.log("ChatBot received:", data);

      // mark recommended IDs transiently
      const newRecs =
        data.recommendations?.map((r) => ({
          ...r,
          recommended: true,
        })) || [];

      setRecommendedIds(
        new Set(newRecs.map((r) => r.buildingId)) // ephemeral storage
      );

      const botMessage: Message = {
        sender: "bot",
        text: cleanAIText(rawText),
        recommendations: newRecs,
      };

      setMessages((prev) => [...prev, botMessage]);

      if (newRecs.length) {
        await saveRecommendationsToFile(newRecs);
        if (onRecommendationsUpdate) onRecommendationsUpdate(newRecs);
      }

    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ I'm having trouble connecting right now. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AnimatePresence>
      {!isOpen ? (
        <motion.div
          key="launcher"
          layoutId="chatbox"
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ layout: { duration: 0.15, ease: "easeInOut" } }}
          className="fixed bottom-6 right-6 w-[340px] cursor-pointer select-none z-50 rounded-2xl border border-black shadow-xl px-5 py-4 text-gray-700 backdrop-blur-md"
          style={{
            background: "linear-gradient(145deg, #faf9f6 0%, #f4ede4 100%)",
          }}
        >
          <p className="text-sm text-gray-700 mb-1">
            Already have a business in mind?
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full shadow-md"></span>
              <p className="text-[15px] font-semibold text-emerald-800">
                Chat with your Eco Spirit
              </p>
            </div>
            <FiChevronDown className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            and get your dream location
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="chat"
          layoutId="chatbox"
          transition={{ layout: { duration: 0.15, ease: "easeInOut" } }}
          className="fixed bottom-6 right-6 w-[400px] h-[600px] rounded-3xl flex flex-col overflow-hidden z-50 backdrop-blur-2xl border-2 border-emerald-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)]"
          style={{
            background: "linear-gradient(145deg, #ffffff 0%, #f6f4ef 100%)",
          }}
        >
          {/* Header */}
          <motion.div
            layout
            className="flex items-center justify-between px-4 py-3 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50 text-gray-800 shadow-sm"
          >
            <span className="font-semibold text-lg tracking-tight">
              Eco Spirit
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 hover:text-emerald-600 transition"
            >
              <FiX size={18} />
            </button>
          </motion.div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-300/50">
            {messages.map((msg, i) => {
              const cleanedText = msg.text.replace(/```json[\s\S]*?```/g, "").trim();
              return (
                <div key={i}>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === "bot"
                      ? "bg-white border border-emerald-100 text-gray-800 self-start"
                      : "bg-gradient-to-br from-emerald-400 to-green-500 text-white ml-auto"
                      }`}
                  >
                    {cleanedText}
                  </motion.div>

                  {/* Recommendation cards */}
                  {msg.recommendations &&
                    msg.recommendations.map((rec) => (
                      <motion.div
                        key={rec.buildingId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.03 }}
                        className={`mt-2 border rounded-xl p-3 transition-all ${rec.recommended
                          ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300"
                          : "bg-gray-50 border-gray-200"
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-2 flex-1">
                            <FiMapPin
                              className="text-emerald-600 mt-0.5 flex-shrink-0"
                              size={14}
                            />
                            <div>
                              <p className="font-semibold text-gray-800 text-sm leading-tight">
                                {rec.address}
                              </p>
                              <p className="text-emerald-700 text-xs mt-0.5">
                                {rec.district}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-emerald-700 font-bold text-lg">
                              {rec.score}
                            </span>
                            <span className="text-gray-500 text-[10px] block">
                              score
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 text-xs mt-2 pl-5">
                          {rec.reason}
                        </p>
                      </motion.div>
                    ))}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Modern Input Bar */}
          <div className="border-t border-emerald-100 bg-white px-3 py-3">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full pl-4 pr-2 py-1.5 focus-within:ring-2 focus-within:ring-emerald-400 transition-all">
              <input
                type="text"
                placeholder="Ask your Eco Spirit..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && sendMessage()}
                disabled={isLoading}
                className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 text-sm px-2 focus:outline-none disabled:opacity-50"
              />
              <motion.button
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                whileTap={{ scale: isLoading ? 1 : 0.95 }}
                onClick={sendMessage}
                disabled={isLoading}
                className={`p-2 rounded-full shadow transition-all ${input
                  ? "bg-gradient-to-br from-emerald-400 to-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
                  }`}
              >
                <FiSend size={18} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
