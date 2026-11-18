/* eslint-disable */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Trophy, Volume2 } from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useRewards } from "../../../rewardSystem/useRewards";
import { useAuth } from "../../../context/AuthContext";
import MascotGuide from "../../../components/explorer/MascotGuide";

const ROUNDS = [
  {
    type: "Number Sequencing",
    speech: "Can you put these numbers in the right order from 1 to 4?",
    items: [
      { id: "2", content: "2", color: "bg-pink-100 text-pink-700 border-pink-300" },
      { id: "4", content: "4", color: "bg-blue-100 text-blue-700 border-blue-300" },
      { id: "1", content: "1", color: "bg-green-100 text-green-700 border-green-300" },
      { id: "3", content: "3", color: "bg-amber-100 text-amber-700 border-amber-300" },
    ],
    correctOrder: ["1", "2", "3", "4"],
    theme: "indigo"
  },
  {
    type: "Picture Sequencing",
    speech: "How does a plant grow? Drag the pictures into the correct order!",
    items: [
      { id: "plant", content: "🌿", label: "Plant", color: "bg-emerald-50 text-emerald-700 border-emerald-300" },
      { id: "tree", content: "🌳", label: "Tree", color: "bg-emerald-50 text-emerald-700 border-emerald-300" },
      { id: "seed", content: "🌱", label: "Seed", color: "bg-emerald-50 text-emerald-700 border-emerald-300" },
    ],
    correctOrder: ["seed", "plant", "tree"],
    theme: "emerald"
  },
  {
    type: "Story Sequencing",
    speech: "What happens first? Help the egg become a chicken!",
    items: [
      { id: "chicken", content: "🐔", label: "Chicken", color: "bg-orange-50 text-orange-700 border-orange-300" },
      { id: "egg", content: "🐣", label: "Egg", color: "bg-orange-50 text-orange-700 border-orange-300" },
      { id: "chick", content: "🐥", label: "Chick", color: "bg-orange-50 text-orange-700 border-orange-300" },
    ],
    correctOrder: ["egg", "chick", "chicken"],
    theme: "orange"
  },
  {
    type: "Daily Routine",
    speech: "What do you do in the morning? Put the steps in order!",
    items: [
      { id: "school", content: "🎒", label: "Go To School", color: "bg-cyan-50 text-cyan-700 border-cyan-300" },
      { id: "breakfast", content: "🥞", label: "Eat Breakfast", color: "bg-cyan-50 text-cyan-700 border-cyan-300" },
      { id: "wake", content: "🛏️", label: "Wake Up", color: "bg-cyan-50 text-cyan-700 border-cyan-300" },
      { id: "teeth", content: "🪥", label: "Brush Teeth", color: "bg-cyan-50 text-cyan-700 border-cyan-300" },
    ],
    correctOrder: ["wake", "teeth", "breakfast", "school"],
    theme: "cyan"
  },
  {
    type: "Pattern Sequencing",
    speech: "Look at the pattern. Can you fix the order so it matches Star, Circle, Star, Circle?",
    items: [
      { id: "star1", content: "⭐", label: "Star", color: "bg-purple-50 text-purple-700 border-purple-300" },
      { id: "circle1", content: "🔵", label: "Circle", color: "bg-purple-50 text-purple-700 border-purple-300" },
      { id: "circle2", content: "🔵", label: "Circle", color: "bg-purple-50 text-purple-700 border-purple-300" },
      { id: "star2", content: "⭐", label: "Star", color: "bg-purple-50 text-purple-700 border-purple-300" },
    ],
    correctOrder: ["star1", "circle1", "star2", "circle2"],
    theme: "purple"
  }
];

const THEME_MAP = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-900", accent: "bg-indigo-500", border: "border-indigo-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-900", accent: "bg-emerald-500", border: "border-emerald-200" },
  orange: { bg: "bg-orange-50", text: "text-orange-900", accent: "bg-orange-500", border: "border-orange-200" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-900", accent: "bg-cyan-500", border: "border-cyan-200" },
  purple: { bg: "bg-purple-50", text: "text-purple-900", accent: "bg-purple-500", border: "border-purple-200" },
};

