import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useReward } from "../../rewardSystem/RewardContext";

const getActivitySupportLabel = (level) => {
  if (level === 1 || level === "1") return "Mild Support";
  if (level === 2 || level === "2") return "Moderate Support";
  if (level === 3 || level === "3") return "Severe Support";
  return "Mild Support";
};

import { useActivityProgress } from "../../activityEngine/useActivityProgress";
import { beginnerReadingPassages } from "../../data/beginnerReadingPassages";
import RewardPopup from "../../components/explorer/RewardPopup";
import { ArrowLeft, Mic, PlayCircle, Volume2, MicOff, RefreshCw, Trophy, Clock, Star, Brain, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

// --- Helper: Levenshtein Distance for Fuzzy Matching ---
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function isFuzzyMatch(target, spoken) {
  const distance = levenshtein(target, spoken);
  const maxLength = Math.max(target.length, spoken.length);
  const similarity = (maxLength - distance) / maxLength;
  return similarity >= 0.8;
}

export default function ReadingPractice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { triggerReward } = useReward();
  const { completeActivity } = useActivityProgress();
  
  const savedData = localStorage.getItem("readingPractice");
  let initialResumeData = null;
  try {
    initialResumeData = savedData ? JSON.parse(savedData) : null;
  } catch(e) {}

  // Phase: LISTEN, PRACTICE, ASSESS, RESULT, PROMPT_RESUME
  const [phase, setPhase] = useState(initialResumeData ? "PROMPT_RESUME" : "LISTEN");
  
  // Progression & Selection
  const [maxLevelUnlocked, setMaxLevelUnlocked] = useState(1);
  const [level, setLevel] = useState(initialResumeData?.level || 1);
  const [passageIndex, setPassageIndex] = useState(initialResumeData?.passageIndex || 0);
  
  // Speech & Scoring
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  
  // TTS Highlighting
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const synth = window.speechSynthesis;
  
  const [analytics, setAnalytics] = useState({
    bestAccuracy: 0,
    bestTime: Infinity,
    totalSessions: 0,
    highestLevel: 1
  });
  
  const recognitionRef = useRef(null);

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
          const existing = data.progress?.find(p => p.activityType === "reading_practice");
          if (existing) {
             const safeLevel = Math.min(existing.currentLevel || 1, 3);
             setMaxLevelUnlocked(safeLevel);
             if (!initialResumeData) {
               setLevel(safeLevel);
             }
             setAnalytics(prev => ({
               ...prev,
               bestAccuracy: existing.bestScore || 0,
               totalSessions: existing.attempts || 0,
               highestLevel: existing.currentLevel || 1
             }));
          }
        }
      } catch(e) {
        console.error("Failed to fetch reading practice progress", e);
      }
    };
    fetchProgress();
  }, [user]);
  
  const availablePassages = beginnerReadingPassages.filter(p => p.level === level);
  const currentPassage = availablePassages?.[passageIndex] || availablePassages?.[0];
  

  const targetWords = currentPassage?.text?.split(/\s+/).map(w => w.replace(/[.,!]/g, "")) || [];
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }
    
    if (!recognitionRef.current) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn("Speech recognition is not supported or was blocked:", err);
        setSpeechSupported(false);
        return;
      }
    }

    const recognition = recognitionRef.current;
    let silenceTimer = null;
    
    recognition.onstart = () => {
      console.log("Recognition Started");
    };
    
    recognition.onresult = (event) => {
      console.log("Result Received");
      
      // Rebuild the complete transcript from scratch every time
      // This prevents the duplication bug if event.resultIndex stays at 0
      let completeTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        completeTranscript += event.results[i][0].transcript + " ";
      }
      
      setTranscript(completeTranscript.trim());
      
      // Stop automatically after 3 seconds of silence
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        try { recognition.stop(); } catch(e) {}
      }, 3000);
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setSpeechSupported(false);
      }
      setIsListening(false);
    };
    
    recognition.onend = () => {
      console.log("Recognition Stopped");
      setIsListening(false);
    };
    
    return () => {
      try { recognition.stop(); } catch(e) {}
      if (synth.speaking) synth.cancel();
      if (silenceTimer) clearTimeout(silenceTimer);
    };
  }, [synth]);

  // Handle Assessment Completion
  useEffect(() => {
    if (phase === "ASSESS" && !isListening && transcript.length > 0) {
      finalizeAssessment();
    }
  }, [isListening, phase]);


  const playTTS = () => {
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(currentPassage.text);
    utterance.rate = 0.8; 
    utterance.pitch = 1.1;
    
    let currentWordIdx = 0;
    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        setHighlightIndex(currentWordIdx);
        currentWordIdx++;
      }
    };
    utterance.onend = () => {
      setHighlightIndex(-1);
      if (phase === "LISTEN") setPhase("PRACTICE");
    };
    
    synth.speak(utterance);
  };

  const stopTTS = () => {
    if (synth.speaking) synth.cancel();
    setHighlightIndex(-1);
    if (phase === "LISTEN") setPhase("PRACTICE");
  };

  const startAssessment = () => {
    if (!speechSupported) {
      // Fallback: manually mark complete
      finalizeFallback();
      return;
    }
    setPhase("ASSESS");
    setTranscript("");
    setStartTime(Date.now());
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      setIsListening(false);
      finalizeFallback();
    }
  };

  const stopAssessment = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const calculateScore = (finalTranscript) => {
    // Transcript Cleanup
    let cleaned = finalTranscript
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
      
    console.log("Final Transcript (Cleaned):", cleaned);
      
    // Remove duplicate consecutive words
    const tokens = cleaned.split(" ").filter(w => w.length > 0);
    const spokenWords = tokens.filter((word, i) => i === 0 || word !== tokens[i - 1]);
    
    let correctCount = 0;
    
    const wordFeedback = targetWords.map(originalTargetWord => {
      const tw = originalTargetWord.toLowerCase().replace(/[^\w\s]/g, "");
      
      const spokenMatchIndex = spokenWords.findIndex(sw => {
        if (tw === sw) return true;
        // Lenient word-level similarity: minor pronunciation, plural, etc.
        const dist = levenshtein(tw, sw);
        if (tw.length <= 4 && dist <= 1) return true;
        if (tw.length > 4 && dist <= 2) return true;
        return false;
      });
      
      let status = 'skipped';
      if (spokenMatchIndex !== -1) {
        const sw = spokenWords[spokenMatchIndex];
        if (sw === tw) {
          status = 'correct';
          correctCount++;
        } else {
          status = 'nearly';
          correctCount++; // Don't penalize minor mistakes
        }
        spokenWords.splice(spokenMatchIndex, 1);
      } else {
        // Missing articles are ignored for scoring but marked as skipped visually
        if (["a", "an", "the"].includes(tw)) {
           status = 'skipped';
           correctCount++; // Treat as correct to not penalize
        } else if (spokenWords.length > 0) {
           status = 'incorrect';
           spokenWords.shift(); // consume an incorrect spoken word
        }
      }
      return { word: originalTargetWord, status };
    });

    let accuracy = Math.round((correctCount / targetWords.length) * 100);
    if (accuracy > 100) accuracy = 100;
    
    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    
    let xpEarned = 3;
    let scoreText = "Keep Practicing";
    let scoreEmoji = "💪";
    
    if (accuracy >= 90) { scoreText = "Excellent"; scoreEmoji = "⭐"; xpEarned = 10; }
    else if (accuracy >= 75) { scoreText = "Great"; scoreEmoji = "👍"; xpEarned = 8; }
    else if (accuracy >= 60) { scoreText = "Good"; scoreEmoji = "😊"; xpEarned = 6; }

    return { correctCount, accuracy, timeTaken, xpEarned, wordFeedback, scoreText, scoreEmoji };
  };

  const finalizeAssessment = () => {
    const score = calculateScore(transcript);
    saveProgress(score);
    setPhase("RESULT");
  };

  const finalizeFallback = () => {
    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 10;
    const score = {
      correctCount: targetWords.length,
      accuracy: 100, // Assumed 100% for manual/fallback
      timeTaken: timeTaken,
      xpEarned: 10,
      wordFeedback: targetWords.map(w => ({ word: w, status: 'correct' }))
    };
    saveProgress(score);
    setPhase("RESULT");
  };

  const saveProgress = (score) => {
    setScoreData(score);
    
    const isLevelUp = score.accuracy >= 80;
    const nextMaxLvl = isLevelUp ? Math.min(3, Math.max(maxLevelUnlocked, level + 1)) : maxLevelUnlocked;
    if (isLevelUp) setMaxLevelUnlocked(nextMaxLvl);
    
    // Save to localStorage for resume
    let nextIdx = passageIndex;
    let nextLvl = level;
    if (passageIndex < availablePassages.length - 1) {
      nextIdx = passageIndex + 1;
    } else {
      if (level < 3 && isLevelUp) {
        nextLvl = level + 1;
        nextIdx = 0;
      } else {
        nextIdx = -1; // Finished everything or didn't pass
      }
    }

    if (nextIdx !== -1) {
      localStorage.setItem("readingPractice", JSON.stringify({ level: nextLvl, passageIndex: nextIdx }));
    } else {
      localStorage.removeItem("readingPractice");
    }
    
    const newAnalytics = {
      bestAccuracy: Math.max(analytics.bestAccuracy, score.accuracy),
      bestTime: Math.min(analytics.bestTime, score.timeTaken || Infinity),
      totalSessions: analytics.totalSessions + 1,
      highestLevel: Math.max(analytics.highestLevel, isLevelUp ? level + 1 : level)
    };
    setAnalytics(newAnalytics);

    const progressData = {
      activity: "reading-practice",
      level: level,
      accuracy: score.accuracy,
      wordsRead: score.correctCount,
      readingTime: score.timeTaken,
      xpEarned: score.xpEarned,
      completed: true,
      analytics: newAnalytics,
      unlockedNextLevel: isLevelUp
    };
    
    console.log("Saving Progress:", progressData);
    
    // Awards
    const badges = [];
    if (newAnalytics.totalSessions === 1) badges.push("First Reader");
    if (score.accuracy >= 90) badges.push("Fluency Star");
    if (isLevelUp) {
      triggerReward({ xp: 15, stars: 3, message: "Level Up!" });
    } else {
      triggerReward({ xp: score.xpEarned, stars: score.accuracy > 80 ? 2 : 1, message: "Keep Practicing!" });
    }
    
    completeActivity("reading-practice");

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
          activityType: "reading_practice",
          accuracy: score.accuracy,
          readingTime: score.timeTaken,
          wordsRead: score.correctCount,
          bestScore: score.accuracy,
          currentLevel: nextMaxLvl,
          xpEarned: score.xpEarned,
          score: score.accuracy,
          completed: true
        })
      }).catch(console.error);
    }
  };

  const retry = () => {
    setPhase("ASSESS");
    setTranscript("");
    setStartTime(Date.now());
    if (speechSupported) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch(e) {
        setIsListening(false);
      }
    }
  };

  const nextPassage = () => {
    if (passageIndex < availablePassages.length - 1) {
      setPassageIndex(prev => prev + 1);
    } else {
      if (level < 3 && level < maxLevelUnlocked) {
        setLevel(prev => prev + 1);
        setPassageIndex(0);
      } else {
        navigate("/beginner");
      }
    }
    setPhase("LISTEN");
    setTranscript("");
    setScoreData(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <RewardPopup />
      
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-10 max-w-4xl mx-auto gap-4">
        <button 
          onClick={() => {
            if (synth.speaking) synth.cancel();
            navigate("/beginner");
          }}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 transition self-start"
        >
          <ArrowLeft size={20} /> Dashboard
        </button>
        
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200">
          <span className="font-black text-xl text-slate-800">Reading Practice</span>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex gap-2">
            {[1, 2, 3].map(l => (
              <button 
                key={l}
                onClick={() => {
                  if (l <= maxLevelUnlocked) {
                    setLevel(l); setPassageIndex(0); setPhase("LISTEN");
                  }
                }}
                className={`w-8 h-8 rounded-full font-black text-sm flex items-center justify-center transition-all ${
                  l === level ? "bg-blue-600 text-white shadow-md scale-110" : 
                  l <= maxLevelUnlocked ? "bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer" : 
                  "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto">
        
        {phase === "PROMPT_RESUME" && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2rem] shadow-xl border-2 border-blue-100 p-8 md:p-12 text-center max-w-xl mx-auto mb-8"
          >
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">
              📖
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4">Continue Reading?</h2>
            <p className="text-lg text-slate-600 mb-8 font-medium">You have unfinished reading practice. Would you like to pick up where you left off?</p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 text-left">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Saved Progress</p>
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold text-slate-800">{getActivitySupportLabel(level)}</p>
                <p className="text-lg font-medium text-blue-600 bg-blue-100 px-4 py-1 rounded-full">Passage {passageIndex + 1}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setPhase("LISTEN")}
                className="flex-1 bg-blue-600 text-white font-black text-lg py-4 px-6 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all cursor-pointer"
              >
                Continue
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem("readingPractice");
                  setLevel(1);
                  setPassageIndex(0);
                  setPhase("LISTEN");
                }}
                className="flex-1 bg-white text-slate-600 font-bold text-lg py-4 px-6 rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Start Over
              </button>
            </div>
          </motion.div>
        )}

        {phase !== "RESULT" && phase !== "PROMPT_RESUME" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] shadow-lg border-2 border-slate-100 p-8 md:p-16 mb-8"
          >
            <h2 className="text-xl md:text-2xl font-black text-slate-400 mb-8 text-center uppercase tracking-widest flex items-center justify-center gap-3">
              {phase === "LISTEN" && "🔊 Listen carefully before reading"}
              {phase === "PRACTICE" && "🗣️ Practice reading aloud"}
              {phase === "ASSESS" && "🎙️ Assessment Mode"}
            </h2>
            
            <div className="min-h-[200px] flex items-center justify-center">
              <p className="text-4xl md:text-5xl font-medium text-slate-800 leading-relaxed tracking-wide text-center" style={{ fontFamily: "Comic Sans MS, 'OpenDyslexic', sans-serif" }}>
                {currentPassage?.text?.split(/\s+/)?.map((word, idx) => (
                  <span 
                    key={idx} 
                    className={`inline-block mx-1 transition-colors duration-200 ${highlightIndex === idx ? "text-blue-600 bg-blue-100 px-2 rounded-lg" : ""}`}
                  >
                    {word}{" "}
                  </span>
                ))}
              </p>
            </div>
            
            {phase === "ASSESS" && isListening && (
              <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-blue-400 text-sm font-bold uppercase tracking-wider mb-2 animate-pulse">We are listening...</p>
                <p className="text-blue-800 font-medium italic">{transcript || "Speak clearly into your microphone..."}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* RESULT PHASE */}
        {phase === "RESULT" && scoreData && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2rem] shadow-xl border-2 border-blue-100 p-8 md:p-12 mb-8 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
            
            {/* 1. Positive Celebration First */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-300 to-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-white shadow-lg text-4xl">
              {scoreData.scoreEmoji || "🎉"}
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-slate-800 mb-8">{scoreData.scoreText || "Great Job!"}</h3>
            
            {/* 2. Accuracy & XP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 rounded-2xl p-4 shadow-sm border border-blue-100">
                <p className="text-blue-600 font-black text-3xl">{scoreData.accuracy}%</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Accuracy</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-4 shadow-sm border border-amber-100">
                <p className="text-amber-600 font-black text-3xl">+{scoreData.xpEarned}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">XP Earned</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 shadow-sm border border-emerald-100">
                <p className="text-emerald-600 font-black text-3xl">{scoreData.correctCount} / {targetWords.length}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Words Read</p>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 shadow-sm border border-purple-100">
                <p className="text-purple-600 font-black text-3xl">{scoreData.timeTaken}s</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Time</p>
              </div>
            </div>

            {/* 3. Words to Practice (Feedback) */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
              <h4 className="text-lg font-black text-slate-700 mb-4">Words To Practice</h4>
              <p className="text-2xl font-medium leading-relaxed" style={{ fontFamily: "Comic Sans MS, 'OpenDyslexic', sans-serif" }}>
                {scoreData.wordFeedback?.map((fb, idx) => {
                  let colorClass = "text-emerald-500 font-bold"; // 🟢 Correct
                  if (fb.status === "nearly") colorClass = "text-emerald-400 font-bold"; // 🟢 Nearly Correct
                  if (fb.status === "skipped") colorClass = "text-yellow-500 font-bold underline decoration-yellow-300 decoration-2 underline-offset-4"; // 🟡 Skipped
                  if (fb.status === "incorrect") colorClass = "text-red-500 font-bold underline decoration-red-300 decoration-2 underline-offset-4"; // 🔴 Incorrect
                  
                  return (
                    <span key={idx} className={`inline-block mx-1 ${colorClass}`}>
                      {fb.word}{" "}
                    </span>
                  );
                })}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={retry}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-lg text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition shadow-sm cursor-pointer"
              >
                <RefreshCw size={24} /> Try Again
              </button>
              <button
                onClick={nextPassage}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-black text-lg rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition hover:scale-105 cursor-pointer"
              >
                <PlayCircle size={24} /> Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* Controls (LISTEN, PRACTICE, ASSESS) */}
        {phase !== "RESULT" && phase !== "PROMPT_RESUME" && (
          <div className="flex flex-col items-center gap-6">
            {!speechSupported && phase === "ASSESS" && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-xl text-center w-full max-w-2xl shadow-sm mb-4">
                <p className="font-bold mb-1">🎙️ Voice reading is not supported.</p>
                <p className="text-sm">Click 'Parent Verify' when finished reading.</p>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4">
              
              {phase === "LISTEN" && (
                <button
                  onClick={playTTS}
                  className="flex items-center gap-3 px-8 py-4 rounded-full font-black text-xl text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-transform hover:scale-105 cursor-pointer"
                >
                  <Volume2 size={28} /> Listen
                </button>
              )}

              {phase === "PRACTICE" && (
                <>
                  <button
                    onClick={() => setPhase("ASSESS")}
                    className="flex items-center gap-3 px-8 py-4 rounded-full font-black text-xl text-white bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-200 transition-transform hover:scale-105 cursor-pointer"
                  >
                    <Mic size={28} /> Start Reading Test
                  </button>
                  <button
                    onClick={playTTS}
                    className="flex items-center gap-3 px-6 py-4 rounded-full font-bold text-lg text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-50 transition shadow-sm cursor-pointer"
                  >
                    <Volume2 size={24} /> Listen Again
                  </button>
                </>
              )}

              {phase === "ASSESS" && speechSupported && (
                <button
                  onClick={isListening ? stopAssessment : startAssessment}
                  className={`flex items-center gap-3 px-8 py-4 rounded-full font-black text-xl text-white shadow-xl transition-transform hover:scale-105 cursor-pointer ${
                    isListening ? "bg-red-500 hover:bg-red-600 shadow-red-200 animate-pulse" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
                  }`}
                >
                  {isListening ? (
                    <><CheckCircle size={28} /> Finish Reading</>
                  ) : (
                    <><Mic size={28} /> Start Microphone</>
                  )}
                </button>
              )}
              
              {phase === "ASSESS" && !speechSupported && (
                <button
                  onClick={finalizeFallback}
                  className="flex items-center gap-2 px-8 py-4 rounded-full font-black text-xl text-white bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-200 transition cursor-pointer"
                >
                  <CheckCircle size={24} /> Parent Verify Complete
                </button>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
