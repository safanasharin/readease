/* eslint-disable */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Volume2, Trophy, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRewards } from "../../../rewardSystem/useRewards";

const STORY_PAGES = [
  {
    text: "Once upon a time, there was a brave little lion named Leo.",
    emoji: "🦁",
    bg: "from-amber-50 to-orange-50",
  },
  {
    text: "Leo lived in a big, colorful jungle with his friends.",
    emoji: "🌴",
    bg: "from-green-50 to-teal-50",
  },
  {
    text: "One day, he found a shiny magical star hidden in the grass.",
    emoji: "⭐",
    bg: "from-yellow-50 to-amber-50",
  },
  {
    text: "The star gave him the power to read any book in the world!",
    emoji: "📚",
    bg: "from-indigo-50 to-blue-50",
  },
  {
    text: "And they all read happily ever after. The End.",
    emoji: "🎉",
    bg: "from-pink-50 to-purple-50",
  },
];

const QUESTIONS = [
  {
    q: "What is the lion's name?",
    options: ["Max", "Leo", "Sam", "Rex"],
    answer: 1,
    emoji: "🦁",
  },
  {
    q: "Where did Leo live?",
    options: ["A desert", "A jungle", "A city", "The ocean"],
    answer: 1,
    emoji: "🌴",
  },
  {
    q: "What magical thing did Leo find?",
    options: ["A wand", "A coin", "A star", "A book"],
    answer: 2,
    emoji: "⭐",
  },
];

