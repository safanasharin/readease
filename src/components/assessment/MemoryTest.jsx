import { useState, useEffect } from "react";
import { ArrowRight, Eye, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MemoryTest({ onNext, updateScore }) {
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState("start"); // 'start', 'memorize', 'recall', 'done'
  const [countdown, setCountdown] = useState(3);
  const [selectedWords, setSelectedWords] = useState([]);
  const [totalScore, setTotalScore] = useState(0);

  const ROUNDS = {
    1: {
      target: ["sun", "book", "tree", "blue"],
      choices: ["sun", "fish", "book", "car", "tree", "blue"],
    },
    2: {
      target: ["cat", "milk", "star", "red"],
      choices: ["frog", "cat", "milk", "ball", "star", "red"],
    },
  };

  // Handle countdown during 'memorize' phase
  useEffect(() => {
    let timer;
    if (phase === "memorize") {
      setCountdown(4);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase("recall");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase, round]);

  const startRound = () => {
    setSelectedWords([]);
    setPhase("memorize");
  };

  const handleSelectChoice = (word) => {
    if (selectedWords.includes(word)) {
      setSelectedWords((prev) => prev.filter((w) => w !== word));
    } else {
      if (selectedWords.length < ROUNDS[round].target.length) {
        setSelectedWords((prev) => [...prev, word]);
      }
    }
  };

  const submitRound = () => {
    const currentRoundData = ROUNDS[round];
    let correctCount = 0;
    
    // Check how many are in correct index positions
    selectedWords.forEach((word, idx) => {
      if (word === currentRoundData.target[idx]) {
        correctCount++;
      }
    });

    // Score: 10 points max per round
    // 4 correct = 10, 3 correct = 7, 2 correct = 4, 1 correct = 2, 0 = 0
    let roundScore = 0;
    if (correctCount === 4) roundScore = 10;
    else if (correctCount === 3) roundScore = 7;
    else if (correctCount === 2) roundScore = 4;
    else if (correctCount === 1) roundScore = 2;

    const newScore = totalScore + roundScore;
    setTotalScore(newScore);

    if (round === 1) {
      setRound(2);
      setPhase("start");
    } else {
      updateScore("memory", newScore);
      onNext();
    }
  };

  const currentData = ROUNDS[round];

  return (
    <div className="bg-white/80 backdrop-blur-md border border-[#EADFC9] rounded-3xl p-8 md:p-12 shadow-xl min-h-[420px] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-[#1F2A44]">Part 4: Memory Recall</h2>
          <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 uppercase tracking-wider">
            Round {round} of 2
          </span>
        </div>

        {phase === "start" && (
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-full mb-6">
              <Eye size={40} />
            </div>
            <p className="text-xl text-gray-700 font-bold mb-4">Short-term Memory Challenge</p>
            <p className="text-base text-gray-500 max-w-md mx-auto mb-8 font-medium">
              We will show you 4 words for 4 seconds. Remember them in order, then select them in that exact sequence!
            </p>
            <button
              onClick={startRound}
              className="bg-teal-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-teal-700 shadow-md transition transform active:scale-95 cursor-pointer"
            >
              Start Round {round}
            </button>
          </div>
        )}

        {phase === "memorize" && (
          <div className="text-center py-6">
            <div className="flex justify-center items-center gap-2 text-orange-500 mb-8 font-bold text-lg">
              <Clock size={20} className="animate-spin-slow" />
              <span>Memorize the words! Hiding in {countdown}s...</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
              {currentData.target.map((word, idx) => (
                <motion.div
                  key={word}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#FFEFE7] border-2 border-[#FFDEC9] text-[#E87A5D] py-8 rounded-2xl text-3xl font-black shadow-sm"
                >
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Word {idx + 1}</p>
                  {word}
                </motion.div>
              ))}
            </div>

            {/* Visual Progress Timer Bar */}
            <div className="w-full max-w-md bg-gray-100 h-2 rounded-full mx-auto overflow-hidden">
              <motion.div
                className="h-full bg-orange-500"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
              />
            </div>
          </div>
        )}

        {phase === "recall" && (
          <div>
            <p className="text-lg text-gray-600 font-bold mb-4 text-center">
              Click the words below in the <strong className="text-teal-600">exact order</strong> you saw them:
            </p>

            {/* Clicked slots */}
            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto my-6">
              {[0, 1, 2, 3].map((slotIdx) => {
                const word = selectedWords[slotIdx];
                return (
                  <div
                    key={slotIdx}
                    className={`h-16 rounded-xl border-2 border-dashed flex flex-col justify-center items-center text-lg font-bold ${
                      word
                        ? "border-[#EADFC9] bg-[#FAF6EE] text-[#2C2519]"
                        : "border-gray-200 text-gray-300"
                    }`}
                  >
                    <span className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">#{slotIdx + 1}</span>
                    {word || ""}
                  </div>
                );
              })}
            </div>

            {/* Word choices grid */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mt-8">
              {currentData.choices.map((word) => {
                const isSelected = selectedWords.includes(word);
                const orderIdx = selectedWords.indexOf(word);
                return (
                  <button
                    key={word}
                    onClick={() => handleSelectChoice(word)}
                    disabled={isSelected}
                    className={`py-5 text-xl font-bold rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-teal-500 bg-teal-50 text-teal-700 opacity-55 scale-95"
                        : "border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-gray-800"
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>

            <div className="text-center mt-4">
              <button
                onClick={() => setSelectedWords([])}
                className="text-sm font-bold text-red-500 hover:underline cursor-pointer"
              >
                Clear Selections
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end border-t border-gray-100 pt-6 mt-8">
        {phase === "recall" && (
          <button
            onClick={submitRound}
            disabled={selectedWords.length !== currentData.target.length}
            className="flex items-center gap-2 bg-teal-600 text-white px-8 py-3.5 rounded-full text-lg font-bold hover:bg-teal-700 shadow-md transition disabled:opacity-50 transform active:scale-95 cursor-pointer"
          >
            {round === 1 ? "Next Round" : "Submit Section"} <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
