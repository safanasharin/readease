import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Trophy, Clock, Search, Target, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import MascotGuide from "../../../components/explorer/MascotGuide";

// --- LEVEL & MISSION DATA ---
const LEVEL_CONFIG = {
  Easy: {
    gridRows: 2,
    gridCols: 3,
    targetsPerRound: 2,
    totalRounds: 10,
    missions: [
      { target: "A", instruct: "Find all the uppercase letter A's", distractors: ["C", "D", "E", "O", "S", "M"] },
      { target: "s", instruct: "Find all the lowercase letter s's", distractors: ["a", "r", "e", "n", "m", "w"] },
      { target: "M", instruct: "Find all the uppercase letter M's", distractors: ["F", "T", "L", "K", "Y", "X"] },
      { target: "E", instruct: "Find all the uppercase letter E's", distractors: ["F", "H", "L", "T", "I", "Z"] },
      { target: "o", instruct: "Find all the lowercase letter o's", distractors: ["c", "e", "u", "a", "s", "x"] },
      { target: "T", instruct: "Find all the uppercase letter T's", distractors: ["L", "I", "F", "E", "H", "K"] },
      { target: "r", instruct: "Find all the lowercase letter r's", distractors: ["n", "m", "s", "v", "w", "u"] },
      { target: "S", instruct: "Find all the uppercase letter S's", distractors: ["C", "G", "O", "Q", "U", "J"] },
      { target: "i", instruct: "Find all the lowercase letter i's", distractors: ["l", "j", "t", "f", "k", "h"] },
      { target: "O", instruct: "Find all the uppercase letter O's", distractors: ["Q", "C", "D", "G", "S", "P"] }
    ]
  },
  Medium: {
    gridRows: 3,
    gridCols: 4,
    targetsPerRound: 4,
    totalRounds: 10,
    missions: [
      { target: "B", instruct: "Find all the uppercase letter B's", distractors: ["b", "P", "R", "D", "E", "F", "K", "H"] },
      { target: "p", instruct: "Find all the lowercase letter p's", distractors: ["P", "q", "d", "b", "g", "y", "j", "t"] },
      { target: "a", instruct: "Find all the lowercase letter a's", distractors: ["A", "e", "o", "c", "s", "u", "v", "z"] },
      { target: "C", instruct: "Find all the uppercase letter C's", distractors: ["c", "G", "O", "Q", "S", "D", "U", "V"] },
      { target: "h", instruct: "Find all the lowercase letter h's", distractors: ["H", "n", "m", "b", "k", "l", "r", "t"] },
      { target: "K", instruct: "Find all the uppercase letter K's", distractors: ["k", "X", "Y", "V", "W", "M", "N", "H"] },
      { target: "u", instruct: "Find all the lowercase letter u's", distractors: ["U", "v", "w", "n", "m", "r", "s", "c"] },
      { target: "G", instruct: "Find all the uppercase letter G's", distractors: ["g", "C", "O", "Q", "S", "B", "D", "P"] },
      { target: "f", instruct: "Find all the lowercase letter f's", distractors: ["F", "t", "l", "j", "i", "k", "h", "b"] },
      { target: "R", instruct: "Find all the uppercase letter R's", distractors: ["r", "P", "B", "K", "M", "N", "H", "F"] }
    ]
  },
  Hard: {
    gridRows: 4,
    gridCols: 5,
    targetsPerRound: 6,
    totalRounds: 10,
    missions: [
      { target: "b", instruct: "Find all the lowercase letter b's", distractors: ["d", "p", "q"] },
      { target: "m", instruct: "Find all the lowercase letter m's", distractors: ["n", "w", "u", "v"] },
      { target: "q", instruct: "Find all the lowercase letter q's", distractors: ["p", "b", "d", "g", "y"] },
      { target: "d", instruct: "Find all the lowercase letter d's", distractors: ["b", "p", "q"] },
      { target: "n", instruct: "Find all the lowercase letter n's", distractors: ["m", "u", "v", "w"] },
      { target: "p", instruct: "Find all the lowercase letter p's", distractors: ["b", "d", "q", "g", "y"] },
      { target: "u", instruct: "Find all the lowercase letter u's", distractors: ["n", "v", "w", "m"] },
      { target: "M", instruct: "Find all the uppercase letter M's", distractors: ["W", "N", "V", "U"] },
      { target: "W", instruct: "Find all the uppercase letter W's", distractors: ["M", "V", "U", "N"] },
      { target: "S", instruct: "Find all the uppercase letter S's", distractors: ["Z", "C", "O", "Q"] }
    ]
  }
};

