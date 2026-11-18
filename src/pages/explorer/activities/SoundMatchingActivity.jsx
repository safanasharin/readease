/* eslint-disable */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, RefreshCw, Trophy, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MascotGuide from "../../../components/explorer/MascotGuide";
import { useAuth } from "../../../context/AuthContext";

// --- DICTIONARY ---
const DICTIONARY = [
  { word: "Apple", letter: "A", sound: "a", emoji: "🍎" },
  { word: "Bear", letter: "B", sound: "b", emoji: "🐻" },
  { word: "Cat", letter: "C", sound: "c", emoji: "🐱" },
  { word: "Dog", letter: "D", sound: "d", emoji: "🐶" },
  { word: "Elephant", letter: "E", sound: "e", emoji: "🐘" },
  { word: "Fish", letter: "F", sound: "f", emoji: "🐟" },
  { word: "Goat", letter: "G", sound: "g", emoji: "🐐" },
  { word: "Hat", letter: "H", sound: "h", emoji: "🎩" },
  { word: "Ice", letter: "I", sound: "i", emoji: "🧊" },
  { word: "Juice", letter: "J", sound: "j", emoji: "🧃" },
  { word: "Kite", letter: "K", sound: "k", emoji: "🪁" },
  { word: "Lion", letter: "L", sound: "l", emoji: "🦁" },
  { word: "Monkey", letter: "M", sound: "m", emoji: "🐒" },
  { word: "Nest", letter: "N", sound: "n", emoji: "🪹" },
  { word: "Orange", letter: "O", sound: "o", emoji: "🍊" },
  { word: "Pig", letter: "P", sound: "p", emoji: "🐷" },
  { word: "Queen", letter: "Q", sound: "kw", emoji: "👑" },
  { word: "Rabbit", letter: "R", sound: "r", emoji: "🐰" },
  { word: "Sun", letter: "S", sound: "s", emoji: "☀️" },
  { word: "Tiger", letter: "T", sound: "t", emoji: "🐯" },
  { word: "Umbrella", letter: "U", sound: "u", emoji: "☂️" },
  { word: "Van", letter: "V", sound: "v", emoji: "🚐" },
  { word: "Water", letter: "W", sound: "w", emoji: "💧" },
  { word: "Xylophone", letter: "X", sound: "z", emoji: "🎹" },
  { word: "Yak", letter: "Y", sound: "y", emoji: "🐃" },
  { word: "Zebra", letter: "Z", sound: "z", emoji: "🦓" },
  { word: "Ball", letter: "B", sound: "b", emoji: "🎾" },
  { word: "Car", letter: "C", sound: "c", emoji: "🚗" },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

// --- QUESTION GENERATOR ---
const generateQuestions = (count = 10) => {
  const questions = [];
  for (let i = 0; i < count; i++) {
    const type = Math.floor(Math.random() * 3) + 1;
    const targetItem = DICTIONARY[Math.floor(Math.random() * DICTIONARY.length)];
    
    let question = { id: i, type, targetItem };
    let options = [];

    if (type === 1) {
      // Type 1: Letter Sound -> Match Letter
      question.audioText = `Letter ${targetItem.letter} says ${targetItem.sound}`;
      question.instruction = "Find the letter!";
      options.push({ text: targetItem.letter, isCorrect: true, emoji: null });
      
      const wrongLetters = shuffle(ALPHABET.filter(l => l !== targetItem.letter)).slice(0, 2);
      wrongLetters.forEach(l => options.push({ text: l, isCorrect: false, emoji: null }));
    } 
    else if (type === 2) {
      // Type 2: Beginning Sound -> Match Image
      question.audioText = `Which one starts with the sound ${targetItem.sound}?`;
      question.instruction = "Find the matching picture!";
      options.push({ text: targetItem.word, isCorrect: true, emoji: targetItem.emoji });

      const wrongItems = shuffle(DICTIONARY.filter(d => d.letter !== targetItem.letter)).slice(0, 2);
      wrongItems.forEach(w => options.push({ text: w.word, isCorrect: false, emoji: w.emoji }));
    } 
    else if (type === 3) {
      // Type 3: Word Sound -> Match Image
      question.audioText = `Find the ${targetItem.word}`;
      question.instruction = "Listen and match the word!";
      options.push({ text: targetItem.word, isCorrect: true, emoji: targetItem.emoji });

      const wrongItems = shuffle(DICTIONARY.filter(d => d.word !== targetItem.word)).slice(0, 2);
      wrongItems.forEach(w => options.push({ text: w.word, isCorrect: false, emoji: w.emoji }));
    }

    question.options = shuffle(options);
    questions.push(question);
  }
  return questions;
};

// --- COMPONENT ---
export default function SoundMatchingActivity() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  // Interaction states
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedbackState, setFeedbackState] = useState(null); // 'correct', 'incorrect'
  const [hasAttempted, setHasAttempted] = useState(false); // To ensure points only on first try
  
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    setQuestions(generateQuestions(10));
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    setSelectedOption(null);
    setFeedbackState(null);
    setHasAttempted(false);
    setTime(0);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentQ = questions[currentIndex];

  const playAudio = (textOverride = null) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const text = textOverride || currentQ?.audioText;
    if (!text) return;

    setIsPlaying(true);
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.8;
    u.pitch = 1.1;
    u.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(u);
  };

  // Auto-play when question changes
  useEffect(() => {
    if (currentQ && !isFinished) {
      const t = setTimeout(() => playAudio(), 600);
      return () => clearTimeout(t);
    }
  }, [currentIndex, isFinished, questions]);

  const saveProgressToDB = async (finalScore) => {
    if (!user?._id) return;
    try {
      const totalQuestions = 10;
      const accuracy = Math.round((finalScore / totalQuestions) * 100);
      await fetch("http://localhost:5000/api/child-progress/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          userId:           user._id,
          activityType:     "sound_matching",
          correctAnswers:   finalScore,        // actual correct count (e.g. 7)
          correctSelections:finalScore,        // backend summary reads correctSelections
          totalQuestions:   totalQuestions,    // always 10 per session
          score:            finalScore,
          accuracy:         accuracy,          // percentage (e.g. 70)
          completionTime:   time,
          completed:        true,
        })
      });
    } catch (e) {
      console.error("Failed to save sound matching progress", e);
    }
  };

  const handleSelect = (option, idx) => {
    if (feedbackState === 'correct' || isFinished) return;
    
    setSelectedOption(idx);

    if (option.isCorrect) {
      setFeedbackState('correct');
      const earnedScore = hasAttempted ? 0 : 1;
      setScore(s => s + earnedScore);
      playAudio("Great job! That's correct!");

      setTimeout(() => {
        if (currentIndex + 1 < questions.length) {
          setCurrentIndex(i => i + 1);
          setSelectedOption(null);
          setFeedbackState(null);
          setHasAttempted(false);
        } else {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsFinished(true);
          saveProgressToDB(score + earnedScore);
        }
      }, 2000);
    } else {
      setFeedbackState('incorrect');
      setHasAttempted(true);
      playAudio("Nice try! Let's listen again!");
      
      setTimeout(() => {
        setFeedbackState(null);
        setSelectedOption(null);
      }, 1500);
    }
  };

  if (!questions.length) return null;

  return (
    <div className="min-h-screen bg-indigo-50 font-sans pb-10">
      {/* Top Navbar */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/90 border-b border-indigo-100 shadow-sm px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/explorer")}
          className="flex items-center gap-2 text-indigo-500 hover:text-indigo-800 font-bold text-sm cursor-pointer transition"
        >
          <ArrowLeft size={20} /> Back to Hub
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔊</span>
          <span className="font-black text-xl text-indigo-700 tracking-tight">Sound Adventure</span>
        </div>
        <div className="flex items-center gap-2 bg-indigo-100 px-4 py-1.5 rounded-full text-indigo-700 font-bold">
          <Star size={16} className="fill-indigo-500" /> {currentIndex + 1} / 10
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4">
        
        <AnimatePresence mode="wait">
          {isFinished ? (
            <motion.div 
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2.5rem] p-10 text-center shadow-xl border-4 border-teal-200"
            >
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                className="text-8xl mb-6"
              >
                🎉
              </motion.div>
              <h1 className="text-4xl font-black text-teal-600 mb-4">Activity Complete!</h1>
              <div className="bg-teal-50 rounded-2xl p-6 inline-block mb-8">
                <p className="text-xl font-bold text-teal-800 mb-2">Questions Correct</p>
                <p className="text-5xl font-black text-teal-600">{score} / 10</p>
                <p className="text-lg font-bold text-teal-500 mt-2">Accuracy: {Math.round((score/10)*100)}%</p>
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={initGame} className="bg-teal-500 hover:bg-teal-600 text-white font-black px-8 py-4 rounded-full text-xl shadow-lg transition transform hover:-translate-y-1 flex items-center gap-2">
                  <RefreshCw size={24} /> Play Again
                </button>
                <button onClick={() => navigate("/explorer")} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-black px-8 py-4 rounded-full text-xl shadow-md transition transform hover:-translate-y-1">
                  Return to Hub
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border-4 border-indigo-100 flex flex-col items-center"
            >
              
              <h2 className="text-2xl font-black text-gray-500 mb-6">{currentQ.instruction}</h2>
              
              <button 
                onClick={() => playAudio()}
                className={`group relative mb-12 flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 shadow-xl transition-all duration-300 ${isPlaying ? 'bg-indigo-500 border-indigo-600 scale-105' : 'bg-indigo-100 border-indigo-200 hover:bg-indigo-200'}`}
              >
                {isPlaying && (
                  <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-30"></span>
                )}
                <Volume2 size={48} className={isPlaying ? "text-white" : "text-indigo-600"} />
                <span className={`mt-2 font-black text-sm ${isPlaying ? 'text-white' : 'text-indigo-600'}`}>
                  {isPlaying ? "Playing..." : "Listen"}
                </span>
              </button>

              {feedbackState === 'correct' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-10 right-10 bg-green-100 text-green-700 font-black px-6 py-3 rounded-full shadow-lg border border-green-200 text-xl z-50">
                  🎉 Great Job!
                </motion.div>
              )}

              {feedbackState === 'incorrect' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-10 right-10 bg-amber-100 text-amber-700 font-black px-6 py-3 rounded-full shadow-lg border border-amber-200 text-xl z-50">
                  🌟 Nice Try! Let's listen again!
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {currentQ.options.map((opt, idx) => {
                  let cardStyle = "bg-white border-2 border-gray-200 hover:border-indigo-400 hover:shadow-lg text-gray-700";
                  if (selectedOption === idx) {
                    if (feedbackState === 'correct') {
                      cardStyle = "bg-green-50 border-4 border-green-500 text-green-700 scale-105 shadow-xl";
                    } else if (feedbackState === 'incorrect') {
                      cardStyle = "bg-red-50 border-4 border-red-400 text-red-500 shake";
                    }
                  } else if (feedbackState === 'correct' && opt.isCorrect) {
                     cardStyle = "bg-green-50 border-4 border-green-500 text-green-700 scale-105 shadow-xl";
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileHover={feedbackState ? {} : { scale: 1.05, y: -5 }}
                      whileTap={feedbackState ? {} : { scale: 0.95 }}
                      onClick={() => handleSelect(opt, idx)}
                      className={`relative flex flex-col items-center justify-center p-8 rounded-3xl transition-all duration-300 h-64 ${cardStyle}`}
                    >
                      {opt.emoji ? (
                        <>
                          <span className="text-7xl mb-4 drop-shadow-md">{opt.emoji}</span>
                          <span className="text-2xl font-black">{opt.text}</span>
                        </>
                      ) : (
                        <span className="text-8xl font-black drop-shadow-md bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 to-purple-600">
                          {opt.text}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Mascot Sidekick */}
        {!isFinished && (
           <div className="mt-8 scale-90 origin-bottom flex justify-center">
             <MascotGuide activity="sound-matching" mood={feedbackState === 'incorrect' ? 'encouraging' : 'happy'} />
           </div>
        )}
      </div>
    </div>
  );
}
