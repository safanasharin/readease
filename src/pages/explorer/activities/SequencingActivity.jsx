import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Trophy, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRewards } from "../../../rewardSystem/useRewards";
import MascotGuide from "../../../components/explorer/MascotGuide";

const ROUNDS_DATA = [
  { sequence: ["🍎", "🚗", "🐶"], question: "What came first?", answerIndex: 0 },
  { sequence: ["🧸", "⚽", "⭐"], question: "What came next after the teddy bear?", answerIndex: 1 },
  { sequence: ["🍌", "🍦", "🎨"], question: "What came last?", answerIndex: 2 },
];

export default function SequencingActivity() {
  const navigate = useNavigate();
  const { awardActivity } = useRewards();

  const [currentRound, setCurrentRound] = useState(0);
  const [showSequence, setShowSequence] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [wrongAnswer, setWrongAnswer] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Metrics
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [totalRecallTime, setTotalRecallTime] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [feedbackText, setFeedbackText] = useState("");

  const round = ROUNDS_DATA[currentRound];

  const playQuestion = () => {
    if (!round || showSequence || isComplete) return;
    setIsPlaying(true);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(round.question);
      utterance.rate = 0.7;
      utterance.pitch = 1.3;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle countdown on round start
  useEffect(() => {
    setShowSequence(true);
    setCountdown(3);
    setSelectedAnswer(null);
    setWrongAnswer(null);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowSequence(false);
          setStartTime(Date.now());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRound]);

  // Play question voice when sequence hides
  useEffect(() => {
    if (!showSequence) {
      setTimeout(playQuestion, 500);
    }
  }, [showSequence]);

  const handleChoice = async (emoji, index) => {
    if (selectedAnswer || showSequence || isComplete) return;

    const timeTaken = Date.now() - startTime;
    setTotalRecallTime((t) => t + timeTaken);

    const isCorrect = emoji === round.sequence[round.answerIndex];

    if (isCorrect) {
      setSelectedAnswer(emoji);
      setCorrectCount((c) => c + 1);
      setFeedbackText("Fantastic recall! ⭐");

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const correctSpeak = new SpeechSynthesisUtterance("Super job! That is correct!");
        correctSpeak.rate = 0.8;
        correctSpeak.pitch = 1.3;
        window.speechSynthesis.speak(correctSpeak);
      }

      setTimeout(() => {
        setFeedbackText("");
        if (currentRound + 1 < ROUNDS_DATA.length) {
          setCurrentRound((r) => r + 1);
        } else {
          setIsComplete(true);
          const totalDuration = Date.now() - sessionStartTime;
          const accuracy = Math.round(((correctCount + 1) / ROUNDS_DATA.length) * 100);

          awardActivity({
            activityId: "/explorer/activity/sequencing",
            xpEarned: 10,
            starsEarned: 1,
            message: "Memory Master Badge Unlocked! ⭐",
            analytics: {
              sequenceAccuracy: accuracy,
              recallTime: totalRecallTime + timeTaken,
              completionTime: totalDuration,
              accuracy
            }
          });
        }
      }, 1800);
    } else {
      setWrongAnswer(emoji);
      setFeedbackText("Let's try again! 🌟");

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const wrongSpeak = new SpeechSynthesisUtterance("Let's try again. You got this!");
        wrongSpeak.rate = 0.8;
        wrongSpeak.pitch = 1.3;
        window.speechSynthesis.speak(wrongSpeak);
      }

      setTimeout(() => {
        setWrongAnswer(null);
        setFeedbackText("");
        setStartTime(Date.now());
      }, 1200);
    }
  };

  const resetGame = () => {
    setCurrentRound(0);
    setCorrectCount(0);
    setTotalRecallTime(0);
    setIsComplete(false);
    setFeedbackText("");
  };

  return (
    <div className="min-h-screen bg-indigo-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/explorer")}
          className="flex items-center gap-2 text-indigo-600 font-black hover:text-indigo-800 transition cursor-pointer"
        >
          <ArrowLeft size={20} /> Back to Hub
        </button>
        <h1 className="text-3xl font-black text-indigo-600">Sequence Recall</h1>
        <button
          onClick={resetGame}
          className="flex items-center gap-2 text-indigo-600 font-black hover:text-indigo-800 transition cursor-pointer"
        >
          <RefreshCw size={20} /> Restart
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border-4 border-indigo-200 p-8 md:p-12 w-full max-w-2xl text-center relative overflow-hidden flex flex-col justify-between min-h-[480px]">
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
              <h2 className="text-4xl font-black text-indigo-600 mb-4">Bravo, Memory Star! 🌟</h2>
              <p className="text-xl text-gray-600 font-bold mb-8">
                You recalled all the sequences perfectly!
              </p>

              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className="bg-indigo-500 text-white px-8 py-4 rounded-full font-black text-xl hover:bg-indigo-600 shadow-md transition transform hover:scale-105 cursor-pointer"
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate("/explorer")}
                  className="bg-indigo-100 text-indigo-600 px-8 py-4 rounded-full font-black text-xl hover:bg-indigo-200 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {round && (
          <>
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="text-4xl">🐱</div>
                <div className="bg-indigo-100 text-indigo-700 font-black px-4 py-1.5 rounded-full text-sm">
                  Round {currentRound + 1} / {ROUNDS_DATA.length}
                </div>
              </div>

              {showSequence ? (
                <>
                  <h2 className="text-2xl font-black text-gray-800 mb-2 animate-pulse">Remember the Order!</h2>
                  <p className="text-gray-500 mb-6 font-semibold">
                    Look closely at the pictures before they hide! Hiding in {countdown}s...
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-gray-800 mb-2">Can you recall?</h2>
                  <p className="text-gray-500 mb-6 font-semibold flex items-center justify-center gap-2">
                    <button
                      onClick={playQuestion}
                      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 p-2 rounded-full cursor-pointer transition"
                    >
                      <Volume2 size={18} />
                    </button>
                    {round.question}
                  </p>
                </>
              )}
            </div>

            {feedbackText && (
              <div className="h-6 text-lg font-black text-indigo-600 animate-bounce">
                {feedbackText}
              </div>
            )}

            {/* Sequence Display Area */}
            <div className="flex justify-center gap-6 my-10 min-h-[96px] items-center">
              {round.sequence.map((emoji, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="bg-indigo-50 border-4 border-indigo-100 rounded-3xl w-24 h-24 flex items-center justify-center text-5xl shadow-sm">
                    {showSequence ? (
                      emoji
                    ) : (
                      <span className="text-indigo-300 font-black">?</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-gray-400 mt-2">Item {index + 1}</span>
                </div>
              ))}
            </div>

            {/* Answers Selection Grid */}
            {!showSequence && (
              <div className="flex justify-center gap-4 w-full max-w-sm mx-auto">
                {round.sequence.map((emoji, index) => {
                  const isSelected = selectedAnswer === emoji;
                  const isWrong = wrongAnswer === emoji;

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleChoice(emoji, index)}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
                      className={`w-24 h-24 border-4 rounded-3xl text-5xl flex items-center justify-center cursor-pointer shadow-md transition-all
                        ${isSelected
                          ? "bg-green-500 border-green-600 text-white"
                          : isWrong
                          ? "bg-red-500 border-red-600 text-white"
                          : "bg-white border-indigo-100 hover:border-indigo-400"
                        }`}
                    >
                      {emoji}
                    </motion.button>
                  );
                })}
              </div>
            )}

            <div className="mt-8">
              <MascotGuide activity="memory" mood={showSequence ? "thinking" : "happy"} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
