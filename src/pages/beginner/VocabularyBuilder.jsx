import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useReward } from "../../rewardSystem/RewardContext";
import { useActivityProgress } from "../../activityEngine/useActivityProgress";
import { beginnerVocabularyWords } from "../../data/beginnerVocabularyWords";
import RewardPopup from "../../components/explorer/RewardPopup";

const getActivitySupportLabel = (level) => {
  if (level === 1 || level === "1") return "Mild Support";
  if (level === 2 || level === "2") return "Moderate Support";
  if (level === 3 || level === "3") return "Severe Support";
  return "Mild Support";
};
import { ArrowLeft, Volume2, CheckCircle, Star, Brain, PlayCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper to shuffle an array
const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

export default function VocabularyBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { triggerReward } = useReward();
  const { completeActivity } = useActivityProgress();
  const synth = window.speechSynthesis;

  // --- Saved Progress State ---
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem("vocabProgress");
    return saved ? JSON.parse(saved) : {
      wordsLearned: 0,
      currentLevel: 1,
      completedLevels: [],
      totalXP: 0,
      bestScore: 0,
      masteredWords: [],
      dailyProgress: 0,
      lastPlayedDate: new Date().toDateString()
    };
  });

  // Reset daily progress if it's a new day
  useEffect(() => {
    const today = new Date().toDateString();
    if (progress.lastPlayedDate !== today) {
      setProgress(prev => ({ ...prev, dailyProgress: 0, lastPlayedDate: today }));
    }
  }, []);

  // Fetch from DB
  useEffect(() => {
    const fetchProgress = async () => {
      const token = localStorage.getItem("token");
      if (!user || !token) return;
      try {
        const res = await fetch(`http://localhost:5000/api/child-progress/user/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const existing = data.progress?.find(p => p.activityType === "vocabulary_builder");
          if (existing) {
             setProgress(prev => ({
               ...prev,
               wordsLearned: existing.wordsLearned || 0,
               currentLevel: existing.currentLevel || 1,
               completedLevels: existing.completedLevels || [],
               totalXP: existing.xpEarned || 0,
               bestScore: existing.bestScore || 0,
               masteredWords: existing.masteredWords || []
             }));
             setLevel(existing.currentLevel || 1);
          }
        }
      } catch(e) {
        console.error("Failed to fetch vocabulary progress", e);
      }
    };
    fetchProgress();
  }, [user]);

  // Sync to localStorage as backup
  useEffect(() => {
    localStorage.setItem("vocabProgress", JSON.stringify(progress));
  }, [progress]);

  // --- Current Activity State ---
  const [level, setLevel] = useState(progress.currentLevel);
  const [wordIndex, setWordIndex] = useState(0);
  // Steps: LEARN, IDENTIFY, CATEGORIZE, SPELL, DEFINE
  const [step, setStep] = useState("LEARN");
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [mistakesMade, setMistakesMade] = useState(0);

  const availableWords = useMemo(() => beginnerVocabularyWords.filter(w => w.level === level), [level]);
  const currentWord = availableWords[wordIndex] || availableWords[0];

  // Shuffled Options (memoized per word so they don't re-shuffle on re-render)
  const identifyOptions = useMemo(() => {
    if (!currentWord) return [];
    return shuffleArray([currentWord.emoji, ...currentWord.wrongEmojis.slice(0, 3)]);
  }, [currentWord]);

  const categoryOptions = useMemo(() => {
    if (!currentWord) return [];
    return shuffleArray([currentWord.category, ...currentWord.wrongCategories.slice(0, 3)]);
  }, [currentWord]);

  const playTTS = (text) => {
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    synth.speak(utterance);
  };

  // Stop audio on unmount
  useEffect(() => {
    return () => { if (synth.speaking) synth.cancel(); };
  }, [synth]);

  // --- Event Handlers ---
  const showFeedback = (msg, isPositive, callback) => {
    setFeedbackMsg({ text: msg, isPositive });
    setTimeout(() => {
      setFeedbackMsg(null);
      if (callback) callback();
    }, 2000);
  };

  const handleCorrect = (xpAmt, nextStep) => {
    triggerReward({ xp: xpAmt, stars: 1, message: "Great Job!" });
    setProgress(prev => ({ ...prev, totalXP: prev.totalXP + xpAmt }));
    
    showFeedback("✅ Great Job! +" + xpAmt + " XP", true, () => {
      if (nextStep === "FINISH_WORD") {
        finishWord();
      } else {
        setStep(nextStep);
      }
    });
  };

  const handleIncorrect = () => {
    setMistakesMade(prev => prev + 1);
    showFeedback("💡 Good Try! Let's review this word.", false, () => {
      setStep("LEARN"); // Reset to learn phase
    });
  };

  const finishWord = () => {
    const isMastered = mistakesMade === 0;
    
    setProgress(prev => {
      const newMastered = isMastered && !prev.masteredWords.includes(currentWord.id) 
        ? [...prev.masteredWords, currentWord.id] 
        : prev.masteredWords;
        
      return {
        ...prev,
        wordsLearned: prev.wordsLearned + 1,
        dailyProgress: prev.dailyProgress + 1,
        masteredWords: newMastered
      };
    });

    if (wordIndex < availableWords.length - 1) {
      setWordIndex(prev => prev + 1);
      setStep("LEARN");
      setMistakesMade(0);
    } else {
      // Finished Level
      triggerReward({ xp: 10, stars: 3, message: "Level Complete!" });
      setProgress(prev => ({
        ...prev,
        totalXP: prev.totalXP + 10,
        completedLevels: [...new Set([...prev.completedLevels, level])]
      }));
      completeActivity("vocabulary-builder");
      
      if (level < 3) {
        setLevel(prev => prev + 1);
        setWordIndex(0);
        setStep("LEARN");
        setMistakesMade(0);
      } else {
        navigate("/beginner");
      }
    }

    // Save to DB
    const token = localStorage.getItem("token");
    if (user && token) {
      fetch("http://localhost:5000/api/child-progress/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user._id,
          activityType: "vocabulary_builder",
          wordsLearned: progress.wordsLearned + 1,
          masteredWords: isMastered ? [currentWord.id] : [],
          currentLevel: wordIndex >= availableWords.length - 1 && level < 3 ? level + 1 : level,
          completedLevels: wordIndex >= availableWords.length - 1 ? [level] : [],
          xpEarned: wordIndex >= availableWords.length - 1 ? 12 : 2, // 2 per correct + 10 for level finish
          score: isMastered ? 100 : 50,
          bestScore: isMastered ? 100 : 50,
          completed: true
        })
      }).catch(console.error);
    }
  };

  // --- Render Steps ---
  const renderLearn = () => (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="text-8xl mb-6 bg-white p-8 rounded-full shadow-lg border-4 border-blue-100 animate-bounce-slow">
        {currentWord.emoji}
      </div>
      <h2 className="text-5xl font-black text-slate-800 mb-6 tracking-widest uppercase">
        {currentWord.word}
      </h2>
      <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-6 max-w-xl w-full mb-4 shadow-sm text-left">
        <p className="text-blue-500 font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
          <Info size={16} /> Meaning
        </p>
        <p className="text-2xl font-medium text-slate-700 leading-snug" style={{ fontFamily: "Comic Sans MS, 'OpenDyslexic', sans-serif" }}>
          {currentWord.meaning}
        </p>
      </div>
      <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-6 max-w-xl w-full mb-8 shadow-sm text-left">
        <p className="text-emerald-500 font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
          <Star size={16} /> Example
        </p>
        <p className="text-2xl font-medium text-slate-700 leading-snug" style={{ fontFamily: "Comic Sans MS, 'OpenDyslexic', sans-serif" }}>
          "{currentWord.exampleSentence}"
        </p>
      </div>
      
      <div className="flex gap-4">
        <button 
          onClick={() => playTTS(`${currentWord.word}. ${currentWord.meaning}. ${currentWord.exampleSentence}`)}
          className="flex items-center gap-3 px-8 py-4 rounded-full font-black text-xl text-slate-600 bg-white border-2 border-slate-200 hover:bg-blue-50 hover:text-blue-600 transition shadow-sm cursor-pointer"
        >
          <Volume2 size={24} /> Listen
        </button>
        <button 
          onClick={() => setStep("IDENTIFY")}
          className="flex items-center gap-3 px-8 py-4 rounded-full font-black text-xl text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-transform hover:scale-105 cursor-pointer"
        >
          Practice <PlayCircle size={24} />
        </button>
      </div>
    </div>
  );

  const renderIdentify = () => (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-black text-slate-500 uppercase tracking-widest mb-2">Which picture is...</h2>
      <h3 className="text-6xl font-black text-slate-800 mb-10 tracking-widest">{currentWord.word}?</h3>
      <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
        {identifyOptions.map((emoji, idx) => (
          <button
            key={idx}
            onClick={() => emoji === currentWord.emoji ? handleCorrect(2, "CATEGORIZE") : handleIncorrect()}
            className="text-7xl bg-white border-4 border-slate-100 rounded-[2rem] p-8 hover:border-blue-400 hover:bg-blue-50 transition shadow-md hover:shadow-lg hover:-translate-y-1 cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );

  const renderCategorize = () => (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-black text-slate-500 uppercase tracking-widest mb-10 text-center">
        What kind of thing is a <span className="text-blue-600">{currentWord.word}</span>?
      </h2>
      <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-3xl">
        <div className="bg-white border-4 border-blue-200 rounded-[2rem] p-10 shadow-lg text-center flex-1 w-full">
          <div className="text-6xl mb-4">{currentWord.emoji}</div>
          <h3 className="text-3xl font-black text-slate-800 uppercase">{currentWord.word}</h3>
        </div>
        
        <div className="text-slate-300 text-4xl font-black hidden md:block">→</div>
        
        <div className="flex flex-col gap-4 flex-1 w-full">
          {categoryOptions.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => cat === currentWord.category ? handleCorrect(2, "SPELL") : handleIncorrect()}
              className="bg-white border-2 border-slate-200 rounded-xl p-4 text-xl font-bold text-slate-700 hover:border-blue-400 hover:bg-blue-50 transition shadow-sm cursor-pointer"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSpell = () => (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-black text-slate-500 uppercase tracking-widest mb-10">Find the missing letter!</h2>
      <div className="text-5xl mb-8 bg-slate-100 p-6 rounded-full">{currentWord.emoji}</div>
      <div className="bg-blue-600 text-white rounded-[2rem] px-12 py-8 shadow-xl shadow-blue-200 mb-12">
        <h3 className="text-5xl md:text-6xl font-black tracking-[0.5em]">{currentWord.missingLetterDisplay}</h3>
      </div>
      <div className="flex gap-6">
        {currentWord.missingLetterOptions.map((letter, idx) => (
          <button
            key={idx}
            onClick={() => letter === currentWord.missingLetterAnswer ? handleCorrect(2, "DEFINE") : handleIncorrect()}
            className="w-20 h-20 md:w-24 md:h-24 bg-white border-4 border-slate-100 rounded-2xl text-4xl font-black text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 transition shadow-md hover:-translate-y-2 cursor-pointer flex items-center justify-center"
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );

  const renderDefine = () => (
    <div className="flex flex-col items-center w-full max-w-2xl">
      <h2 className="text-2xl font-black text-slate-500 uppercase tracking-widest mb-6">Final Challenge</h2>
      <div className="bg-white border-4 border-amber-200 rounded-[2rem] p-8 shadow-lg text-center w-full mb-8 flex flex-col items-center gap-4">
        <div className="text-5xl">{currentWord.emoji}</div>
        <h3 className="text-3xl font-black text-slate-800 uppercase">What does '{currentWord.word}' mean?</h3>
      </div>
      <div className="flex flex-col gap-4 w-full">
        {currentWord.meaningOptions.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => opt === currentWord.meaningAnswer ? handleCorrect(2, "FINISH_WORD") : handleIncorrect()}
            className="bg-white border-2 border-slate-200 rounded-2xl p-5 text-xl font-bold text-slate-700 hover:border-blue-400 hover:bg-blue-50 transition shadow-sm cursor-pointer text-left leading-snug"
            style={{ fontFamily: "Comic Sans MS, 'OpenDyslexic', sans-serif" }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans pb-32">
      <RewardPopup />
      
      {/* Header & Progress HUD */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-10 max-w-5xl mx-auto gap-6">
        <button 
          onClick={() => { if (synth.speaking) synth.cancel(); navigate("/beginner"); }}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 transition self-start"
        >
          <ArrowLeft size={20} /> Dashboard
        </button>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="bg-white px-6 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
            <span className="font-black text-lg text-slate-800">Vocabulary Builder</span>
            <span className="bg-blue-100 text-blue-700 font-black px-2 py-0.5 rounded-md text-sm">{getActivitySupportLabel(level)}</span>
          </div>
          
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
            <Star size={18} className="text-yellow-500 fill-yellow-500" />
            <span className="font-black text-slate-700">{progress.totalXP} XP</span>
          </div>

          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
            <Brain size={18} className="text-purple-500" />
            <span className="font-black text-slate-700">{progress.masteredWords.length} Mastered</span>
          </div>
        </div>
      </header>

      {/* Daily Goal Toast */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-4 flex items-center justify-between shadow-lg text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm"><Trophy size={20} /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-100">Daily Goal</p>
              <p className="font-black">Learn 5 New Words</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-black text-xl">{Math.min(progress.dailyProgress, 5)} / 5</span>
            <div className="w-24 h-3 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((progress.dailyProgress / 5) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Play Area */}
      <main className="max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Progress Bar within current word */}
        {step !== "LEARN" && (
          <div className="w-full max-w-md mb-8 flex justify-between gap-2">
            {["IDENTIFY", "CATEGORIZE", "SPELL", "DEFINE"].map((s, idx) => {
              const stages = ["IDENTIFY", "CATEGORIZE", "SPELL", "DEFINE"];
              const currentIndex = stages.indexOf(step);
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <div key={s} className={`h-2 flex-1 rounded-full transition-all duration-500 ${isPast ? "bg-emerald-400" : isCurrent ? "bg-blue-400" : "bg-slate-200"}`}></div>
              );
            })}
          </div>
        )}

        <div className="w-full relative">
          <AnimatePresence mode="wait">
            {/* Feedback Overlay */}
            {feedbackMsg && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className={`absolute inset-0 z-50 flex items-center justify-center rounded-[2rem] backdrop-blur-sm bg-white/60 ${feedbackMsg.isPositive ? "border-4 border-emerald-300" : "border-4 border-amber-300"}`}
              >
                <div className={`p-8 rounded-[2rem] shadow-2xl flex items-center gap-4 ${feedbackMsg.isPositive ? "bg-emerald-500 text-white" : "bg-white text-slate-800 border-2 border-amber-200"}`}>
                  {feedbackMsg.isPositive ? <CheckCircle size={40} /> : <Info className="text-amber-500" size={40} />}
                  <span className="text-3xl font-black">{feedbackMsg.text}</span>
                </div>
              </motion.div>
            )}

            {/* Steps Rendering */}
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full flex justify-center"
            >
              {step === "LEARN" && renderLearn()}
              {step === "IDENTIFY" && renderIdentify()}
              {step === "CATEGORIZE" && renderCategorize()}
              {step === "SPELL" && renderSpell()}
              {step === "DEFINE" && renderDefine()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Ensure Trophy is available
function Trophy(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
  );
}
