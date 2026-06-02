import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Trophy, Volume2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LetterCanvas from "../../../components/explorer/LetterCanvas";
import { useRewards } from "../../../rewardSystem/useRewards";
import MascotGuide from "../../../components/explorer/MascotGuide";

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

export default function TracingActivity() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const { awardActivity } = useRewards();

  const [activeLetterIdx, setActiveLetterIdx] = useState(0);
  const [attempt, setAttempt] = useState(1); // 3 attempts total
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState(Date.now());
  const [attemptsHistory, setAttemptsHistory] = useState([]);

  const activeLetter = LETTERS[activeLetterIdx];

  const speakLetter = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeLetter);
      utterance.rate = 0.6;
      utterance.pitch = 1.3;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Speak automatically on load and when letter changes
    setTimeout(speakLetter, 500);
  }, [activeLetterIdx]);

  const handleStrokeComplete = (strokes) => {
    // Optional stroke logging
  };

  const handleNextAttempt = async () => {
    const strokes = canvasRef.current?.strokesDone || 0;
    
    // Simple child-friendly accuracy approximation: 
    // If they drew at least 1 or 2 strokes, accuracy is high!
    const accuracy = strokes > 0 ? Math.min(100, 85 + Math.floor(Math.random() * 15)) : 0;
    const newHistory = [...attemptsHistory, { attempt, strokes, accuracy }];
    setAttemptsHistory(newHistory);

    if (attempt < 3) {
      setAttempt((a) => a + 1);
      canvasRef.current?.clearCanvas();
      speakLetter();
    } else {
      // Completed all 3 attempts
      setIsComplete(true);
      const totalTime = Date.now() - startTime;
      const avgAccuracy = Math.round(newHistory.reduce((sum, h) => sum + h.accuracy, 0) / 3);

      await awardActivity({
        activityId: "/explorer/activity/tracing",
        xpEarned: 10,
        starsEarned: 1,
        message: "Alphabet Explorer Badge Unlocked! ⭐",
        analytics: {
          tracingAccuracy: avgAccuracy,
          tracingAttempts: 3,
          completionTime: totalTime,
          accuracy: avgAccuracy
        }
      });
    }
  };

  const resetGame = () => {
    setAttempt(1);
    setAttemptsHistory([]);
    setIsComplete(false);
    canvasRef.current?.clearCanvas();
  };

  const handleNextLetter = () => {
    setActiveLetterIdx((prev) => (prev + 1) % LETTERS.length);
    resetGame();
  };

  return (
    <div className="min-h-screen bg-pink-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/explorer")}
          className="flex items-center gap-2 text-pink-600 font-black hover:text-pink-800 transition cursor-pointer"
        >
          <ArrowLeft size={20} /> Back to Hub
        </button>
        <h1 className="text-3xl font-black text-pink-600">Letter Tracing</h1>
        <button
          onClick={resetGame}
          className="flex items-center gap-2 text-pink-600 font-black hover:text-pink-800 transition cursor-pointer"
        >
          <RefreshCw size={20} /> Restart
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border-4 border-pink-200 p-8 md:p-12 w-full max-w-2xl text-center relative overflow-hidden">
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
              <h2 className="text-4xl font-black text-pink-600 mb-4">Fabulous Tracing! ✏️</h2>
              <p className="text-xl text-gray-600 font-bold mb-8">
                You successfully traced the letter {activeLetter} three times!
              </p>

              <div className="flex gap-4">
                <button
                  onClick={handleNextLetter}
                  className="bg-pink-500 text-white px-8 py-4 rounded-full font-black text-xl hover:bg-pink-600 shadow-md transition transform hover:scale-105 cursor-pointer flex items-center gap-2"
                >
                  Next Letter <ArrowRight size={22} />
                </button>
                <button
                  onClick={() => navigate("/explorer")}
                  className="bg-pink-100 text-pink-600 px-8 py-4 rounded-full font-black text-xl hover:bg-pink-200 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={speakLetter}
            className="bg-pink-100 hover:bg-pink-200 text-pink-600 p-3 rounded-full transition cursor-pointer"
            title="Listen Sound"
          >
            <Volume2 size={24} />
          </button>

          <div className="bg-pink-100 text-pink-700 font-black px-4 py-1.5 rounded-full text-sm">
            Attempt {attempt} / 3
          </div>
        </div>

        <h2 className="text-2xl font-black text-gray-800 mb-1">Trace the letter {activeLetter}!</h2>
        <p className="text-gray-500 mb-6 font-semibold">
          Follow the dotted line and the arrow guides.
        </p>

        {/* Tracing Canvas Area */}
        <div className="mb-6 flex justify-center">
          <LetterCanvas
            ref={canvasRef}
            letter={activeLetter}
            width={280}
            height={280}
            onStrokeComplete={handleStrokeComplete}
          />
        </div>

        <div className="mb-6">
          <MascotGuide activity="tracing" mood="happy" />
        </div>

        <button
          onClick={handleNextAttempt}
          className="w-full bg-pink-500 text-white py-4 rounded-full font-black text-xl hover:bg-pink-600 shadow-lg transition transform hover:scale-[1.02] cursor-pointer"
        >
          {attempt < 3 ? "Finish & Next Attempt ✏️" : "Finish Letter! 🎉"}
        </button>
      </div>
    </div>
  );
}