export default function StoryActivity() {
  const navigate = useNavigate();
  const { awardActivity } = useRewards();

  const [phase, setPhase] = useState("story"); // "story" | "quiz" | "complete"
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedWordIdx, setHighlightedWordIdx] = useState(-1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [sessionStartTime] = useState(Date.now());
  const wordTimersRef = useRef([]);

  const page = STORY_PAGES[currentPage];
  const words = page?.text.split(" ") || [];

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      wordTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    setHighlightedWordIdx(-1);
    setIsPlaying(false);
    window.speechSynthesis?.cancel();
    wordTimersRef.current.forEach(clearTimeout);
  }, [currentPage]);

  const readPage = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    wordTimersRef.current.forEach(clearTimeout);
    wordTimersRef.current = [];
    setIsPlaying(true);
    setHighlightedWordIdx(0);

    const text = page.text;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.7;
    utterance.pitch = 1.1;

    // Estimate time per word based on rate
    const wordsArr = text.split(" ");
    const msPerWord = (1000 / 0.7) * 0.45; // approx
    wordsArr.forEach((_, i) => {
      const t = setTimeout(() => setHighlightedWordIdx(i), i * msPerWord);
      wordTimersRef.current.push(t);
    });

    utterance.onend = () => {
      setIsPlaying(false);
      setHighlightedWordIdx(-1);
    };
    window.speechSynthesis.speak(utterance);
  };

  const nextPage = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setHighlightedWordIdx(-1);
    wordTimersRef.current.forEach(clearTimeout);
    if (currentPage < STORY_PAGES.length - 1) {
      setCurrentPage((p) => p + 1);
    } else {
      setPhase("quiz");
    }
  };

  const prevPage = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setHighlightedWordIdx(-1);
    wordTimersRef.current.forEach(clearTimeout);
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  };

  const handleQuizAnswer = (optionIdx) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIdx);
    const correct = optionIdx === QUESTIONS[currentQuestion].answer;
    setQuizFeedback(correct ? "correct" : "wrong");

    const answers = [...quizAnswers, correct];
    setQuizAnswers(answers);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const msg = correct ? "Wonderful! That's right!" : "Oops! Let's try the next one!";
      const u = new SpeechSynthesisUtterance(msg);
      u.rate = 0.85; u.pitch = 1.2;
      window.speechSynthesis.speak(u);
    }

    setTimeout(() => {
      setSelectedOption(null);
      setQuizFeedback(null);
      if (currentQuestion + 1 < QUESTIONS.length) {
        setCurrentQuestion((q) => q + 1);
      } else {
        setPhase("complete");
        const correctCount = answers.filter(Boolean).length;
        const totalDuration = Date.now() - sessionStartTime;
        awardActivity({
          activityId: "/explorer/activity/story",
          xpEarned: 20,
          starsEarned: correctCount >= 2 ? 2 : 1,
          message: "Story Reader Badge Unlocked! 📖",
          analytics: {
            comprehensionScore: Math.round((correctCount / QUESTIONS.length) * 100),
            completionTime: totalDuration,
            accuracy: Math.round((correctCount / QUESTIONS.length) * 100),
          },
        });
      }
    }, 1800);
  };

  const restartAll = () => {
    window.speechSynthesis?.cancel();
    setPhase("story");
    setCurrentPage(0);
    setIsPlaying(false);
    setHighlightedWordIdx(-1);
    setCurrentQuestion(0);
    setQuizAnswers([]);
    setSelectedOption(null);
    setQuizFeedback(null);
  };

  const correctCount = quizAnswers.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-amber-50 p-6 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/explorer")}
          className="flex items-center gap-2 text-amber-600 font-bold hover:text-amber-800 transition cursor-pointer"
        >
          <ArrowLeft size={20} /> Back to Hub
        </button>
        <h1 className="text-3xl font-black text-amber-600">📖 Story Time</h1>
        <button
          onClick={restartAll}
          className="flex items-center gap-2 text-amber-600 font-bold hover:text-amber-800 transition cursor-pointer"
        >
          <RotateCcw size={20} /> Restart
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border-4 border-amber-200 w-full max-w-3xl text-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          {/* ── STORY PHASE ── */}
          {phase === "story" && (
            <motion.div
              key={`story-${currentPage}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className={`bg-gradient-to-br ${page.bg} p-8 md:p-12 flex flex-col items-center min-h-[520px]`}
            >
              {/* Page emoji */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="text-[110px] mb-8 leading-none drop-shadow-md"
              >
                {page.emoji}
              </motion.div>

              {/* Word-by-word highlighted text */}
              <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 mb-10 max-w-xl">
                {words.map((word, i) => (
                  <motion.span
                    key={i}
                    animate={highlightedWordIdx === i ? { scale: 1.2 } : { scale: 1 }}
                    className={`text-3xl md:text-4xl font-extrabold leading-relaxed transition-all duration-150 ${
                      highlightedWordIdx === i
                        ? "text-amber-600 underline decoration-amber-400 decoration-4"
                        : "text-gray-800"
                    }`}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between w-full max-w-md border-t border-amber-100 pt-6">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                    currentPage === 0
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                      : "bg-amber-100 text-amber-600 hover:bg-amber-200 cursor-pointer"
                  }`}
                >
                  <ArrowLeft size={28} />
                </button>

                <button
                  onClick={readPage}
                  className={`flex items-center gap-3 px-8 py-4 rounded-full font-black text-xl transition shadow-md cursor-pointer ${
                    isPlaying
                      ? "bg-amber-300 text-amber-900"
                      : "bg-amber-500 text-white hover:bg-amber-600"
                  }`}
                >
                  <Volume2 size={24} className={isPlaying ? "animate-pulse" : ""} />
                  {isPlaying ? "Reading..." : "Read to Me"}
                </button>

                <button
                  onClick={nextPage}
                  className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center hover:bg-amber-200 transition cursor-pointer"
                >
                  {currentPage === STORY_PAGES.length - 1 ? (
                    <span className="text-sm font-black">Quiz!</span>
                  ) : (
                    <ArrowRight size={28} />
                  )}
                </button>
              </div>

              {/* Page dots */}
              <div className="flex justify-center gap-2 mt-5">
                {STORY_PAGES.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentPage ? "w-8 bg-amber-500" : "w-2 bg-amber-200"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── QUIZ PHASE ── */}
          {phase === "quiz" && (
            <motion.div
              key={`quiz-${currentQuestion}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35 }}
              className="p-8 md:p-12 min-h-[520px] flex flex-col items-center"
            >
              <div className="bg-amber-100 text-amber-700 font-black px-5 py-2 rounded-full text-sm mb-6">
                Question {currentQuestion + 1} of {QUESTIONS.length} 🧠
              </div>
              <div className="text-6xl mb-5">{QUESTIONS[currentQuestion].emoji}</div>
              <h2 className="text-2xl font-black text-gray-800 mb-8">
                {QUESTIONS[currentQuestion].q}
              </h2>

              <AnimatePresence>
                {quizFeedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`mb-6 text-lg font-black py-3 px-6 rounded-2xl ${
                      quizFeedback === "correct"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {quizFeedback === "correct" ? "🎉 Correct! Brilliant!" : "🌟 Not quite, keep going!"}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                {QUESTIONS[currentQuestion].options.map((opt, i) => {
                  let btnClass =
                    "bg-amber-50 border-2 border-amber-200 text-gray-800 hover:border-amber-400 hover:bg-amber-100";
                  if (selectedOption === i) {
                    if (quizFeedback === "correct")
                      btnClass = "bg-green-100 border-2 border-green-400 text-green-800";
                    else
                      btnClass = "bg-red-100 border-2 border-red-400 text-red-700";
                  } else if (
                    quizFeedback === "wrong" &&
                    i === QUESTIONS[currentQuestion].answer
                  ) {
                    btnClass = "bg-green-100 border-2 border-green-400 text-green-800";
                  }
                  return (
                    <motion.button
                      key={i}
                      onClick={() => handleQuizAnswer(i)}
                      whileHover={{ scale: selectedOption === null ? 1.04 : 1 }}
                      whileTap={{ scale: 0.97 }}
                      className={`py-4 px-4 rounded-2xl font-black text-lg transition-all cursor-pointer ${btnClass}`}
                    >
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── COMPLETE PHASE ── */}
          {phase === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 min-h-[520px] flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Trophy size={100} className="text-yellow-400 mb-6 drop-shadow-xl" />
              </motion.div>
              <h2 className="text-4xl font-black text-amber-600 mb-3">Fantastic Reader! 📖</h2>
              <p className="text-xl text-gray-500 font-bold mb-2">
                You finished the story of Leo the Lion!
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-8 py-4 mb-8">
                <p className="text-lg font-black text-amber-700">
                  Quiz Score: {correctCount} / {QUESTIONS.length} ⭐
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={restartAll}
                  className="bg-amber-100 text-amber-600 px-8 py-4 rounded-full font-bold text-xl hover:bg-amber-200 transition cursor-pointer"
                >
                  Read Again
                </button>
                <button
                  onClick={() => navigate("/explorer")}
                  className="bg-amber-500 text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-amber-600 shadow-md transition transform hover:scale-105 cursor-pointer"
                >
                  Done ✓
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
