import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft, Volume2, Mic, Target, Sparkles, CheckCircle, StopCircle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sentenceBank, storyCreatorWords } from "../../data/sentenceBuilderData";
import { useActivityProgress } from "../../activityEngine/useActivityProgress";
import RewardPopup from "../../components/explorer/RewardPopup";
import { useReward } from "../../rewardSystem/RewardContext";

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function generateSession(categoryStr) {
  const catData = sentenceBank[categoryStr];
  if (!catData) return [];
  
  let session = [];
  
  const addQs = (type, list, count) => {
    const selected = shuffle(list).slice(0, count);
    selected.forEach(item => session.push({ ...item, type }));
  };

  addQs('PICTURE_STORY', catData.pictureStories, 2);
  addQs('FINISH_STORY', catData.finishStories, 2);
  addQs('TALKING', catData.talking, 2);
  addQs('CHOOSE_BEST', catData.chooseBest, 2);
  addQs('EMOJI_STORY', catData.emojiStories, 2);
  
  session = shuffle(session);
  // Always end with Story Creator
  session.push({ type: 'STORY_CREATOR' });
  
  return session;
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function SentenceBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveProgress, loadProgress } = useActivityProgress();
  const { triggerReward } = useReward();

  // App State
  const [view, setView] = useState("MENU"); // MENU, PLAY, RESULT
  const [sessionData, setSessionData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCategory, setCurrentCategory] = useState("Animals");
  
  // Stats
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [accuracyHistory, setAccuracyHistory] = useState([]);
  const [voiceAccuracySum, setVoiceAccuracySum] = useState(0);
  const [voiceTasksCount, setVoiceTasksCount] = useState(0);
  
  // Game State
  const [feedback, setFeedback] = useState(null); // { status: 'correct'|'incorrect'|'stars', message: string }
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Story Creator State
  const [creatorSelections, setCreatorSelections] = useState({ subj: null, verb: null, obj: null });

  const synth = window.speechSynthesis;

  // Restore session
  useEffect(() => {
    const init = async () => {
      const local = localStorage.getItem(`sentenceAdventure_${user?._id}`);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed.sessionData && parsed.currentIndex < parsed.sessionData.length) {
            setSessionData(parsed.sessionData);
            setCurrentIndex(parsed.currentIndex);
            setCurrentCategory(parsed.currentCategory || "Animals");
            setScore(parsed.score || 0);
            setXpEarned(parsed.xpEarned || 0);
            setAccuracyHistory(parsed.accuracyHistory || []);
            setVoiceAccuracySum(parsed.voiceAccuracySum || 0);
            setVoiceTasksCount(parsed.voiceTasksCount || 0);
            setView("PLAY");
            initQuestion(parsed.sessionData[parsed.currentIndex]);
          }
        } catch(e) {}
      }
    };
    init();
  }, [user]);

  // Sync to localstorage
  useEffect(() => {
    if (view === "PLAY" && sessionData.length > 0) {
      localStorage.setItem(`sentenceAdventure_${user?._id}`, JSON.stringify({
        sessionData, currentIndex, currentCategory, score, xpEarned, accuracyHistory, voiceAccuracySum, voiceTasksCount
      }));
    }
  }, [view, currentIndex, score, xpEarned, sessionData, accuracyHistory, voiceAccuracySum, voiceTasksCount]);

  const initQuestion = (q) => {
    setFeedback(null);
    setIsListening(false);
    setCreatorSelections({ subj: null, verb: null, obj: null });
    
    // Auto read instruction
    setTimeout(() => speakText(getInstructionText(q)), 500);
  };

  const startSession = (category) => {
    setCurrentCategory(category);
    const qs = generateSession(category);
    setSessionData(qs);
    setCurrentIndex(0);
    setScore(0);
    setXpEarned(0);
    setAccuracyHistory([]);
    setVoiceAccuracySum(0);
    setVoiceTasksCount(0);
    setView("PLAY");
    initQuestion(qs[0]);
  };

  const speakText = (text) => {
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    synth.speak(utterance);
  };

  const getInstructionText = (q) => {
    switch (q.type) {
      case 'PICTURE_STORY': return "What is happening?";
      case 'FINISH_STORY': return "What happened next?";
      case 'TALKING': return "Listen, then say it!";
      case 'CHOOSE_BEST': return "Choose the best sentence.";
      case 'EMOJI_STORY': return "Choose the story.";
      case 'STORY_CREATOR': return "Pick 3 cards to make a story!";
      default: return "";
    }
  };

  const getRandomMascotPraise = () => {
    const praises = ["Great Job!", "Wonderful Reading!", "Amazing!", "You got it!"];
    return praises[Math.floor(Math.random() * praises.length)];
  };

  const handleCorrect = () => {
    setFeedback({ status: 'correct', message: `🦉 ${getRandomMascotPraise()}` });
    setScore(s => s + 1);
    setXpEarned(x => x + 2);
    setAccuracyHistory(h => [...h, 1]);
    setTimeout(nextQuestion, 2000);
  };

  const handleIncorrect = () => {
    setFeedback({ status: 'incorrect', message: "Let's try that again!" });
    setAccuracyHistory(h => [...h, 0]);
    setTimeout(() => setFeedback(null), 1500);
  };

  const nextQuestion = () => {
    if (currentIndex < sessionData.length - 1) {
      setCurrentIndex(i => i + 1);
      initQuestion(sessionData[currentIndex + 1]);
    } else {
      finishSession();
    }
  };

  const checkOption = (selected, target) => {
    if (selected === target) handleCorrect();
    else handleIncorrect();
  };

  // --- Voice Practice Logic ---
  const startListening = (targetText) => {
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    
    if (synth.speaking) synth.cancel();
    setIsListening(true);
    setFeedback(null);

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      const target = targetText.toLowerCase().replace(/[.,!]/g, '');
      const spoken = transcript.replace(/[.,!]/g, '');
      
      // Calculate similarity (basic inclusion or direct match)
      const targetWords = target.split(' ');
      const spokenWords = spoken.split(' ');
      let matches = 0;
      targetWords.forEach(w => { if(spokenWords.includes(w)) matches++; });
      const accuracy = Math.round((matches / targetWords.length) * 100);

      setVoiceTasksCount(v => v + 1);
      setVoiceAccuracySum(s => s + accuracy);

      if (accuracy >= 80) {
        setFeedback({ status: 'stars', message: `⭐⭐⭐ Amazing Reading! (${accuracy}%)` });
        setScore(s => s + 1);
        setXpEarned(x => x + 3); // Extra XP for voice
        setAccuracyHistory(h => [...h, 1]);
      } else if (accuracy >= 50) {
        setFeedback({ status: 'stars', message: `⭐⭐ Excellent! (${accuracy}%)` });
        setScore(s => s + 1);
        setXpEarned(x => x + 2);
        setAccuracyHistory(h => [...h, 1]);
      } else {
        setFeedback({ status: 'stars', message: `⭐ Great Job trying! (${accuracy}%)` });
        setScore(s => s + 1);
        setXpEarned(x => x + 1);
        setAccuracyHistory(h => [...h, 1]);
      }

      setTimeout(nextQuestion, 2500);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setFeedback({ status: 'incorrect', message: "Didn't quite catch that. Try again!" });
      setTimeout(() => setFeedback(null), 1500);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // --- Story Creator Logic ---
  const handleCreatorSelect = (type, item) => {
    setCreatorSelections(prev => {
      const next = { ...prev, [type]: item };
      if (next.subj && next.verb && next.obj) {
        // Complete!
        const sentence = `${next.subj.word} ${next.verb.word} ${next.obj.word}`;
        setFeedback({ status: 'correct', message: `🦉 Let's Create Another Story! (${sentence})` });
        speakText(sentence);
        setXpEarned(x => x + 5);
        setTimeout(finishSession, 3500);
      }
      return next;
    });
  };

  const finishSession = async () => {
    let finalXp = xpEarned + 10; // Completion bonus
    setXpEarned(finalXp);
    
    const accuracy = Math.round((accuracyHistory.filter(a => a === 1).length / sessionData.length) * 100) || 0;
    const voiceAcc = voiceTasksCount > 0 ? Math.round(voiceAccuracySum / voiceTasksCount) : 0;

    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/child-progress/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id,
          activityType: "sentence_builder",
          score: score,
          xpEarned: finalXp,
          accuracy: accuracy,
          currentLevel: currentCategory,
          completed: true,
        }),
      });
    } catch (error) {
      console.error("Failed to save progress", error);
    }
    
    localStorage.removeItem(`sentenceAdventure_${user._id}`);
    triggerReward(finalXp, `Completed ${currentCategory} Adventure!`);
    setView("RESULT");
  };

  // --- RENDERING ---
  if (view === "MENU") {
    let continueData = null;
    try {
      const local = localStorage.getItem(`sentenceAdventure_${user?._id}`);
      if (local) continueData = JSON.parse(local);
    } catch(e) {}

    const categories = [
      { name: "Animals", icon: "🐶", color: "bg-amber-100 border-amber-300 text-amber-800" },
      { name: "School", icon: "🎒", color: "bg-blue-100 border-blue-300 text-blue-800" },
      { name: "Family", icon: "👨‍👩‍👧", color: "bg-rose-100 border-rose-300 text-rose-800" },
      { name: "Nature", icon: "🌳", color: "bg-emerald-100 border-emerald-300 text-emerald-800" },
      { name: "Adventure", icon: "🚀", color: "bg-purple-100 border-purple-300 text-purple-800" },
      { name: "Friends", icon: "🤝", color: "bg-teal-100 border-teal-300 text-teal-800" }
    ];

    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-800">
        <header className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate("/beginner")} className="p-2 hover:bg-slate-200 rounded-full transition">
            <ArrowLeft size={28} />
          </button>
          <h1 className="font-black text-4xl flex items-center gap-3"><Sparkles className="text-amber-500" /> Sentence Adventure</h1>
        </header>

        {continueData && continueData.sessionData && (
          <div 
            onClick={() => {
              setSessionData(continueData.sessionData);
              setCurrentIndex(continueData.currentIndex);
              setCurrentCategory(continueData.currentCategory);
              setScore(continueData.score);
              setXpEarned(continueData.xpEarned);
              setAccuracyHistory(continueData.accuracyHistory);
              setVoiceAccuracySum(continueData.voiceAccuracySum || 0);
              setVoiceTasksCount(continueData.voiceTasksCount || 0);
              setView("PLAY");
              initQuestion(continueData.sessionData[continueData.currentIndex]);
            }}
            className="mb-8 p-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2.5rem] text-white shadow-lg cursor-pointer hover:scale-[1.02] transition relative overflow-hidden"
          >
            <h2 className="text-xl font-bold text-amber-100 uppercase tracking-wider mb-2">🗺️ Continue Adventure</h2>
            <div className="flex justify-between items-end relative z-10">
              <div>
                <p className="text-4xl font-black">{continueData.currentCategory}</p>
                <p className="text-amber-50 mt-2 font-medium text-lg">Question {continueData.currentIndex + 1} of {continueData.sessionData.length}</p>
              </div>
              <button className="bg-white text-amber-600 px-8 py-4 rounded-2xl font-black text-xl shadow-sm">Resume</button>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-6 text-slate-500 uppercase tracking-widest">Choose a Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map(cat => (
            <div key={cat.name} onClick={() => startSession(cat.name)} className={`p-8 rounded-[2.5rem] border-4 cursor-pointer hover:scale-[1.03] transition shadow-sm ${cat.color} flex flex-col items-center text-center`}>
              <div className="text-6xl mb-4 filter drop-shadow-md">{cat.icon}</div>
              <h3 className="text-3xl font-black">{cat.name}</h3>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === "RESULT") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <RewardPopup />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-[3rem] shadow-xl border-4 border-amber-100 max-w-2xl w-full">
          <div className="text-[6rem] mb-6 animate-bounce">🦉</div>
          <h2 className="text-5xl font-black text-slate-800 mb-4">Adventure Complete!</h2>
          <p className="text-2xl text-slate-500 font-bold mb-10">{currentCategory} Explorer</p>
          
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="bg-blue-50 p-6 rounded-[2rem] border-2 border-blue-100">
              <p className="text-blue-600 font-black text-4xl mb-1">{score} / {sessionData.length}</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Correct</p>
            </div>
            <div className="bg-amber-50 p-6 rounded-[2rem] border-2 border-amber-100">
              <p className="text-amber-600 font-black text-4xl mb-1">+{xpEarned}</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">XP Earned</p>
            </div>
          </div>
          
          <button onClick={() => setView("MENU")} className="w-full py-6 bg-amber-500 hover:bg-amber-600 text-white font-black text-2xl rounded-3xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-3">
            <CheckCircle size={32} /> Back to Map
          </button>
        </motion.div>
      </div>
    );
  }

  // PLAY VIEW
  const q = sessionData[currentIndex];
  if (!q) return null;

  const renderOptions = (options, target) => {
    return (
      <div className="flex flex-col gap-4 w-full max-w-2xl mt-8">
        {shuffle([...options]).map((opt, i) => (
          <button 
            key={i} onClick={() => { speakText(opt); checkOption(opt, target); }}
            className={`w-full p-8 rounded-[2rem] border-4 text-left transition flex justify-between items-center ${
              feedback?.status === 'correct' && opt === target ? 'bg-emerald-50 border-emerald-400' :
              feedback?.status === 'incorrect' ? 'bg-red-50 border-red-200 opacity-50' :
              'bg-white border-slate-100 hover:border-amber-200 hover:shadow-md'
            }`}
          >
            <span className="text-2xl md:text-3xl font-medium tracking-wide text-slate-800" style={{ fontFamily: "Comic Sans MS, 'OpenDyslexic', sans-serif" }}>{opt}</span>
            <Volume2 size={32} className="text-slate-300 hover:text-blue-500 transition" onClick={(e) => { e.stopPropagation(); speakText(opt); }} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans bg-amber-50/30 text-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-4 border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => setView("MENU")} className="p-3 hover:bg-slate-100 rounded-full text-slate-500 transition">
            <ArrowLeft size={28} />
          </button>
          <div>
            <div className="flex gap-2 mb-1">
              {sessionData.map((_, i) => (
                <div key={i} className={`h-3 w-6 md:w-8 rounded-full ${i < currentIndex ? 'bg-amber-400' : i === currentIndex ? 'bg-blue-400 animate-pulse' : 'bg-slate-200'}`} />
              ))}
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-wider">Question {currentIndex + 1}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-100 px-5 py-3 rounded-2xl border-2 border-amber-200">
            <Sparkles size={20} className="text-amber-500" />
            <span className="font-black text-amber-700 text-lg">{xpEarned} XP</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto p-6 md:p-10 flex flex-col items-center justify-center max-w-5xl">
        
        {/* Instruction Banner */}
        <div className="text-center mb-10 w-full flex flex-col items-center">
          <button onClick={() => speakText(getInstructionText(q))} className="mb-4 text-blue-500 bg-blue-50 p-4 rounded-full hover:scale-110 transition shadow-sm">
            <Volume2 size={40} />
          </button>
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
            {getInstructionText(q)}
          </h2>
        </div>

        {/* --- GAME RENDERERS --- */}
        
        {q.type === 'PICTURE_STORY' && (
          <div className="w-full flex flex-col items-center">
            <div className="flex gap-4 mb-4">
              {q.emojis.map((em, i) => (
                <div key={i} className="text-[7rem] md:text-[9rem] filter drop-shadow-xl animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>{em}</div>
              ))}
            </div>
            {renderOptions([q.target, ...q.distractors], q.target)}
          </div>
        )}

        {q.type === 'FINISH_STORY' && (
          <div className="w-full flex flex-col items-center">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border-4 border-indigo-100 mb-4 w-full max-w-2xl text-center">
              <p className="text-4xl font-medium leading-[1.6]" style={{ fontFamily: "Comic Sans MS, 'OpenDyslexic', sans-serif" }}>
                {q.story}
              </p>
            </div>
            {renderOptions([q.target, ...q.distractors], q.target)}
          </div>
        )}

        {q.type === 'CHOOSE_BEST' && (
          <div className="w-full flex flex-col items-center">
            <div className="text-[10rem] filter drop-shadow-xl mb-4">{q.emoji}</div>
            {renderOptions([q.target, ...q.distractors], q.target)}
          </div>
        )}

        {q.type === 'EMOJI_STORY' && (
          <div className="w-full flex flex-col items-center">
            <div className="flex gap-4 mb-4 bg-white p-8 rounded-[3rem] border-4 border-slate-100 shadow-sm">
              {q.emojis.map((em, i) => (
                <div key={i} className="text-[6rem] filter drop-shadow-lg">{em}</div>
              ))}
            </div>
            {renderOptions([q.target, ...q.distractors], q.target)}
          </div>
        )}

        {q.type === 'TALKING' && (
          <div className="w-full flex flex-col items-center">
            <div className="bg-white p-12 rounded-[3rem] shadow-sm border-4 border-blue-100 mb-10 w-full max-w-3xl text-center">
              <p className="text-4xl md:text-5xl font-medium leading-[1.6]" style={{ fontFamily: "Comic Sans MS, 'OpenDyslexic', sans-serif" }}>
                "{q.target}"
              </p>
            </div>
            
            <div className="flex gap-6">
              <button 
                onClick={() => speakText(q.target)}
                className="bg-blue-500 text-white px-10 py-6 rounded-[2rem] font-black text-2xl shadow-lg hover:bg-blue-600 transition flex items-center gap-3"
              >
                <Volume2 size={32} /> Listen
              </button>
              
              {!isListening ? (
                <button 
                  onClick={() => startListening(q.target)}
                  className="bg-rose-500 text-white px-10 py-6 rounded-[2rem] font-black text-2xl shadow-lg hover:bg-rose-600 hover:scale-105 transition flex items-center gap-3"
                >
                  <Mic size={32} /> Say It
                </button>
              ) : (
                <button 
                  onClick={stopListening}
                  className="bg-slate-800 text-white px-10 py-6 rounded-[2rem] font-black text-2xl shadow-lg animate-pulse flex items-center gap-3"
                >
                  <StopCircle size={32} /> Listening...
                </button>
              )}
            </div>
          </div>
        )}

        {q.type === 'STORY_CREATOR' && (
          <div className="w-full flex flex-col items-center max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
              
              {/* Subjects */}
              <div className="bg-white p-6 rounded-[2.5rem] border-4 border-emerald-100 shadow-sm flex flex-col items-center">
                <h3 className="text-xl font-bold text-emerald-500 uppercase tracking-wider mb-4">Who?</h3>
                <div className="flex flex-col gap-3 w-full">
                  {storyCreatorWords.subjects.slice(0, 4).map((item, i) => (
                    <button 
                      key={i} onClick={() => { speakText(item.word); handleCreatorSelect('subj', item); }}
                      className={`p-4 rounded-2xl border-4 text-left flex justify-between items-center transition ${creatorSelections.subj?.word === item.word ? 'bg-emerald-100 border-emerald-400' : 'border-slate-100 hover:border-emerald-200'}`}
                    >
                      <span className="text-2xl font-bold">{item.word}</span>
                      <span className="text-4xl">{item.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Verbs */}
              <div className="bg-white p-6 rounded-[2.5rem] border-4 border-amber-100 shadow-sm flex flex-col items-center">
                <h3 className="text-xl font-bold text-amber-500 uppercase tracking-wider mb-4">Does What?</h3>
                <div className="flex flex-col gap-3 w-full">
                  {storyCreatorWords.verbs.slice(0, 4).map((item, i) => (
                    <button 
                      key={i} onClick={() => { speakText(item.word); handleCreatorSelect('verb', item); }}
                      className={`p-4 rounded-2xl border-4 text-left flex justify-between items-center transition ${creatorSelections.verb?.word === item.word ? 'bg-amber-100 border-amber-400' : 'border-slate-100 hover:border-amber-200'}`}
                    >
                      <span className="text-2xl font-bold">{item.word}</span>
                      <span className="text-4xl">{item.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Objects */}
              <div className="bg-white p-6 rounded-[2.5rem] border-4 border-purple-100 shadow-sm flex flex-col items-center">
                <h3 className="text-xl font-bold text-purple-500 uppercase tracking-wider mb-4">Where/How?</h3>
                <div className="flex flex-col gap-3 w-full">
                  {storyCreatorWords.objects.slice(0, 4).map((item, i) => (
                    <button 
                      key={i} onClick={() => { speakText(item.word); handleCreatorSelect('obj', item); }}
                      className={`p-4 rounded-2xl border-4 text-left flex justify-between items-center transition ${creatorSelections.obj?.word === item.word ? 'bg-purple-100 border-purple-400' : 'border-slate-100 hover:border-purple-200'}`}
                    >
                      <span className="text-2xl font-bold">{item.word}</span>
                      <span className="text-4xl">{item.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Feedback Overlay */}
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }} 
              className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-12 py-8 rounded-[3rem] flex items-center gap-6 shadow-2xl z-50 ${
                feedback.status === 'correct' ? 'bg-emerald-500 text-white' : 
                feedback.status === 'stars' ? 'bg-amber-400 text-slate-800' : 'bg-rose-500 text-white'
              }`}
            >
              {feedback.status === 'incorrect' ? <RefreshCw size={48} className="animate-spin" /> : 
               feedback.status === 'stars' ? <Sparkles size={48} className="text-amber-800" /> : <Check size={48} />}
              <span className="text-4xl font-black">{feedback.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
