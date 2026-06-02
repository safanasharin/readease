/* eslint-disable */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Trophy, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRewards } from "../../../rewardSystem/useRewards";
import MascotGuide from "../../../components/explorer/MascotGuide";

const ROUNDS = [
  {
    prompt: "Which one looks different?",
    speech: "Look carefully! Which letter looks different from the others?",
    items: ["b", "b", "d", "b"],
    oddIndex: 2,
    color: "indigo",
  },
  {
    prompt: "Find the odd one out!",
    speech: "Can you spot the one that doesn't match?",
    items: ["p", "p", "p", "q"],
    oddIndex: 3,
    color: "pink",
  },
  {
    prompt: "Which shape is different?",
    speech: "Look at the shapes. Which one is different?",
    items: ["🔵", "🔵", "🔴", "🔵"],
    oddIndex: 2,
    color: "teal",
  },
  {
    prompt: "Spot the different letter!",
    speech: "Find the letter that doesn't belong!",
    items: ["m", "w", "m", "m"],
    oddIndex: 1,
    color: "violet",
  },
  {
    prompt: "Which emoji is different?",
    speech: "Find the one that is different!",
    items: ["⭐", "⭐", "⭐", "🌟"],
    oddIndex: 3,
    color: "amber",
  },
];

const COLOR_MAP = {
  indigo: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    card: "bg-white border-indigo-100",
    cardHover: "hover:border-indigo-400 hover:shadow-indigo-100",
    text: "text-indigo-700",
    badge: "bg-indigo-100 text-indigo-700",
    button: "bg-indigo-500 hover:bg-indigo-600 text-white",
    correct: "border-green-400 bg-green-50",
    wrong: "border-red-400 bg-red-50",
    title: "text-indigo-600",
  },
  pink: {
    bg: "bg-pink-50",
    border: "border-pink-200",
    card: "bg-white border-pink-100",
    cardHover: "hover:border-pink-400 hover:shadow-pink-100",
    text: "text-pink-700",
    badge: "bg-pink-100 text-pink-700",
    button: "bg-pink-500 hover:bg-pink-600 text-white",
    correct: "border-green-400 bg-green-50",
    wrong: "border-red-400 bg-red-50",
    title: "text-pink-600",
  },
  teal: {
    bg: "bg-teal-50",
    border: "border-teal-200",
    card: "bg-white border-teal-100",
    cardHover: "hover:border-teal-400 hover:shadow-teal-100",
    text: "text-teal-700",
    badge: "bg-teal-100 text-teal-700",
    button: "bg-teal-500 hover:bg-teal-600 text-white",
    correct: "border-green-400 bg-green-50",
    wrong: "border-red-400 bg-red-50",
    title: "text-teal-600",
  },
  violet: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    card: "bg-white border-violet-100",
    cardHover: "hover:border-violet-400 hover:shadow-violet-100",
    text: "text-violet-700",
    badge: "bg-violet-100 text-violet-700",
    button: "bg-violet-500 hover:bg-violet-600 text-white",
    correct: "border-green-400 bg-green-50",
    wrong: "border-red-400 bg-red-50",
    title: "text-violet-600",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    card: "bg-white border-amber-100",
    cardHover: "hover:border-amber-400 hover:shadow-amber-100",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
    button: "bg-amber-500 hover:bg-amber-600 text-white",
    correct: "border-green-400 bg-green-50",
    wrong: "border-red-400 bg-red-50",
    title: "text-amber-600",
  },
};

