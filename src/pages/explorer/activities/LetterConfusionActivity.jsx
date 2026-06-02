import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, RefreshCw, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRewards } from "../../../rewardSystem/useRewards";
import MascotGuide from "../../../components/explorer/MascotGuide";

const CONFUSION_LEVELS = [
  { target: "b", distractor: "d", prompt: "Find letter b", grid: ["b", "d", "d", "b", "d", "b"] },
  { target: "p", distractor: "q", prompt: "Find letter p", grid: ["q", "p", "p", "q", "p", "q"] },
  { target: "m", distractor: "w", prompt: "Find letter m", grid: ["w", "m", "w", "w", "m", "m"] },
];

export default function LetterConfusionActivity() {
  const navigate = useNavigate();
  const { awardActivity } = useRewards();

  const [currentLevel, setCurrentLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Track metrics
  const [reversalMistakes, setReversalMistakes] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [totalHesitationTime, setTotalHesitationTime] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [feedbackText, setFeedbackText] = useState("");

  const levelData = CONFUSION_LEVELS[currentLevel];

  const playPrompt = () => {
    if (!levelData || isComplete) return;
    setIsPlaying(true);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(levelData.prompt);
      utterance.rate = 0.7;
      utterance.pitch = 1.3;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (levelData) {
      const t = setTimeout(playPrompt, 600);
      setStartTime(Date.now());
      return () => clearTimeout(t);
    }
  }, [currentLevel]);

  const handleChoice = async (letter, index) => {
    if (isComplete) return;

    setTotalAttempts((a) => a + 1);
    const timeToClick = Date.now() - startTime;
    setTotalHesitationTime((h) => h + timeToClick);

    if (letter === levelData.target) {
      // Correct! Speak positive feedback
      setFeedbackText("Awesome choice! 🎉");
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const correctSpeak = new SpeechSynthesisUtterance("Super work! You found it!");
        correctSpeak.rate = 0.8;
        correctSpeak.pitch = 1.3;
        window.speechSynthesis.speak(correctSpeak);
      }

      setTimeout(() => {
        setFeedbackText("");
        if (currentLevel + 1 < CONFUSION_LEVELS.length) {
          setCurrentLevel((c) => c + 1);
        } else {
          setIsComplete(true);
          const totalDuration = Date.now() - sessionStartTime;
          const accuracy = Math.round((CONFUSION_LEVELS.length / (totalAttempts + 1)) * 100);

          awardActivity({
            activityId: "/explorer/activity/letter-confusion",
            xpEarned: 10,
            starsEarned: 1,
            message: "Visual Detective Badge Unlocked! ⭐",
            analytics: {
              reversalMistakes,
              hesitationTime: totalHesitationTime + timeToClick,
              completionTime: totalDuration,
              accuracy: Math.max(0, Math.min(100, accuracy))
            }
          });
        }
      }, 1500);

    } else {
      // Mistake
      if (letter === levelData.distractor) {
        setReversalMistakes((r) => r + 1);
      }
      setFeedbackText("Let's try again! 🌟");
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const wrongSpeak = new SpeechSynthesisUtterance("Let's try again. Look closely!");
        wrongSpeak.rate = 0.8;
        wrongSpeak.pitch = 1.3;
        window.speechSynthesis.speak(wrongSpeak);
      }
      setTimeout(() => {
        setFeedbackText("");
        setStartTime(Date.now()); // Restart timers for this level
      }, 1200);
    }
  };

  const resetGame = () => {
    setCurrentLevel(0);
    setReversalMistakes(0);
    setTotalAttempts(0);
    setTotalHesitationTime(0);
    setIsComplete(false);
    setFeedbackText("");
    setStartTime(Date.now());
  };

  return (
    <div className="min-h-screen bg-violet-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/explorer")}
          className="flex items-center gap-2 text-violet-600 font-black hover:text-violet-800 transition cursor-pointer"
        >
          <ArrowLeft size={20} /> Back to Hub
        </button>
        <h1 className="text-3xl font-black text-violet-600">Letter Confusion</h1>
        <button
          onClick={resetGame}
          className="flex items-center gap-2 text-violet-600 font-black hover:text-violet-800 transition cursor-pointer"
        >
          <RefreshCw size={20} /> Restart
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border-4 border-violet-200 p-8 md:p-12 w-full max-w-2xl text-center relative overflow-hidden">
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
              <h2 className="text-4xl font-black text-violet-600 mb-4">Brilliant Searching! 🔍</h2>
              <p className="text-xl text-gray-600 font-bold mb-8">
                You successfully distinguished the confusing letter pairs!
              </p>

              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className="bg-violet-500 text-white px-8 py-4 rounded-full font-black text-xl hover:bg-violet-600 shadow-md transition transform hover:scale-105 cursor-pointer"
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate("/explorer")}
                  className="bg-violet-100 text-violet-600 px-8 py-4 rounded-full font-black text-xl hover:bg-violet-200 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {levelData && (
          <>
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={playPrompt}
                className="bg-violet-100 hover:bg-violet-200 text-violet-600 p-3 rounded-full transition cursor-pointer animate-pulse"
              >
                <Volume2 size={24} />
              </button>
              <div className="bg-violet-100 text-violet-700 font-black px-4 py-1.5 rounded-full text-sm">
                Round {currentLevel + 1} / {CONFUSION_LEVELS.length}
              </div>
            </div>

            <h2 className="text-2xl font-black text-gray-800 mb-1">Find the letter "{levelData.target}"!</h2>
            <p className="text-gray-500 mb-8 font-semibold">
              Tap the correct letter card inside the bubble.
            </p>

            {feedbackText && (
              <div className="h-8 mb-4 text-lg font-black text-violet-600 animate-bounce">
                {feedbackText}
              </div>
            )}

            {/* Grid of Confusing Letters */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-10">
              {levelData.grid.map((letter, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleChoice(letter, idx)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-24 bg-gradient-to-br from-violet-50 to-white border-4 border-violet-100 rounded-2xl text-5xl font-bold text-violet-700 shadow hover:border-violet-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-center"
                >
                  {letter}
                </motion.button>
              ))}
            </div>

            <div className="mt-8">
              <MascotGuide activity="success" mood="thinking" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