export default function SequencingActivity() {
  const navigate = useNavigate();
  const { awardActivity } = useRewards();
  const { user } = useAuth();

  const [roundIdx, setRoundIdx] = useState(0);
  const [items, setItems] = useState([]);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [attempts, setAttempts] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentRound = ROUNDS[roundIdx];
  const theme = currentRound ? THEME_MAP[currentRound.theme] : THEME_MAP.indigo;

  useEffect(() => {
    if (currentRound) {
      setItems(currentRound.items);
      const t = setTimeout(() => speak(currentRound.speech), 500);
      return () => clearTimeout(t);
    }
  }, [roundIdx]);

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(true);
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1.2;
    u.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(u);
  };

  const handleCheck = () => {
    if (isComplete) return;
    setAttempts(a => a + 1);

    const currentOrderIds = items.map(i => i.id);
    const isCorrect = currentRound.correctOrder.every((id, idx) => id === currentOrderIds[idx] || 
      // Special allowance for pattern matching where identical items can be swapped
      (currentRound.type === "Pattern Sequencing" && items[idx].content === ROUNDS[roundIdx].items.find(ri => ri.id === currentRound.correctOrder[idx]).content)
    );

    if (isCorrect) {
      setFeedback("correct");
      speak("Great Thinking! Excellent Order!");
      setTimeout(() => {
        setFeedback(null);
        if (roundIdx + 1 < ROUNDS.length) {
          setRoundIdx(r => r + 1);
        } else {
          finishActivity();
        }
      }, 2000);
    } else {
      setFeedback("wrong");
      speak("Almost There! Look Carefully!");
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const finishActivity = async () => {
    setIsComplete(true);
    setSaving(true);
    
    const totalDuration = Math.round((Date.now() - sessionStartTime) / 1000);
    // Best case is 1 attempt per round (5 total). 
    const minAttempts = ROUNDS.length;
    const accuracy = Math.round((minAttempts / Math.max(minAttempts, attempts + 1)) * 100);

    awardActivity({
      activityId: "/explorer/activity/sequencing",
      xpEarned: 20,
      starsEarned: 3,
      message: "Sequencing Master Badge Unlocked! 🧩",
      analytics: {
        accuracy: accuracy,
        completionTime: totalDuration,
      },
    });

    if (user?._id) {
      try {
        await fetch("http://localhost:5000/api/child-progress/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user._id,
            activityType: "sequencing",
            level: "Easy",
            accuracy: accuracy,
            attempts: attempts + 1,
            completionTime: totalDuration,
            completed: true,
          }),
        });
      } catch (err) {
        console.error("Failed to save progress", err);
      }
    }
    setSaving(false);
  };

  const reset = () => {
    setRoundIdx(0);
    setAttempts(0);
    setFeedback(null);
    setIsComplete(false);
    setItems(ROUNDS[0].items);
  };

  return (
    <div className={`min-h-screen ${theme.bg} p-6 flex flex-col items-center transition-colors duration-500`}>
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/explorer")}
          className={`flex items-center gap-2 ${theme.text} font-black hover:opacity-70 transition cursor-pointer bg-white/50 px-4 py-2 rounded-full shadow-sm border ${theme.border}`}
        >
          <ArrowLeft size={20} /> Back to Hub
        </button>
        <h1 className={`text-3xl md:text-4xl font-black ${theme.text} drop-shadow-sm`}>🧩 Sequencing Adventure</h1>
        <button
          onClick={reset}
          className={`flex items-center gap-2 ${theme.text} font-black hover:opacity-70 transition cursor-pointer bg-white/50 px-4 py-2 rounded-full shadow-sm border ${theme.border}`}
        >
          <RefreshCw size={20} /> Restart
        </button>
      </div>

      <div className={`bg-white/80 backdrop-blur-md rounded-[3rem] shadow-2xl border-4 ${theme.border} p-8 md:p-12 w-full max-w-3xl text-center relative overflow-hidden`}>
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-30 bg-white flex flex-col items-center justify-center p-6"
            >
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Trophy size={100} className="text-yellow-400 mb-6 drop-shadow-xl" />
              </motion.div>
              <h2 className="text-4xl font-black text-indigo-900 mb-4">Master of Order! 🧩</h2>
              <p className="text-xl text-gray-600 font-bold mb-8">You arranged all the items perfectly!</p>
              <div className="flex gap-4">
                <button onClick={reset} disabled={saving} className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-full font-black text-xl shadow-md transition transform hover:scale-105 cursor-pointer">
                  Play Again
                </button>
                <button onClick={() => navigate("/explorer")} disabled={saving} className="bg-indigo-100 text-indigo-700 px-8 py-4 rounded-full font-black text-xl transition cursor-pointer">
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {currentRound && !isComplete && (
          <>
            {/* Round info */}
            <div className="flex justify-between items-center mb-8">
              <button onClick={() => speak(currentRound.speech)} className={`bg-white shadow-sm border ${theme.border} p-3 rounded-full transition cursor-pointer hover:bg-gray-50`}>
                <Volume2 size={24} className={`${isPlaying ? "animate-pulse text-indigo-500" : theme.text}`} />
              </button>
              <span className={`bg-white shadow-sm border ${theme.border} ${theme.text} font-black px-5 py-2 rounded-full text-lg`}>
                Level {roundIdx + 1} / {ROUNDS.length}
              </span>
            </div>

            <h2 className={`text-3xl font-black ${theme.text} mb-2`}>{currentRound.type}</h2>
            <p className="text-gray-500 font-semibold mb-10 text-lg">Drag and drop the items into the correct order!</p>

            {/* Feedback Banner */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`absolute top-28 left-1/2 -translate-x-1/2 z-20 text-xl font-black px-8 py-4 rounded-full shadow-2xl ${
                    feedback === "correct" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {feedback === "correct" ? "🎉 Perfect! You solved it!" : "💫 Oops! Look carefully and try again!"}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Draggable Reorder Group */}
            <div className="mb-12 select-none">
              <Reorder.Group 
                axis="x" 
                values={items} 
                onReorder={setItems} 
                className="flex justify-center gap-4 flex-wrap md:flex-nowrap"
              >
                {items.map((item) => (
                  <Reorder.Item 
                    key={item.id} 
                    value={item} 
                    className="relative cursor-grab active:cursor-grabbing"
                    whileDrag={{ scale: 1.1, zIndex: 10, rotate: [-2, 2, -2] }}
                  >
                    <div className={`${item.color} border-4 w-28 h-36 md:w-32 md:h-40 rounded-3xl flex flex-col items-center justify-center shadow-lg transform transition hover:shadow-xl`}>
                      <span className="text-5xl md:text-6xl drop-shadow-md">{item.content}</span>
                      {item.label && <span className="absolute bottom-3 text-xs md:text-sm font-black opacity-70 uppercase tracking-widest">{item.label}</span>}
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>

            <button 
              onClick={handleCheck}
              disabled={feedback !== null}
              className={`${theme.accent} hover:opacity-90 text-white text-2xl font-black px-12 py-5 rounded-full shadow-xl transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Check Order
            </button>
          </>
        )}
      </div>
      {!isComplete && <MascotGuide mood={feedback === "wrong" ? "encouraging" : "happy"} message={feedback === "wrong" ? "Try swapping two items!" : "Drag them around!"} />}
    </div>
  );
}
