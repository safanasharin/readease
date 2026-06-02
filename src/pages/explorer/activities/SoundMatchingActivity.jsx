import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, RefreshCw, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRewards } from "../../../rewardSystem/useRewards";
import MascotGuide from "../../../components/explorer/MascotGuide";

const SOUND_QUESTIONS = [
  { target: "B", options: ["B", "D", "P", "A"] },
  { target: "P", options: ["P", "Q", "B", "D"] },
  { target: "M", options: ["M", "W", "N", "V"] },
  { target: "D", options: ["D", "B", "G", "T"] },
  { target: "W", options: ["W", "M", "V", "U"] },
];

export default function SoundMatchingActivity() {
  const navigate = useNavigate();
  const { awardActivity } = useRewards();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [wrongChoice, setWrongChoice] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const [startTime, setStartTime] = useState(null);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [sessionStartTime] = useState(Date.now());

  // Shuffle array utility
  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

  useEffect(() => {
    // Select and shuffle 3 questions for this session
    const shuffledQ = shuffleArray(SOUND_QUESTIONS).slice(0, 3).map(q => ({
      target: q.target,
      options: shuffleArray(q.options)
    }));
    setQuestions(shuffledQ);
    setStartTime(Date.now());
  }, []);

  const currentQ = questions[currentIdx];

  const playSound = () => {
    if (!currentQ || isComplete) return;

    setIsPlaying(true);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`Find the letter ${currentQ.target}`);
      utterance.rate = 0.7;
      utterance.pitch = 1.3;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (currentQ) {
      const t = setTimeout(playSound, 800);
      return () => clearTimeout(t);
    }
  }, [currentIdx, questions]);

  const handleChoice = async (option) => {
    if (selectedOption || isComplete) return;

    const elapsed = Date.now() - startTime;
    setTotalResponseTime((t) => t + elapsed);

    if (option === currentQ.target) {
      // Correct
      setSelectedOption(option);
      setCorrectCount((c) => c + 1);
      
      // Speak positive feedback
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const feedback = new SpeechSynthesisUtterance("Great job! That's correct!");
        feedback.rate = 0.8;
        feedback.pitch = 1.3;
        window.speechSynthesis.speak(feedback);
      }

      setTimeout(() => {
        if (currentIdx + 1 < questions.length) {
          setSelectedOption(null);
          setWrongChoice(null);
          setCurrentIdx((i) => i + 1);
          setStartTime(Date.now());
        } else {
          // Completed
          setIsComplete(true);
          const accuracy = Math.round(( (correctCount + 1) / questions.length) * 100);
          const totalDuration = Date.now() - sessionStartTime;

          awardActivity({
            activityId: "/explorer/activity/sound-matching",
            xpEarned: 10,
            starsEarned: 1,
            message: "Sound Superstar Badge Unlocked! ⭐",
            analytics: {
              soundRecognitionAccuracy: accuracy,
              responseTime: totalResponseTime + elapsed,
              completionTime: totalDuration,
              accuracy
            }
          });
        }
      }, 1500);

    } else {
      // Incorrect
      setWrongChoice(option);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const encourage = new SpeechSynthesisUtterance("Let's try again! You can do it!");
        encourage.rate = 0.8;
        encourage.pitch = 1.3;
        window.speechSynthesis.speak(encourage);
      }
      setTimeout(() => {
        setWrongChoice(null);
      }, 1000);
    }
  };

  const resetGame = () => {
    const shuffledQ = shuffleArray(SOUND_QUESTIONS).slice(0, 3).map(q => ({
      target: q.target,
      options: shuffleArray(q.options)
    }));
    setQuestions(shuffledQ);
    setCurrentIdx(0);
    setSelectedOption(null);
    setWrongChoice(null);
    setIsComplete(false);
    setCorrectCount(0);
    setTotalResponseTime(0);
    setStartTime(Date.now());
  };

  return (
    <div className="min-h-screen bg-sky-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/explorer")}
          className="flex items-center gap-2 text-sky-600 font-black hover:text-sky-800 transition cursor-pointer"
        >
          <ArrowLeft size={20} /> Back to Hub
        </button>
        <h1 className="text-3xl font-black text-sky-600">Sound Matching</h1>
        <button
          onClick={resetGame}
          className="flex items-center gap-2 text-sky-600 font-black hover:text-sky-800 transition cursor-pointer"
        >
          <RefreshCw size={20} /> Restart
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border-4 border-sky-200 p-8 md:p-12 w-full max-w-2xl text-center relative overflow-hidden">
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
              <h2 className="text-4xl font-black text-sky-600 mb-4">Awesome Ears! 🎧</h2>
              <p className="text-xl text-gray-600 font-bold mb-8">
                You identified all the letter sounds correctly!
              </p>

              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className="bg-sky-500 text-white px-8 py-4 rounded-full font-black text-xl hover:bg-sky-600 shadow-md transition transform hover:scale-105 cursor-pointer"
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate("/explorer")}
                  className="bg-sky-100 text-sky-600 px-8 py-4 rounded-full font-black text-xl hover:bg-sky-200 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {currentQ && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="text-5xl">🔊</div>
              <div className="bg-sky-100 text-sky-700 font-black px-4 py-1.5 rounded-full text-sm">
                Level {currentIdx + 1} / {questions.length}
              </div>
            </div>

            <h2 className="text-2xl font-black text-gray-800 mb-2">Listen & Find</h2>
            <p className="text-gray-500 mb-8 font-semibold">
              Listen to the sound and choose the correct letter card below.
            </p>

            <div className="mb-10 flex flex-col items-center gap-6">
              {/* Speaker Button */}
              <motion.button
                onClick={playSound}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                animate={isPlaying ? { scale: [1, 1.08, 1], rotate: [0, -4, 4, -4, 0] } : {}}
                transition={{ repeat: isPlaying ? Infinity : 0, duration: 0.5 }}
                className={`w-28 h-28 rounded-full flex items-center justify-center transition shadow-lg cursor-pointer
                  ${isPlaying ? 'bg-sky-500 text-white shadow-sky-200' : 'bg-sky-100 text-sky-600 hover:bg-sky-200'}`}
              >
                <Volume2 size={48} />
              </motion.button>

              {/* Letter Options */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-6">
                {currentQ.options.map((opt, i) => {
                  const isSelected = selectedOption === opt;
                  const isWrong = wrongChoice === opt;

                  return (
                    <motion.button
                      key={i}
                      onClick={() => handleChoice(opt)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
                      className={`h-24 rounded-2xl border-4 text-4xl font-black transition-all cursor-pointer flex items-center justify-center shadow-md
                        ${isSelected
                          ? "bg-green-500 border-green-600 text-white"
                          : isWrong
                          ? "bg-red-500 border-red-600 text-white"
                          : "bg-white border-sky-100 text-sky-700 hover:border-sky-400"
                        }`}
                    >
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8">
              <MascotGuide activity="sound-matching" mood="happy" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