export default function LetterConfusionActivity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [level, setLevel] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [grid, setGrid] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [shakingIndices, setShakingIndices] = useState([]);
  
  const [correctSelections, setCorrectSelections] = useState(0);
  const [incorrectSelections, setIncorrectSelections] = useState(0);
  const [time, setTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const timerRef = useRef(null);
  const activeMission = level ? LEVEL_CONFIG[level].missions[currentRound] : null;

  // Audio Feedback
  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1.2;
    window.speechSynthesis.speak(u);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startLevel = (selectedLevel) => {
    stopTimer();
    setLevel(selectedLevel);
    setCurrentRound(0);
    setCorrectSelections(0);
    setIncorrectSelections(0);
    setIsComplete(false);
    setTime(0);
    generateGrid(selectedLevel, 0);

    timerRef.current = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
  };

  const generateGrid = (selectedLevel, roundIndex) => {
    const config = LEVEL_CONFIG[selectedLevel];
    const mission = config.missions[roundIndex];
    const totalCells = config.gridRows * config.gridCols;
    const targetCount = config.targetsPerRound;

    let newGrid = Array(totalCells).fill(null);
    let targetPositions = [];
    
    // Place targets
    while (targetPositions.length < targetCount) {
      let rand = Math.floor(Math.random() * totalCells);
      if (!targetPositions.includes(rand)) {
        targetPositions.push(rand);
        newGrid[rand] = mission.target;
      }
    }

    // Fill the rest with distractors
    for (let i = 0; i < totalCells; i++) {
      if (newGrid[i] === null) {
        newGrid[i] = mission.distractors[Math.floor(Math.random() * mission.distractors.length)];
      }
    }

    setGrid(newGrid);
    setSelectedIndices([]);
    setShakingIndices([]);

    setTimeout(() => {
      speak(mission.instruct);
    }, 500);
  };

  useEffect(() => {
    return () => stopTimer();
  }, []);

  const repeatInstruction = () => {
    if (activeMission) {
      speak(activeMission.instruct);
    }
  };

  const handleCellClick = (index, letter) => {
    if (selectedIndices.includes(index) || isComplete) return;

    if (letter === activeMission.target) {
      // Correct!
      const newSelected = [...selectedIndices, index];
      setSelectedIndices(newSelected);
      setCorrectSelections(prev => prev + 1);

      const successSounds = ["🎉 Detective Success!", "🌟 Great Observation!", "🔍 You Found One!", "⭐ Excellent Work!"];
      speak(successSounds[Math.floor(Math.random() * successSounds.length)]);

      // Check if round is over
      if (newSelected.length === LEVEL_CONFIG[level].targetsPerRound) {
        if (currentRound + 1 < LEVEL_CONFIG[level].totalRounds) {
          setTimeout(() => {
            setCurrentRound(prev => prev + 1);
            generateGrid(level, currentRound + 1);
          }, 1500);
        } else {
          // Game Complete
          setTimeout(() => {
            handleWin(correctSelections + 1, incorrectSelections);
          }, 1000);
        }
      }
    } else {
      // Incorrect!
      setIncorrectSelections(prev => prev + 1);
      setShakingIndices(prev => [...prev, index]);
      
      const encouragements = ["🌈 Keep Looking!", "🔍 Search Carefully!", "💪 You Can Find It!"];
      speak(encouragements[Math.floor(Math.random() * encouragements.length)]);

      setTimeout(() => {
        setShakingIndices(prev => prev.filter(i => i !== index));
      }, 500);
    }
  };

  const handleWin = async (finalCorrect, finalIncorrect) => {
    stopTimer();
    setIsComplete(true);
    speak("Mission Accomplished! You found all the clues!");

    if (!user || !user._id) return;
    setIsSaving(true);
    
    const totalAttempts = finalCorrect + finalIncorrect;
    const accuracy = Math.round((finalCorrect / totalAttempts) * 100);

    try {
      await fetch("http://localhost:5000/api/child-progress/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
          userId: user._id,
          activityType: "letter_detection",
          completed: true,
          level: level,
          targetLetter: activeMission.target, // Last target
          correctSelections: finalCorrect,
          incorrectSelections: finalIncorrect,
          accuracy: accuracy,
          completionTime: time
        })
      });
    } catch (err) {
      console.error("Error saving detective progress", err);
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
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-purple-50 to-white p-6 flex flex-col items-center">
        <div className="w-full max-w-7xl flex items-center justify-between mb-12">
          <button
            onClick={() => navigate("/explorer")}
            className="flex items-center gap-2 text-indigo-800 font-black hover:opacity-70 transition"
          >
            <ArrowLeft size={20} /> Back to Hub
          </button>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-4 drop-shadow-sm">
            <Search className="text-indigo-500" size={50} />
            Detective Academy
          </h1>
          <div className="w-24"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border-4 border-white p-12 max-w-5xl w-full text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200/50 rounded-full blur-3xl -ml-20 -mb-20"></div>

          <div className="relative z-10">
            <MascotGuide
              emotion="happy"
              message="Put on your detective hat! Pick a mission to start searching for letters!"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <motion.button
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startLevel("Easy")}
                className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 text-green-900 rounded-[2.5rem] p-10 shadow-lg hover:shadow-green-200/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-4xl font-black mb-3">Easy</h3>
                <p className="font-bold opacity-80 text-green-700">Large Letters, Few Distractors</p>
              </motion.button>
              <motion.button
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startLevel("Medium")}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 text-yellow-900 rounded-[2.5rem] p-10 shadow-lg hover:shadow-yellow-200/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-4xl font-black mb-3">Medium</h3>
                <p className="font-bold opacity-80 text-yellow-700">More Letters & Mixed Cases</p>
              </motion.button>
              <motion.button
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startLevel("Hard")}
                className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 text-red-900 rounded-[2.5rem] p-10 shadow-lg hover:shadow-red-200/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-4xl font-black mb-3">Hard</h3>
                <p className="font-bold opacity-80 text-red-700">Similar Letters (b, d, p, q)</p>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const config = LEVEL_CONFIG[level];
  const gridColsClass = 
    config.gridCols === 3 ? "grid-cols-3 max-w-2xl" :
    config.gridCols === 4 ? "grid-cols-4 max-w-3xl" :
    "grid-cols-5 max-w-4xl";

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-white p-6 flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-7xl flex items-center justify-between mb-8 z-10">
        <button
          onClick={() => { stopTimer(); setLevel(null); }}
          className="flex items-center gap-2 text-indigo-800 font-black hover:opacity-70 transition"
        >
          <ArrowLeft size={20} /> Change Mission
        </button>
        
        <div className="flex gap-6">
          <div className="bg-white px-6 py-3 rounded-full border-2 border-indigo-200 shadow-sm flex items-center gap-3">
            <Target className="text-purple-500" />
            <span className="font-black text-indigo-900 text-xl">Found: {selectedIndices.length} / {config.targetsPerRound}</span>
          </div>
          <div className="bg-white px-6 py-3 rounded-full border-2 border-indigo-200 shadow-sm flex items-center gap-3">
            <Clock className="text-orange-500" />
            <span className="font-black text-indigo-900 text-xl">{formatTime(time)}</span>
          </div>
          <button 
            onClick={repeatInstruction}
            className="bg-sky-100 hover:bg-sky-200 text-sky-700 px-6 py-3 rounded-full border-2 border-sky-300 shadow-sm flex items-center gap-3 transition font-black"
          >
            <Volume2 /> Repeat
          </button>
        </div>

        <button
          onClick={() => startLevel(level)}
          className="flex items-center gap-2 text-indigo-800 font-black hover:opacity-70 transition"
        >
          <RefreshCw size={20} /> Restart
        </button>
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center relative z-0">
        
        {/* MISSION INSTRUCTION */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-indigo-900 drop-shadow-sm flex items-center justify-center gap-4">
            <Search className="text-indigo-500" size={32} />
            {activeMission?.instruct}
          </h2>
        </div>

        {/* DETECTIVE GRID */}
        <div className={`grid ${gridColsClass} gap-4 sm:gap-6 w-full mx-auto relative z-10 p-6 bg-white/40 backdrop-blur-md rounded-3xl border border-white shadow-xl`}>
          <AnimatePresence mode="popLayout">
            {grid.map((letter, index) => {
              const isSelected = selectedIndices.includes(index);
              const isShaking = shakingIndices.includes(index);
              
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={
                    isShaking ? { x: [-10, 10, -10, 10, 0] } :
                    isSelected ? { scale: 1.1, rotate: [0, 5, -5, 0] } : 
                    { opacity: 1, scale: 1 }
                  }
                  whileHover={!isSelected && !isComplete ? { scale: 1.05, y: -5 } : {}}
                  whileTap={!isSelected && !isComplete ? { scale: 0.95 } : {}}
                  transition={{
                    type: isShaking ? "tween" : "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  onClick={() => handleCellClick(index, letter)}
                  className={`
                    aspect-square rounded-3xl flex items-center justify-center
                    text-6xl sm:text-7xl md:text-8xl font-black transition-all shadow-md
                    ${
                      isSelected
                        ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-green-400/50 border-4 border-white"
                        : isShaking
                        ? "bg-red-50 text-red-500 border-4 border-red-300 shadow-red-200/50"
                        : "bg-white text-indigo-900 border-2 border-indigo-100 hover:shadow-indigo-200 hover:border-indigo-300"
                    }
                  `}
                >
                  {/* Decorative badge for found items */}
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-2 right-2 bg-green-500 rounded-full p-1 border-2 border-white"
                    >
                      <Target size={16} className="text-white" />
                    </motion.div>
                  )}
                  {letter}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

      </div>

      {/* COMPLETION OVERLAY */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md rounded-[3rem] border-8 border-indigo-300 flex flex-col items-center justify-center p-8 shadow-2xl m-6"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Trophy size={120} className="text-yellow-400 mb-6 drop-shadow-xl" />
            </motion.div>
            
            <h2 className="text-5xl font-black text-indigo-800 mb-8 text-center">
              Detective Mission Complete! 🎉
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full max-w-2xl">
              <div className="bg-indigo-50 p-6 rounded-3xl text-center border-4 border-indigo-100">
                <p className="font-bold text-indigo-600 mb-1">Clues Found</p>
                <p className="text-4xl font-black text-indigo-900">{correctSelections}</p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-3xl text-center border-4 border-emerald-100">
                <p className="font-bold text-emerald-600 mb-1">Accuracy</p>
                <p className="text-4xl font-black text-emerald-900">
                  {Math.round((correctSelections / (correctSelections + incorrectSelections)) * 100)}%
                </p>
              </div>
              <div className="bg-orange-50 p-6 rounded-3xl text-center border-4 border-orange-100">
                <p className="font-bold text-orange-600 mb-1">Time</p>
                <p className="text-4xl font-black text-orange-900">{formatTime(time)}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => startLevel(level)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-black py-4 px-10 rounded-full text-2xl shadow-lg transition hover:scale-105"
              >
                Play Again
              </button>
              <button
                onClick={() => navigate("/parent")}
                className="bg-white border-4 border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-black py-4 px-10 rounded-full text-2xl transition hover:scale-105"
              >
                View Progress
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
