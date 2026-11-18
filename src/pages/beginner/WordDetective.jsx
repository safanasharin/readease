import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RewardPopup from "../../components/explorer/RewardPopup";
import { useReward } from "../../rewardSystem/RewardContext";
import { useActivityProgress } from "../../activityEngine/useActivityProgress";
import { wordBank } from "../../data/wordDetectiveQuestions";
import { Search, ArrowLeft, CheckCircle, RefreshCw, Eye, BookOpen, Star, Brain, Info, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const getActivitySupportLabel = (level) => {
  if (level === 1 || level === "1") return "Mild Support";
  if (level === 2 || level === "2") return "Moderate Support";
  if (level === 3 || level === "3") return "Severe Support";
  return "Mild Support";
};

const SESSION_LENGTH = 15;

// Helpers
const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

// Dynamic Grid Generator for Hidden Word Search
const generateHiddenWordGrid = (word) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const size = 12; // 3x4 grid
  let grid = new Array(size).fill("");
  
  // Place target word in random adjacent slots (simplified: just ensure letters exist)
  // For a true word search, you'd place them contiguously, but for 6-8 year olds, 
  // clicking the letters in any order or finding the letters scattered is usually the mechanic used in earlier code.
  // We will scatter the exact letters of the word, then fill the rest with random letters.
  let wordLetters = word.toUpperCase().split("");
  let availableIndices = shuffleArray([...Array(size).keys()]);
  
  wordLetters.forEach(l => {
    if (availableIndices.length > 0) {
      grid[availableIndices.pop()] = l;
    }
  });

  for (let i = 0; i < size; i++) {
    if (grid[i] === "") {
      grid[i] = letters[Math.floor(Math.random() * letters.length)];
    }
  }
  return grid;
};

// Session Generator
const generateSession = (level) => {
  const levelKey = `level${level}`;
  const data = wordBank[levelKey] || wordBank.level3;
  const cData = wordBank.level1.confusingWords; // Share confusing words

  let session = [];
  
  for (let i = 0; i < SESSION_LENGTH; i++) {
    const typeInt = Math.floor(Math.random() * 6);
    let q = null;
    
    if (typeInt === 0) {
      const word = data.findTheWord[Math.floor(Math.random() * data.findTheWord.length)];
      const distractors = shuffleArray(data.findTheWord.filter(w => w !== word)).slice(0, 3);
      q = { type: "FIND", targetWord: word, options: shuffleArray([word, ...distractors]) };
    } else if (typeInt === 1) {
      const set = data.spotDifferent[Math.floor(Math.random() * data.spotDifferent.length)];
      q = { type: "DIFFERENT", options: set };
    } else if (typeInt === 2) {
      const set = data.missingLetter[Math.floor(Math.random() * data.missingLetter.length)];
      q = { type: "MISSING", text: set.text, options: set.options, answer: set.answer };
    } else if (typeInt === 3) {
      const word = data.findTheWord[Math.floor(Math.random() * data.findTheWord.length)];
      q = { type: "GRID", targetWord: word, grid: generateHiddenWordGrid(word) };
    } else if (typeInt === 4) {
      const set = cData[Math.floor(Math.random() * cData.length)];
      q = { type: "CONFUSING", pair: set.pair, answer: set.answer, question: set.question };
    } else {
      const set = data.pictureDetective[Math.floor(Math.random() * data.pictureDetective.length)];
      q = { type: "PICTURE", emoji: set.emoji, options: set.options, answer: set.answer };
    }
    session.push(q);
  }
  return session;
};

