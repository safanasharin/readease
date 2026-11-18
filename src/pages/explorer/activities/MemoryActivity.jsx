import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Trophy, Clock, Target, Star, Puzzle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import MascotGuide from "../../../components/explorer/MascotGuide";

// --- DATA SETS ---
const LETTER_MATCH = [
  { id: 'L1', a: 'A', b: 'A' }, { id: 'L2', a: 'B', b: 'B' }, { id: 'L3', a: 'C', b: 'C' },
  { id: 'L4', a: 'D', b: 'D' }, { id: 'L5', a: 'E', b: 'E' }, { id: 'L6', a: 'F', b: 'F' },
  { id: 'L7', a: 'G', b: 'G' }, { id: 'L8', a: 'H', b: 'H' }, { id: 'L9', a: 'M', b: 'M' },
  { id: 'L10', a: 'S', b: 'S' }
];

const PICTURE_MATCH = [
  { id: 'P1', a: '🐶', b: '🐶' }, { id: 'P2', a: '🐱', b: '🐱' }, { id: 'P3', a: '🐰', b: '🐰' },
  { id: 'P4', a: '🦊', b: '🦊' }, { id: 'P5', a: '🐻', b: '🐻' }, { id: 'P6', a: '🐼', b: '🐼' },
  { id: 'P7', a: '🍎', b: '🍎' }, { id: 'P8', a: '☀️', b: '☀️' }, { id: 'P9', a: '🚗', b: '🚗' },
  { id: 'P10', a: '🎈', b: '🎈' }
];

const LETTER_PICTURE_MATCH = [
  { id: 'LP1', a: 'A', b: '🍎' }, { id: 'LP2', a: 'B', b: '🐻' }, { id: 'LP3', a: 'C', b: '🐱' },
  { id: 'LP4', a: 'D', b: '🐶' }, { id: 'LP5', a: 'S', b: '☀️' }, { id: 'LP6', a: 'R', b: '🐰' },
  { id: 'LP7', a: 'F', b: '🦊' }, { id: 'LP8', a: 'P', b: '🐼' }, { id: 'LP9', a: 'C', b: '🚗' },
  { id: 'LP10', a: 'B', b: '🎈' }
];

const WORD_PICTURE_MATCH = [
  { id: 'WP1', a: 'DOG', b: '🐶' }, { id: 'WP2', a: 'CAT', b: '🐱' }, { id: 'WP3', a: 'SUN', b: '☀️' },
  { id: 'WP4', a: 'APPLE', b: '🍎' }, { id: 'WP5', a: 'BEAR', b: '🐻' }, { id: 'WP6', a: 'FOX', b: '🦊' },
  { id: 'WP7', a: 'CAR', b: '🚗' }, { id: 'WP8', a: 'BUG', b: '🐛' }, { id: 'WP9', a: 'COW', b: '🐄' },
  { id: 'WP10', a: 'PIG', b: '🐖' }
];

const TYPES = [LETTER_MATCH, PICTURE_MATCH, LETTER_PICTURE_MATCH, WORD_PICTURE_MATCH];

