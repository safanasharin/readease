import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Undo2, Volume2, PlayCircle, Info, CheckCircle, Lock, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LetterCanvas from "../../../components/explorer/LetterCanvas";
import MascotGuide from "../../../components/explorer/MascotGuide";
import { useAuth } from "../../../context/AuthContext";
import { ALPHABET_DATA } from "../../../data/alphabetPaths";
import { PHONICS_DICTIONARY } from "../../../data/phonicsData";

const UPPERCASE = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
const LOWERCASE = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i));
const ALL_LETTERS = [...UPPERCASE, ...LOWERCASE];

export default function TracingActivity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef(null);

  const [completedLetters, setCompletedLetters] = useState(new Set());
  const [bestScores, setBestScores] = useState({});
  const [activeLetter, setActiveLetter] = useState("A");
  
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(null);
  const [attemptCount, setAttemptCount] = useState(1);
  const [consecutiveFails, setConsecutiveFails] = useState(0); 
  const [isSaving, setIsSaving] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  
  // Animation State
  const [showDemo, setShowDemo] = useState(true); 
  const [animKey, setAnimKey] = useState(0); 
  const [demoStep, setDemoStep] = useState(0); 

  const letterData = ALPHABET_DATA[activeLetter] || ALPHABET_DATA["A"];
  const token = localStorage.getItem("token");

  // Helper to process progress array
  const updateStateFromData = (data) => {
    const records = data.progress || (Array.isArray(data) ? data : []);
    if (Array.isArray(records)) {
      const tracingData = records.filter(d => d.activityType === "letter_tracing");
      const completed = new Set();
      const scores = {};
      tracingData.forEach(d => {
        if (d.completed) completed.add(d.letter);
        if (d.score > (scores[d.letter] || 0)) scores[d.letter] = d.score;
      });
      setCompletedLetters(completed);
      setBestScores(scores);

      // Find furthest unlocked letter
      let currentUnlocked = "A";
      for (let l of ALL_LETTERS) {
        if (!completed.has(l)) {
          currentUnlocked = l;
          break;
        }
      }
      setActiveLetter(currentUnlocked);
    }
  };

  // Initial Progress Fetch
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user?._id || !token) return;
      
      // 1. Local Storage Fallback
      const cached = localStorage.getItem(`readease_tracing_${user._id}`);
      if (cached) {
        try { updateStateFromData(JSON.parse(cached)); } catch(e) {}
      }

      // 2. Fetch from MongoDB
      try {
        const res = await fetch(`http://localhost:5000/api/child-progress/user/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        updateStateFromData(data);
        localStorage.setItem(`readease_tracing_${user._id}`, JSON.stringify(data));
      } catch (err) {
        console.error("Failed to load tracing progress", err);
      }
    };
    fetchProgress();
  }, [user?._id, token]);

  const highestUnlockedIndex = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < ALL_LETTERS.length; i++) {
      if (!completedLetters.has(ALL_LETTERS[i])) {
        idx = i;
        break;
      }
    }
    return Math.min(idx, ALL_LETTERS.length - 1);
  }, [completedLetters]);

  const uppercaseCompleted = UPPERCASE.filter(l => completedLetters.has(l)).length;
  const lowercaseCompleted = LOWERCASE.filter(l => completedLetters.has(l)).length;
  const isUppercaseFinished = uppercaseCompleted === 26;

  // Audio Engine
  const speakSentence = (text, rate = 0.8) => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  };

  const speakLetterIntro = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const data = PHONICS_DICTIONARY[activeLetter];
    if (data) {
      speakSentence(data.text, 0.85);
    }
  };

  const speakInstruction = (text) => {
    window.speechSynthesis.cancel();
    speakSentence(text, 0.9);
  };

  useEffect(() => {
    const t = setTimeout(speakLetterIntro, 500);
    startDemonstration();
    return () => clearTimeout(t);
  }, [activeLetter]);

  const startDemonstration = () => {
    setShowDemo(true);
    setAnimKey(prev => prev + 1);
    setDemoStep(0);
  };

  useEffect(() => {
    if (showDemo && demoStep < letterData.strokes.length) {
       const timer = setTimeout(() => {
         setDemoStep(prev => prev + 1);
       }, 1500); 
       return () => clearTimeout(timer);
    } else if (showDemo && demoStep >= letterData.strokes.length) {
       const endTimer = setTimeout(() => {
         setShowDemo(false);
       }, 1000);
       return () => clearTimeout(endTimer);
    }
  }, [demoStep, showDemo, animKey, letterData.strokes.length]);

  const saveProgressToDB = async (finalScore, isSuccess) => {
    if (!user?._id || !token || isPracticeMode) return;
    try {
      setIsSaving(true);
      await fetch("http://localhost:5000/api/child-progress/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: user._id,
          activityType: "letter_tracing",
          letter: activeLetter,
          completed: isSuccess,
          score: finalScore,
          attempts: attemptCount,
          date: new Date()
        })
      });
      
      if (isSuccess) {
         setCompletedLetters(prev => {
            const next = new Set(prev);
            next.add(activeLetter);
            return next;
         });
         setBestScores(prev => ({ ...prev, [activeLetter]: Math.max(prev[activeLetter] || 0, finalScore) }));

         // Cache in LocalStorage instantly
         try {
           const cached = localStorage.getItem(`readease_tracing_${user._id}`);
           let parsed = cached ? JSON.parse(cached) : { progress: [] };
           let data = parsed.progress || (Array.isArray(parsed) ? parsed : []);
           data.push({ activityType: "letter_tracing", letter: activeLetter, completed: true, score: finalScore });
           localStorage.setItem(`readease_tracing_${user._id}`, JSON.stringify({ progress: data }));
         } catch(e) {}
      }
    } catch (err) {
      console.error("Failed to save tracing progress:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCheckTracing = async () => {
    const finalScore = canvasRef.current?.calculateAccuracy() || 0;
    setScore(finalScore);
    const isSuccess = finalScore >= 60;
    setIsComplete(true);

    if (isSuccess) {
       setConsecutiveFails(0);
    } else {
       setConsecutiveFails(prev => prev + 1);
    }

    if (!isPracticeMode) {
      await saveProgressToDB(finalScore, isSuccess);
    }
  };

  const handleNextLetter = () => {
    const currIdx = ALL_LETTERS.indexOf(activeLetter);
    if (currIdx < ALL_LETTERS.length - 1) {
      setActiveLetter(ALL_LETTERS[currIdx + 1]);
      resetTurn(true);
    }
  };

  const resetTurn = (isNewLetter = false) => {
    setIsComplete(false);
    setScore(null);
    if (!isNewLetter) setAttemptCount(prev => prev + 1);
    else setAttemptCount(1);
    canvasRef.current?.clearCanvas();
  };

  const playDemoAgain = () => {
    startDemonstration();
    speakLetterIntro();
  };

  const getFeedback = (s) => {
    if (isPracticeMode) return { msg: "🎨 Great Practice!", type: "practice" };
    if (s >= 90) return { msg: "🎉 Excellent Work!", sub: "You traced the letter perfectly.", type: "success" };
    if (s >= 80) return { msg: "🌟 Great Job!", sub: "Your tracing is very accurate.", type: "success" };
    if (s >= 70) return { msg: "⭐ Letter Completed!", sub: "You traced the letter correctly.", type: "success" };
    if (s >= 60) return { msg: "🎈 Amazing Effort!", sub: "You unlocked the next letter!", type: "success" };
    
    // Failed (< 60)
    const failMsgs = ["🌟 Nice Try!", "🎈 Almost There!", "💪 Let's Practice Again!", "🦁 Keep going, Explorer!"];
    return { msg: failMsgs[attemptCount % failMsgs.length], sub: "Let's follow the arrows closely this time.", type: "retry" };
  };

  const feedback = score !== null ? getFeedback(score) : null;
  const currentBest = bestScores[activeLetter] || 0;
  const showSmartAssistance = consecutiveFails >= 2;

  const renderAlphabetRow = (lettersArray, title) => (
    <div className="mb-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-2">{title}</h3>
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar px-2">
        {lettersArray.map((l) => {
          const idx = ALL_LETTERS.indexOf(l);
          const isUnlocked = idx <= highestUnlockedIndex;
          const isCompleted = completedLetters.has(l);
          const isActive = activeLetter === l;
          
          let btnClass = "flex-shrink-0 w-12 h-12 rounded-xl font-black text-xl flex items-center justify-center transition border-2 ";
          if (isActive) {
            btnClass += "bg-indigo-500 text-white border-indigo-600 shadow-md transform scale-110";
          } else if (isCompleted) {
            btnClass += "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 cursor-pointer";
          } else if (isUnlocked) {
            btnClass += "bg-white text-indigo-500 border-indigo-200 hover:bg-indigo-50 cursor-pointer";
          } else {
            btnClass += "bg-gray-100 text-gray-400 border-transparent cursor-not-allowed opacity-60";
          }

          return (
            <button 
              key={l} 
              disabled={!isUnlocked && !isActive}
              onClick={() => { setActiveLetter(l); resetTurn(true); }}
              className={btnClass}
            >
              {!isUnlocked && !isActive ? <Lock size={16} /> : l}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF9F0] p-4 md:p-6 flex flex-col items-center overflow-x-hidden">
      
      {/* HEADER */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <button onClick={() => navigate("/explorer")} className="flex items-center gap-2 text-indigo-600 font-black hover:bg-indigo-50 px-4 py-2 rounded-full transition cursor-pointer">
          <ArrowLeft size={20} /> Back
        </button>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-black text-indigo-700 tracking-tight">Alphabet Journey</h1>
          <button 
            onClick={() => setIsPracticeMode(!isPracticeMode)}
            className={`flex items-center gap-2 font-bold px-4 py-1.5 rounded-full text-sm transition border-2 ${
              isPracticeMode ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200"
            }`}
          >
            {isPracticeMode ? "🛠️ Practice Mode" : "Practice Off"}
          </button>
        </div>
      </div>

      {/* PROGRESS PANEL */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 bg-white p-5 rounded-3xl shadow-sm border-2 border-indigo-50 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Uppercase Progress</p>
            <p className="text-2xl font-black text-indigo-600">{uppercaseCompleted} / 26</p>
          </div>
          <div className="w-32 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${(uppercaseCompleted / 26) * 100}%` }}></div>
          </div>
        </div>

        <div className="flex-1 bg-white p-5 rounded-3xl shadow-sm border-2 border-indigo-50 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Lowercase Progress</p>
            <p className="text-2xl font-black text-indigo-600">{lowercaseCompleted} / 26</p>
          </div>
          <div className="w-32 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${(lowercaseCompleted / 26) * 100}%` }}></div>
          </div>
        </div>

        <div className="flex-1 bg-white p-5 rounded-3xl shadow-sm border-2 border-indigo-50 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Overall Alphabet</p>
            <p className="text-2xl font-black text-green-500">{completedLetters.size} / 52</p>
          </div>
          <div className="w-32 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(completedLetters.size / 52) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* ALPHABET SELECTOR MENU */}
      <div className="w-full max-w-6xl bg-white p-4 rounded-3xl shadow-sm border-2 border-indigo-50 mb-6">
        {renderAlphabetRow(UPPERCASE, "Uppercase Letters")}
        <div className="relative">
          {renderAlphabetRow(LOWERCASE, "Lowercase Letters")}
          {!isUppercaseFinished && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-10 border-2 border-dashed border-gray-200 mt-6">
              <p className="bg-white text-gray-600 font-bold px-6 py-2 rounded-full shadow-sm flex items-center gap-2 border border-gray-100">
                <Lock size={18} className="text-gray-400" /> Complete all uppercase letters to unlock lowercase letters.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN: INSTRUCTIONS & DEMO */}
        <div className="w-full lg:w-1/3 bg-white rounded-[2rem] p-6 shadow-xl border-4 border-indigo-100 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
               <Info size={20} className="text-blue-500" /> Watch & Learn
             </h2>
             <button onClick={speakLetterIntro} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 p-2.5 rounded-full transition cursor-pointer">
               <Volume2 size={22} />
             </button>
          </div>

          <div className="relative w-full aspect-square bg-[#FFF9F0] rounded-2xl border-2 border-indigo-50 flex items-center justify-center mb-6 overflow-hidden">
             {showDemo ? (
                <svg key={animKey} viewBox="0 0 320 320" className="w-full h-full">
                   {letterData.strokes.map((stroke, i) => (
                      i <= demoStep && (
                        <motion.path
                          key={i}
                          d={stroke.path}
                          fill="none"
                          stroke="#F43F5E" 
                          strokeWidth="20"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0, opacity: 0.8 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 1.2, ease: "easeInOut" }}
                        />
                      )
                   ))}
                </svg>
             ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                   <div className="text-6xl mb-4">👀</div>
                   <p className="text-lg font-black text-indigo-700 mb-2">Ready to trace!</p>
                   <button onClick={playDemoAgain} className="mt-2 bg-white border-2 border-indigo-200 text-indigo-600 font-bold px-4 py-2 rounded-full flex items-center gap-2 hover:bg-indigo-50 transition">
                     <PlayCircle size={18} /> Watch Again
                   </button>
                </div>
             )}
          </div>

          <div className="bg-indigo-50 rounded-2xl p-4 flex-1">
            <h3 className="font-black text-indigo-800 mb-3 text-sm uppercase tracking-wider">How to write {activeLetter}</h3>
            <div className="space-y-3">
              {letterData.strokes.map((step, idx) => (
                <div key={idx} className="flex gap-3 bg-white p-3 rounded-xl shadow-sm border border-indigo-100 items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">
                       {idx + 1}
                     </div>
                     <p className="text-sm font-bold text-gray-700 leading-tight">
                        Follow the dotted line
                     </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CANVAS & ACTIONS */}
        <div className="w-full lg:w-2/3 bg-white rounded-[2rem] p-6 shadow-xl border-4 border-indigo-100 relative overflow-hidden flex flex-col items-center">
          
          {showSmartAssistance && !isComplete && (
            <div className="w-full bg-blue-100 text-blue-800 p-3 rounded-xl mb-4 font-bold text-center flex items-center justify-center gap-2 border-2 border-blue-200 animate-pulse">
               <Info size={20} /> Look closely! Start at the pulsing green dot.
            </div>
          )}

          <AnimatePresence>
            {isComplete && feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute inset-0 z-30 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
              >
                {feedback.type === "success" && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(30)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: -50, x: '50vw', opacity: 1 }}
                        animate={{ y: 800, x: Math.random() * 800 - 400, rotate: Math.random() * 360 }}
                        transition={{ duration: 2.5 + Math.random(), repeat: Infinity }}
                        className={`absolute w-4 h-4 rounded-sm top-0 left-1/2 ${['bg-pink-400', 'bg-blue-400', 'bg-yellow-400', 'bg-green-400'][i % 4]}`}
                      />
                    ))}
                  </div>
                )}

                <div className="text-8xl mb-4">
                   {feedback.type === "success" ? "🏆" : feedback.type === "practice" ? "🎨" : "🌟"}
                </div>
                
                <h2 className={`text-4xl md:text-5xl font-black mb-3 ${feedback.type === "success" ? "text-green-500" : "text-indigo-500"}`}>
                  {feedback.msg}
                </h2>
                
                {feedback.sub && <p className="text-xl text-gray-600 font-bold mb-6 max-w-md">{feedback.sub}</p>}

                {!isPracticeMode && (
                  <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 mb-8 flex gap-6">
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase">Score</p>
                      <p className={`text-3xl font-black ${score >= 60 ? 'text-green-500' : 'text-amber-500'}`}>{score}%</p>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div>
                      <p className="text-sm font-bold text-gray-400 uppercase">Best</p>
                      <p className="text-3xl font-black text-indigo-500">{currentBest}%</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-4 z-10">
                  {feedback.type === "retry" || isPracticeMode ? (
                    <>
                      <button onClick={playDemoAgain} className="bg-indigo-100 text-indigo-700 px-8 py-4 rounded-full font-black text-xl hover:bg-indigo-200 transition flex items-center gap-2 border-2 border-indigo-200">
                        <PlayCircle size={22} /> Watch Example
                      </button>
                      <button onClick={() => resetTurn(false)} className="bg-indigo-500 text-white px-8 py-4 rounded-full font-black text-xl hover:bg-indigo-600 shadow-lg transition transform hover:scale-105 flex items-center gap-2">
                        <RefreshCw size={22} /> Try Again
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => resetTurn(false)} className="bg-green-100 text-green-700 px-6 py-4 rounded-full font-black text-lg hover:bg-green-200 transition">
                        Practice More
                      </button>
                      {activeLetter !== "z" ? (
                        <button onClick={handleNextLetter} className="bg-green-500 text-white px-8 py-4 rounded-full font-black text-xl hover:bg-green-600 shadow-lg transition transform hover:scale-105 flex items-center gap-2">
                          Next Letter <CheckCircle size={22} />
                        </button>
                      ) : (
                        <button onClick={() => navigate("/explorer")} className="bg-green-500 text-white px-8 py-4 rounded-full font-black text-xl hover:bg-green-600 shadow-lg transition flex items-center gap-2">
                          Alphabet Complete <CheckCircle size={22} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col items-center w-full flex-1 mb-6 mt-4">
            <LetterCanvas
              ref={canvasRef}
              letter={activeLetter}
              width={320}
              height={320}
              smartAssistance={showSmartAssistance}
            />
            
            <div className="flex justify-between w-full max-w-[320px] mt-4">
               <button onClick={() => canvasRef.current?.undo()} className="text-gray-500 hover:text-gray-700 font-bold flex items-center gap-1 text-sm bg-gray-100 px-3 py-1.5 rounded-full transition">
                  <Undo2 size={16} /> Undo Stroke
               </button>
               <button onClick={() => canvasRef.current?.clearCanvas()} className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1 text-sm bg-red-50 px-3 py-1.5 rounded-full transition">
                  <RefreshCw size={16} /> Clear All
               </button>
            </div>
          </div>

          <button
            onClick={handleCheckTracing}
            disabled={isSaving}
            className="w-full max-w-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-5 rounded-full font-black text-2xl shadow-xl transition transform hover:scale-[1.02] cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2 border-2 border-indigo-400 mt-2"
          >
            <CheckCircle size={28} />
            {isSaving ? "Saving..." : "Check My Tracing"}
          </button>
        </div>
      </div>
      
      <div className="mt-8 scale-90 w-full flex justify-center">
         <MascotGuide activity="tracing" mood="happy" />
      </div>
    </div>
  );
}