export default function WordDetective() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { triggerReward } = useReward();
  const { completeActivity } = useActivityProgress();

  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(1);
  const [missionIndex, setMissionIndex] = useState(0);
  const [sessionData, setSessionData] = useState([]);
  const [step, setStep] = useState("LOADING");
  
  const [sessionAccuracy, setSessionAccuracy] = useState({ correct: 0, total: 0 });
  const [weakWords, setWeakWords] = useState([]);
  
  const [dbProgress, setDbProgress] = useState({
    score: 0,
    xpEarned: 0,
    wordsFound: 0,
    completedLevels: []
  });

  const [feedback, setFeedback] = useState(null);

  // TTS State
  const [autoRead, setAutoRead] = useState(false);
  const synth = window.speechSynthesis;

  const getQuestionText = (q) => {
    if (!q) return "";
    switch(q.type) {
      case "FIND": return `Find the word ${q.targetWord}`;
      case "DIFFERENT": return "Which word is different?";
      case "MISSING": return "Choose the missing letter.";
      case "GRID": return `Find the hidden word ${q.targetWord}.`;
      case "CONFUSING": return "Which word is correct?";
      case "PICTURE": return "What is shown in this picture?";
      default: return "";
    }
  };

  const playTTS = (text) => {
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    synth.speak(utterance);
  };

  useEffect(() => {
    if (autoRead && sessionData[missionIndex] && step === "PLAY") {
      playTTS(getQuestionText(sessionData[missionIndex]));
    }
  }, [missionIndex, autoRead, sessionData, step]);

  // Fetch Progress & Resume Logic
  useEffect(() => {
    const fetchProgress = async () => {
      const token = localStorage.getItem("token");
      if (!user || !token) {
        startNewSession(1);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/child-progress/user/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const existing = data.progress?.find(p => p.activityType === "word_detective");
          
          let currentLvl = 1;
          if (existing) {
            currentLvl = existing.currentLevel || 1;
            setLevel(currentLvl);
            setDbProgress({
              score: existing.score || 0,
              xpEarned: existing.xpEarned || 0,
              wordsFound: existing.wordsRead || 0,
              completedLevels: existing.completedLevels || []
            });
          }

          // Check for saved session
          const savedLocal = localStorage.getItem(`wordDetective_session_${user._id}`);
          if (savedLocal) {
            const parsed = JSON.parse(savedLocal);
            if (parsed.level === currentLvl && parsed.sessionData?.length > 0 && parsed.missionIndex > 0 && parsed.missionIndex < parsed.sessionData.length) {
              setLevel(parsed.level);
              setSessionData(parsed.sessionData);
              setMissionIndex(parsed.missionIndex);
              setSessionAccuracy(parsed.sessionAccuracy || { correct: 0, total: 0 });
              setStep("RESUME");
            } else {
              startNewSession(currentLvl);
            }
          } else {
            startNewSession(currentLvl);
          }
        } else {
          startNewSession(1);
        }
      } catch(e) {
        console.error("Failed to fetch word detective progress", e);
        startNewSession(1);
      }
      setLoading(false);
    };

    fetchProgress();
  }, [user]);

  const startNewSession = (lvl) => {
    setLevel(lvl);
    setSessionData(generateSession(lvl));
    setMissionIndex(0);
    setSessionAccuracy({ correct: 0, total: 0 });
    setStep("PLAY");
  };

  // Sync to LocalStorage
  useEffect(() => {
    if (user && step === "PLAY" && sessionData.length > 0) {
      localStorage.setItem(`wordDetective_session_${user._id}`, JSON.stringify({ 
        level, 
        missionIndex, 
        sessionData,
        sessionAccuracy
      }));
    }
  }, [level, missionIndex, sessionData, sessionAccuracy, user, step]);

  const showFeedback = (isCorrect, callback) => {
    setFeedback({ isCorrect, msg: isCorrect ? "Great Job! +2 XP" : "Good Try! Look closely." });
    setTimeout(() => {
      setFeedback(null);
      if (callback) callback();
    }, 2000);
  };

  const getWordFromCurrentQ = (q) => {
    if (!q) return "";
    if (q.targetWord) return q.targetWord;
    if (q.answer) return q.answer;
    if (q.options && q.options.length > 0) return q.options[0];
    return "unknown";
  };

  const handleCorrect = () => {
    triggerReward({ xp: 2, stars: 1, message: "Detective Found It!" });
    setDbProgress(prev => ({ ...prev, xpEarned: prev.xpEarned + 2, wordsFound: prev.wordsFound + 1 }));
    setSessionAccuracy(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    
    showFeedback(true, () => {
      if (missionIndex < sessionData.length - 1) {
        setMissionIndex(prev => prev + 1);
        saveToDb(level, false);
      } else {
        finishSession();
      }
    });
  };

  const handleIncorrect = () => {
    setSessionAccuracy(prev => ({ ...prev, total: prev.total + 1 }));
    const currentQ = sessionData[missionIndex];
    const missedWord = getWordFromCurrentQ(currentQ);
    
    setWeakWords(prev => [...new Set([...prev, missedWord])]);
    showFeedback(false);
  };

  const finishSession = () => {
    triggerReward({ xp: 10, stars: 3, message: "Session Complete!" });
    
    if (user) localStorage.removeItem(`wordDetective_session_${user._id}`);

    // Adaptive Difficulty Logic
    let nextLevel = level;
    const accuracy = sessionAccuracy.total > 0 ? (sessionAccuracy.correct / sessionAccuracy.total) : 1;
    
    if (accuracy >= 0.9 && level < 3) {
      nextLevel = level + 1; // Level up
    } else if (accuracy < 0.6 && level > 1) {
      nextLevel = level - 1; // Level down
    }

    setDbProgress(prev => ({
      ...prev,
      xpEarned: prev.xpEarned + 10,
      completedLevels: [...new Set([...prev.completedLevels, level])]
    }));

    completeActivity("word-detective");
    saveToDb(nextLevel, true);
    
    // Auto-start next session
    startNewSession(nextLevel);
  };

  const saveToDb = (newLevel = level, isSessionComplete = false) => {
    const token = localStorage.getItem("token");
    if (!user || !token) return;

    // We store WeakWords in `letter`, and missing ConfusingWords in `targetLetter` as a comma-separated string
    const weakString = weakWords.slice(-10).join(",");
    const accuracyPct = sessionAccuracy.total > 0 ? (sessionAccuracy.correct / sessionAccuracy.total) * 100 : 0;

    fetch("http://localhost:5000/api/child-progress/save", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        userId: user._id,
        activityType: "word_detective",
        xpEarned: isSessionComplete ? 12 : 2, 
        wordsRead: 1, // mapping wordsFound -> wordsRead
        currentLevel: newLevel,
        score: dbProgress.score + 10,
        completed: isSessionComplete,
        letter: weakString, // Overload letter for Weak Words
        accuracy: accuracyPct
      })
    }).catch(e => console.error("Save error", e));
  };

  // Renders
  if (loading || step === "LOADING") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (step === "RESUME") {
    const progressPercent = (missionIndex / sessionData.length) * 100;
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2rem] shadow-xl text-center max-w-md w-full border-4 border-indigo-100 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 bg-yellow-400 w-32 h-32 rounded-full mix-blend-multiply opacity-20 blur-2xl"></div>
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
            <Search size={40} className="text-indigo-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2 relative z-10">🕵️ Continue Mission</h2>
          <p className="text-slate-500 font-medium mb-8 relative z-10">You're on the trail! Let's find those words.</p>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 space-y-4 text-left relative z-10">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-600">Support Level:</span>
              <span className="font-black text-indigo-600 bg-indigo-100 px-3 py-1 rounded-lg">{getActivitySupportLabel(level)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-600">Question:</span>
              <span className="font-black text-sky-600 bg-sky-100 px-3 py-1 rounded-lg">{missionIndex + 1} of {sessionData.length}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 mt-4">
              <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className="flex gap-4 relative z-10">
            <button 
              onClick={() => setStep("PLAY")}
              className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
            >
              Continue
            </button>
            <button 
              onClick={() => startNewSession(level)}
              className="flex-1 bg-white text-slate-500 font-bold py-4 rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = sessionData[missionIndex];
  if (!currentQ) return null;

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/beginner")} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <Search size={20} className="font-bold" />
            </div>
            <div>
              <h1 className="font-black text-xl text-slate-800 leading-tight">Word Detective</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{getActivitySupportLabel(level)}   Q {missionIndex + 1}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setAutoRead(!autoRead)} 
            className={`p-2 rounded-full transition-colors flex items-center gap-2 text-sm font-bold ${autoRead ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}
          >
            {autoRead ? <Volume2 size={20} /> : <VolumeX size={20} />}
            <span className="hidden sm:inline">Auto Read</span>
          </button>
          <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
            <Star size={16} className="fill-amber-500 text-amber-500" />
            {dbProgress.xpEarned} XP
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-200">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((missionIndex) / sessionData.length) * 100}%` }}
            className="h-full bg-emerald-500"
          />
        </div>

        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={missionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border-4 border-slate-100 p-8 md:p-12 text-center relative overflow-hidden"
            >
              
              {currentQ.type === "FIND" && (
                <div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center justify-center gap-3">
                    <Search className="text-indigo-500" /> Find The Word
                    <button onClick={() => playTTS(getQuestionText(currentQ))} className="p-2 hover:bg-slate-100 rounded-full text-indigo-500 ml-2">
                      <Volume2 size={24} />
                    </button>
                  </h2>
                  <div className="bg-indigo-50 py-6 px-12 rounded-3xl mb-8 inline-block border-2 border-indigo-100">
                    <span className="text-5xl font-black text-indigo-700 tracking-widest">{currentQ.targetWord}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {currentQ.options.map((opt, i) => (
                      <button 
                        key={i}
                        onClick={() => opt === currentQ.targetWord ? handleCorrect() : handleIncorrect()}
                        className="bg-white border-4 border-slate-100 hover:border-indigo-400 py-6 rounded-2xl text-2xl font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all active:scale-95 uppercase"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentQ.type === "DIFFERENT" && (
                <div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center justify-center gap-3">
                    <Eye className="text-purple-500" /> Spot The Different Word
                    <button onClick={() => playTTS(getQuestionText(currentQ))} className="p-2 hover:bg-slate-100 rounded-full text-purple-500 ml-2">
                      <Volume2 size={24} />
                    </button>
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {currentQ.options.map((opt, i) => {
                      const isOdd = currentQ.options.filter(w => w === opt).length === 1;
                      return (
                        <button 
                          key={i}
                          onClick={() => isOdd ? handleCorrect() : handleIncorrect()}
                          className="bg-white border-4 border-slate-100 hover:border-purple-400 py-6 rounded-2xl text-3xl font-black text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-all active:scale-95 lowercase"
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {currentQ.type === "MISSING" && (
                <div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center justify-center gap-3">
                    <Brain className="text-sky-500" /> Missing Letter
                    <button onClick={() => playTTS(getQuestionText(currentQ))} className="p-2 hover:bg-slate-100 rounded-full text-sky-500 ml-2">
                      <Volume2 size={24} />
                    </button>
                  </h2>
                  <div className="bg-sky-50 py-8 px-12 rounded-3xl mb-8 inline-block border-2 border-sky-100">
                    <span className="text-5xl font-black text-sky-700 tracking-[0.5em]">{currentQ.text}</span>
                  </div>
                  <div className="flex justify-center gap-6">
                    {currentQ.options.map((opt, i) => (
                      <button 
                        key={i}
                        onClick={() => opt === currentQ.answer ? handleCorrect() : handleIncorrect()}
                        className="bg-white border-4 border-slate-100 hover:border-sky-400 w-20 h-20 rounded-2xl text-3xl font-black text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-all active:scale-95 uppercase"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentQ.type === "GRID" && (
                <div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center justify-center gap-3">
                    <Search className="text-emerald-500" /> Hidden Word Search
                    <button onClick={() => playTTS(getQuestionText(currentQ))} className="p-2 hover:bg-slate-100 rounded-full text-emerald-500 ml-2">
                      <Volume2 size={24} />
                    </button>
                  </h2>
                  <p className="text-slate-500 font-bold mb-4">Find letters for: <span className="text-emerald-600 font-black uppercase">{currentQ.targetWord}</span></p>
                  <div className="grid grid-cols-4 gap-2 bg-slate-50 p-4 rounded-3xl border border-slate-100 max-w-sm mx-auto">
                    {currentQ.grid.map((letter, i) => (
                      <button 
                        key={i}
                        onClick={() => {
                          if (currentQ.targetWord.toUpperCase().includes(letter)) handleCorrect();
                          else handleIncorrect();
                        }}
                        className="bg-white border-2 border-slate-200 hover:border-emerald-400 h-16 rounded-xl text-2xl font-black text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all active:scale-95"
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentQ.type === "CONFUSING" && (
                <div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center justify-center gap-3">
                    <RefreshCw className="text-rose-500" /> Confusing Words
                    <button onClick={() => playTTS(getQuestionText(currentQ))} className="p-2 hover:bg-slate-100 rounded-full text-rose-500 ml-2">
                      <Volume2 size={24} />
                    </button>
                  </h2>
                  <p className="text-xl text-slate-600 font-bold mb-8">{currentQ.question}</p>
                  <div className="flex justify-center gap-8">
                    {shuffleArray(currentQ.pair).map((opt, i) => (
                      <button 
                        key={i}
                        onClick={() => opt === currentQ.answer ? handleCorrect() : handleIncorrect()}
                        className="bg-white border-4 border-slate-100 hover:border-rose-400 px-12 py-8 rounded-3xl text-4xl font-black text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-all active:scale-95 lowercase"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentQ.type === "PICTURE" && (
                <div>
                  <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center justify-center gap-3">
                    <Eye className="text-amber-500" /> Picture Detective
                    <button onClick={() => playTTS(getQuestionText(currentQ))} className="p-2 hover:bg-slate-100 rounded-full text-amber-500 ml-2">
                      <Volume2 size={24} />
                    </button>
                  </h2>
                  <div className="text-7xl mb-8 filter drop-shadow-xl">{currentQ.emoji}</div>
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    {currentQ.options.map((opt, i) => (
                      <button 
                        key={i}
                        onClick={() => opt === currentQ.answer ? handleCorrect() : handleIncorrect()}
                        className="bg-white border-4 border-slate-100 hover:border-amber-400 py-4 rounded-2xl text-xl font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-all active:scale-95 capitalize"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Feedback Overlay */}
        <AnimatePresence>
          {feedback && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-md px-10 py-6 rounded-3xl shadow-2xl border-4 border-white flex flex-col items-center"
            >
              {feedback.isCorrect ? (
                <CheckCircle size={60} className="text-emerald-500 mb-3" />
              ) : (
                <Info size={60} className="text-amber-500 mb-3" />
              )}
              <h3 className={`text-2xl font-black ${feedback.isCorrect ? 'text-emerald-600' : 'text-amber-600'}`}>
                {feedback.msg}
              </h3>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