export default function MemoryActivity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [level, setLevel] = useState(null); // 'Easy', 'Medium', 'Hard'
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [time, setTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const timerRef = useRef(null);

  // Stop Timer
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Start Level
  const startLevel = (selectedLevel) => {
    stopTimer();
    setLevel(selectedLevel);
    setAttempts(0);
    setMatchedIds([]);
    setFlippedIndices([]);
    setIsComplete(false);
    setTime(0);

    let pairsCount = 4;
    if (selectedLevel === "Medium") pairsCount = 6;
    if (selectedLevel === "Hard") pairsCount = 8;

    // Pick random Type
    const selectedType = TYPES[Math.floor(Math.random() * TYPES.length)];
    
    // Shuffle and slice pairs
    const shuffledSource = [...selectedType].sort(() => Math.random() - 0.5);
    const selectedPairs = shuffledSource.slice(0, pairsCount);

    // Create deck
    const deck = [];
    selectedPairs.forEach(pair => {
      deck.push({ id: Math.random().toString(), matchId: pair.id, content: pair.a });
      deck.push({ id: Math.random().toString(), matchId: pair.id, content: pair.b });
    });

    // Shuffle deck
    setCards(deck.sort(() => Math.random() - 0.5));

    // Start Timer
    timerRef.current = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
  };

  // Cleanup Timer on Unmount
  useEffect(() => {
    return () => stopTimer();
  }, []);

  // Audio Feedback
  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1.2;
    window.speechSynthesis.speak(u);
  };

  // Handle Card Click
  const handleCardClick = (index) => {
    if (isChecking) return;
    if (flippedIndices.includes(index) || matchedIds.includes(cards[index].matchId)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsChecking(true);
      setAttempts(prev => prev + 1);

      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];

      if (firstCard.matchId === secondCard.matchId) {
        // MATCH!
        setTimeout(() => {
          setMatchedIds(prev => {
            const updatedMatches = [...prev, firstCard.matchId];
            
            // Check win condition
            if (updatedMatches.length === cards.length / 2) {
              handleWin(updatedMatches.length, attempts + 1);
            }
            
            return updatedMatches;
          });
          setFlippedIndices([]);
          setIsChecking(false);
          
          const praises = ["🎉 Great Match!", "🌟 Excellent Memory!", "🧠 Wonderful Job!", "⭐ You Found a Pair!"];
          speak(praises[Math.floor(Math.random() * praises.length)]);
        }, 600);
      } else {
        // NO MATCH
        setTimeout(() => {
          setFlippedIndices([]);
          setIsChecking(false);
        }, 1200);
      }
    }
  };

  const handleWin = async (matches, totalAttempts) => {
    stopTimer();
    setIsComplete(true);
    speak("Incredible job! You matched all the cards!");

    if (!user || !user._id) return;

    setIsSaving(true);
    const accuracy = Math.round((matches / totalAttempts) * 100);

    try {
      await fetch("http://localhost:5000/api/child-progress/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          userId: user._id,
          activityType: "memory_game",
          completed: true,
          level: level,
          matchesFound: matches,
          totalPairs: matches,
          attempts: totalAttempts,
          accuracy: accuracy,
          completionTime: time
        })
      });
    } catch (err) {
      console.error("Error saving memory game progress", err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  // --- RENDERING ---
  
  if (!level) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-white p-6 flex flex-col items-center">
        <div className="w-full max-w-7xl flex items-center justify-between mb-12">
          <button
            onClick={() => navigate("/explorer")}
            className="flex items-center gap-2 text-blue-800 font-black hover:opacity-70 transition"
          >
            <ArrowLeft size={20} /> Back to Hub
          </button>
          <h1 className="text-4xl font-black text-blue-800 flex items-center gap-3">
            <Puzzle className="text-blue-500" size={40} />
            Memory Match Adventure
          </h1>
          <div className="w-24"></div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl border-4 border-blue-200 p-12 max-w-5xl w-full text-center relative overflow-hidden">
          <MascotGuide
            emotion="happy"
            message="Let's train our brain! Pick a level to start the memory game!"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <button
              onClick={() => startLevel("Easy")}
              className="bg-green-100 border-4 border-green-300 text-green-800 rounded-3xl p-8 hover:bg-green-200 hover:-translate-y-2 transition-transform group"
            >
              <h3 className="text-3xl font-black mb-2">Easy</h3>
              <p className="font-bold opacity-80">4 Pairs</p>
            </button>
            <button
              onClick={() => startLevel("Medium")}
              className="bg-yellow-100 border-4 border-yellow-300 text-yellow-800 rounded-3xl p-8 hover:bg-yellow-200 hover:-translate-y-2 transition-transform group"
            >
              <h3 className="text-3xl font-black mb-2">Medium</h3>
              <p className="font-bold opacity-80">6 Pairs</p>
            </button>
            <button
              onClick={() => startLevel("Hard")}
              className="bg-red-100 border-4 border-red-300 text-red-800 rounded-3xl p-8 hover:bg-red-200 hover:-translate-y-2 transition-transform group"
            >
              <h3 className="text-3xl font-black mb-2">Hard</h3>
              <p className="font-bold opacity-80">8 Pairs</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isMatched = (matchId) => matchedIds.includes(matchId);
  const isFlipped = (index) => flippedIndices.includes(index);

  // Dynamic grid columns based on level
  let gridCols = "grid-cols-4";
  if (level === "Medium") gridCols = "grid-cols-4"; // 12 cards -> 3 rows of 4
  if (level === "Hard") gridCols = "grid-cols-4"; // 16 cards -> 4 rows of 4
  
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-white p-6 flex flex-col items-center">
      <div className="w-full max-w-7xl flex items-center justify-between mb-8">
        <button
          onClick={() => { stopTimer(); setLevel(null); }}
          className="flex items-center gap-2 text-blue-800 font-black hover:opacity-70 transition"
        >
          <ArrowLeft size={20} /> Change Level
        </button>
        
        <div className="flex gap-6">
          <div className="bg-white px-6 py-3 rounded-full border-2 border-blue-200 shadow-sm flex items-center gap-3">
            <Target className="text-purple-500" />
            <span className="font-black text-blue-900 text-xl">Attempts: {attempts}</span>
          </div>
          <div className="bg-white px-6 py-3 rounded-full border-2 border-blue-200 shadow-sm flex items-center gap-3">
            <Clock className="text-orange-500" />
            <span className="font-black text-blue-900 text-xl">{formatTime(time)}</span>
          </div>
        </div>

        <button
          onClick={() => startLevel(level)}
          className="flex items-center gap-2 text-blue-800 font-black hover:opacity-70 transition"
        >
          <RefreshCw size={20} /> Restart
        </button>
      </div>

      <div className="relative w-full max-w-6xl">
        <div className={`grid ${gridCols} gap-4 sm:gap-6 lg:gap-8 mx-auto`}>
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              className="relative w-full aspect-square cursor-pointer perspective-1000"
              onClick={() => handleCardClick(index)}
              whileHover={{ scale: (isFlipped(index) || isMatched(card.matchId)) ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-full h-full relative preserve-3d"
                initial={false}
                animate={{ rotateY: isFlipped(index) || isMatched(card.matchId) ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {/* BACK OF CARD (Face Down) */}
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl border-[5px] border-indigo-700 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] shadow-xl flex items-center justify-center">
                  <Star className="text-white opacity-40 drop-shadow-lg" size={56} fill="currentColor" />
                </div>
                
                {/* FRONT OF CARD (Face Up) */}
                <div 
                  className={`absolute inset-0 backface-hidden rounded-3xl border-[5px] shadow-xl flex items-center justify-center rotate-y-180 bg-gradient-to-br from-white to-sky-50
                    ${isMatched(card.matchId) ? 'border-green-400 bg-green-50 shadow-[0_0_30px_rgba(74,222,128,0.6)]' : 'border-sky-200'}
                  `}
                >
                  <span className={`text-5xl sm:text-7xl font-black drop-shadow-md ${card.content.length > 2 ? 'text-4xl sm:text-5xl text-blue-800' : 'text-blue-800'}`}>
                    {card.content}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* COMPLETION OVERLAY */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md rounded-[3rem] border-8 border-yellow-300 flex flex-col items-center justify-center p-8 shadow-2xl"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Trophy size={120} className="text-yellow-400 mb-6 drop-shadow-xl" />
              </motion.div>
              
              <h2 className="text-5xl font-black text-indigo-800 mb-8">
                Activity Complete! 🎉
              </h2>

              <div className="grid grid-cols-3 gap-6 mb-10 w-full max-w-lg">
                <div className="bg-blue-50 p-6 rounded-3xl text-center">
                  <p className="font-bold text-blue-600 mb-1">Pairs</p>
                  <p className="text-3xl font-black text-blue-900">{cards.length / 2}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-3xl text-center">
                  <p className="font-bold text-green-600 mb-1">Accuracy</p>
                  <p className="text-3xl font-black text-green-900">
                    {Math.round(((cards.length / 2) / attempts) * 100)}%
                  </p>
                </div>
                <div className="bg-orange-50 p-6 rounded-3xl text-center">
                  <p className="font-bold text-orange-600 mb-1">Time</p>
                  <p className="text-2xl font-black text-orange-900">{formatTime(time)}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => startLevel(level)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-black py-4 px-8 rounded-full text-xl shadow-lg transition"
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate("/parent")}
                  className="bg-white border-4 border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-black py-4 px-8 rounded-full text-xl transition"
                >
                  View Progress
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