export default function VisualDiscriminationActivity() {
  const navigate = useNavigate();
  const { awardActivity } = useRewards();

  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong" | null
  const [mistakes, setMistakes] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [isPlaying, setIsPlaying] = useState(false);

  const currentRound = ROUNDS[round];
  const colors = COLOR_MAP[currentRound?.color || "indigo"];

  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(true);
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.8;
    u.pitch = 1.2;
    u.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    if (currentRound) {
      const t = setTimeout(() => speak(currentRound.speech), 500);
      return () => clearTimeout(t);
    }
  }, [round]);

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  const handleSelect = (index) => {
    if (feedback !== null || isComplete) return;
    setSelected(index);

    if (index === currentRound.oddIndex) {
      setFeedback("correct");
      speak("Amazing! You found it! Great detective work!");
      setTimeout(() => {
        setFeedback(null);
        setSelected(null);
        if (round + 1 < ROUNDS.length) {
          setRound((r) => r + 1);
        } else {
          setIsComplete(true);
          const totalDuration = Date.now() - sessionStartTime;
          const accuracy = Math.round(((ROUNDS.length) / (ROUNDS.length + mistakes)) * 100);
          awardActivity({
            activityId: "/explorer/activity/visual-detective",
            xpEarned: 15,
            starsEarned: 2,
            message: "Visual Detective Badge Unlocked! 🔍",
            analytics: {
              visualMistakes: mistakes,
              completionTime: totalDuration,
              accuracy: Math.max(0, Math.min(100, accuracy)),
            },
          });
        }
      }, 1800);
    } else {
      setMistakes((m) => m + 1);
      setFeedback("wrong");
      speak("Oops! Look more carefully. Try again!");
      setTimeout(() => {
        setFeedback(null);
        setSelected(null);
      }, 1500);
    }
  };

  const reset = () => {
    setRound(0);
    setSelected(null);
    setFeedback(null);
    setMistakes(0);
    setIsComplete(false);
  };

  return (
    <div className={`min-h-screen ${colors.bg} p-6 flex flex-col items-center`}>
      {/* Header */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/explorer")}
          className={`flex items-center gap-2 ${colors.text} font-black hover:opacity-70 transition cursor-pointer`}
        >
          <ArrowLeft size={20} /> Back to Hub
        </button>
        <h1 className={`text-3xl font-black ${colors.title}`}>🔍 Visual Detective</h1>
        <button
          onClick={reset}
          className={`flex items-center gap-2 ${colors.text} font-black hover:opacity-70 transition cursor-pointer`}
        >
          <RefreshCw size={20} /> Restart
        </button>
      </div>

      <div className={`bg-white rounded-[2.5rem] shadow-xl border-4 ${colors.border} p-8 md:p-12 w-full max-w-2xl text-center relative overflow-hidden`}>
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Trophy size={100} className="text-yellow-400 mb-6 drop-shadow-xl" />
              </motion.div>
              <h2 className={`text-4xl font-black ${colors.title} mb-4`}>
                Super Detective! 🔍
              </h2>
              <p className="text-xl text-gray-600 font-bold mb-8">
                You spotted all the differences! Amazing visual skills!
              </p>
              <div className="flex gap-4">
                <button
                  onClick={reset}
                  className={`${colors.button} px-8 py-4 rounded-full font-black text-xl shadow-md transition transform hover:scale-105 cursor-pointer`}
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate("/explorer")}
                  className={`${colors.badge} px-8 py-4 rounded-full font-black text-xl transition cursor-pointer`}
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {currentRound && !isComplete && (
          <>
            {/* Round badge + audio */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => speak(currentRound.speech)}
                className={`${colors.badge} p-3 rounded-full transition cursor-pointer`}
              >
                <Volume2 size={22} className={isPlaying ? "animate-pulse" : ""} />
              </button>
              <span className={`${colors.badge} font-black px-4 py-1.5 rounded-full text-sm`}>
                Round {round + 1} / {ROUNDS.length}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={round}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-black text-gray-800 mb-2">
                  {currentRound.prompt}
                </h2>
                <p className="text-gray-500 font-semibold mb-8">
                  Tap the one that looks different from the rest!
                </p>

                {/* Feedback banner */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className={`mb-6 text-lg font-black py-3 rounded-2xl ${
                        feedback === "correct"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {feedback === "correct" ? "🎉 Brilliant! That's it!" : "🌟 Almost! Try again!"}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Item Grid */}
                <div className="grid grid-cols-2 gap-5 max-w-sm mx-auto mb-10">
                  {currentRound.items.map((item, idx) => {
                    let cardClass = `${colors.card} border-4 ${colors.cardHover}`;
                    if (selected === idx) {
                      if (feedback === "correct") cardClass = `border-4 ${colors.correct}`;
                      else if (feedback === "wrong") cardClass = `border-4 ${colors.wrong}`;
                    }
                    return (
                      <motion.button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        whileHover={{ scale: feedback === null ? 1.06 : 1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`h-28 rounded-2xl ${cardClass} shadow text-5xl font-bold flex items-center justify-center transition-all cursor-pointer`}
                      >
                        {item}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-4">
              <MascotGuide activity="thinking" mood="happy" />
            </div>
          </>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {ROUNDS.map((_, i) => (
          <div
            key={i}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i < round
                ? `w-6 bg-green-400`
                : i === round
                ? `w-6 ${colors.button.split(" ")[0]}`
                : "w-2.5 bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
