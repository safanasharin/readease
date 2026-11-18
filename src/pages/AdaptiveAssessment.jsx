import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { 
  Volume2, Eye, Type, Sun, Sparkles, 
  ArrowRight, RefreshCw, AlertTriangle, CheckCircle, HelpCircle, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdaptiveAssessment() {
  const { ageGroup } = useParams();
  const navigate = useNavigate();
  const { user, token, updateUser, logout, refreshUser } = useAuth();

  // Core assessment states
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Timing states
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  // Accessibility preferences state
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [fontSize, setFontSize] = useState(20); // default 20px for high readability
  const [doubleSpacing, setDoubleSpacing] = useState(false);
  const [lowDistraction, setLowDistraction] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(ageGroup === "explorer");

  // Interaction feedback states
  const [timedOut, setTimedOut] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isLastStep, setIsLastStep] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);

  // Emojis and cartoon comments for child-friendly feedback
  const encouragingPhrases = [
    "Amazing job! You are doing awesome! 🌟",
    "Keep it up, superstar! 🚀",
    "You are a reading champion! 🎉",
    "Wow, fantastic effort! 🎈",
    "Super cool! Let's check the next one! 🐱",
    "Brilliant! You're a natural learner! 🧸",
    "So proud of your hard work! 🌈"
  ];

  // Load user specific accessibility preferences if they exist
  useEffect(() => {
    if (user?.accessibilityPreferences) {
      const prefs = user.accessibilityPreferences;
      if (prefs.dyslexicFontEnabled !== null) setDyslexicFont(prefs.dyslexicFontEnabled);
      if (prefs.fontSize !== null) setFontSize(prefs.fontSize);
      if (prefs.lineSpacing !== null) setDoubleSpacing(prefs.lineSpacing > 1.8);
      if (prefs.ttsEnabled !== null) setTtsEnabled(prefs.ttsEnabled);
    }
  }, [user]);

  // Fetch assessment questions from the backend
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("http://localhost:5000/api/assessment/start", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          if (response.status === 401 || response.status === 403 || data.message === "Token is not valid") {
            logout();
            navigate("/");
            return;
          }
          throw new Error(data.message || "Failed to load assessment questions");
        }

        setQuestions(data.questions || []);
        setSessionId(data.sessionId || "");
        setStartTime(Date.now());
      } catch (err) {
        console.error("Fetch assessment error:", err);
        setError(err.message || "An error occurred while loading questions.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAssessment();
    }
  }, [token]);

  // Trigger TTS voice instruction helper
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = ageGroup === "explorer" || ageGroup === "beginner" ? 0.8 : 0.92;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Automatically read questions for younger children or if TTS is enabled
  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length && !loading && !showFeedback && !assessmentResult) {
      const q = questions[currentIndex];
      // Clean up text if it contains image names
      let textToSpeak = q.question;
      if (ageGroup === "explorer" && q.category === "image_recognition") {
        textToSpeak = q.question.replace(/\.png/g, "");
      }
      
      // Auto read if explorer or if user toggled auto tts
      if (ageGroup === "explorer" || ttsEnabled) {
        // Delay slightly for transition
        const t = setTimeout(() => {
          speakText(textToSpeak);
        }, 600);
        return () => clearTimeout(t);
      }
    }
  }, [currentIndex, questions, loading, showFeedback, assessmentResult, ttsEnabled]);

  // When the timer fires, call handleNext(true) with fresh closure
  useEffect(() => {
    if (timedOut) {
      setTimedOut(false);
      handleNext(true);
    }
  }, [timedOut]);

  // Question Timer setting (For advanced timed category, or standard safety limit)
  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length && !loading && !showFeedback && !assessmentResult) {
      const q = questions[currentIndex];
      const timeLimitMs = q.metadata?.responseTimeLimitMs || (ageGroup === "advanced" ? 45000 : 20000);
      setTimeLeft(Math.ceil(timeLimitMs / 1000));

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Don't call handleNext here — it's a stale closure.
            // Instead, signal via state so the timedOut effect fires with fresh values.
            setTimedOut(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, questions, loading, showFeedback, assessmentResult]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    
    // Play sound or read aloud choice for younger children
    if (ageGroup === "explorer") {
      let optionSpoken = option.replace(/\.png/g, "");
      speakText(optionSpoken);
    }
  };

  const handleNext = (isTimeout = false) => {
    if (questions.length === 0) return;
    
    const timeLimitMs = questions[currentIndex].metadata?.responseTimeLimitMs || 15000;
    const elapsed = Date.now() - startTime;
    const finalElapsed = isTimeout ? timeLimitMs : Math.min(elapsed, timeLimitMs);

    // Save current answer
    const currentAnswer = {
      questionId: questions[currentIndex].id,
      selectedOption: isTimeout ? "" : selectedOption,
      responseTimeMs: finalElapsed,
    };

    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);

    // Provide encouragement feedback (UX requirement)
    // Especially for young children (explorer & beginner), replace negative popups with encouragement
    if (ageGroup === "explorer" || ageGroup === "beginner") {
      const randPhrase = encouragingPhrases[Math.floor(Math.random() * encouragingPhrases.length)];
      setFeedbackText(randPhrase);
      setShowFeedback(true);
      speakText(randPhrase.split("!").slice(0, -1).join("!") || "Great job!");
      
      // Delay transition to next question to enjoy feedback
      setTimeout(() => {
        setShowFeedback(false);
        advanceQuestion(newAnswers);
      }, 2000);
    } else {
      advanceQuestion(newAnswers);
    }
  };

  const advanceQuestion = (currentAnswersList) => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption("");
      setStartTime(Date.now());
    } else {
      submitAssessment(currentAnswersList);
    }
  };

  const submitAssessment = async (finalAnswers) => {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/assessment/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId,
          answers: finalAnswers,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401 || response.status === 403 || data.message === "Token is not valid") {
          logout();
          navigate("/");
          return;
        }
        throw new Error(data.message || "Failed to submit assessment results.");
      }

      setAssessmentResult(data);
      setIsLastStep(true);

      // Refresh user from MongoDB (single source of truth)
      setTimeout(async () => {
        await refreshUser();
        navigate("/");
      }, 3000);

      speakText(`Congratulations! You completed the reading assessment. Your result is ready.`);
    } catch (err) {
      console.error("Submit assessment error:", err);
      setError(err.message || "Error occurred while saving results.");
    } finally {
      setSubmitting(false);
    }
  };



  // UI Theme Styling Helpers based on developmental age group
  const getThemeClasses = () => {
    if (lowDistraction) {
      return {
        wrapper: "bg-slate-100 text-slate-900 border-slate-300",
        container: "bg-white border-2 border-slate-400 p-8 rounded-xl shadow-none",
        header: "text-slate-900 border-b border-slate-300 pb-4",
        buttonActive: "bg-black text-white border-2 border-black",
        buttonInactive: "bg-white text-slate-800 border-2 border-slate-400 hover:bg-slate-100",
        submitButton: "bg-black text-white px-8 py-3 rounded hover:bg-zinc-800 font-bold",
        accentText: "text-slate-900 font-black",
        badge: "text-xs font-bold text-slate-800 bg-slate-200 px-3 py-1 rounded border border-slate-400",
      };
    }

    switch (ageGroup) {
      case "explorer": // Ages 4-5
        return {
          wrapper: "bg-gradient-to-br from-pink-100 via-yellow-100 to-cyan-100 text-purple-900 pb-20",
          container: "bg-white/95 border-4 border-yellow-400 p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-yellow-200/50 relative overflow-hidden",
          header: "text-pink-600 font-black pb-4",
          buttonActive: "bg-gradient-to-r from-pink-500 to-yellow-500 text-white border-4 border-yellow-400 shadow-lg scale-105 transform",
          buttonInactive: "bg-cyan-50 text-cyan-800 border-4 border-cyan-300 hover:border-pink-300 hover:bg-pink-50 transition-all font-black text-2xl p-6",
          submitButton: "bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-extrabold px-10 py-5 rounded-full text-xl shadow-lg border-b-4 border-yellow-600 hover:brightness-105 active:scale-95 transition",
          accentText: "text-pink-600 font-extrabold",
          badge: "text-sm font-black text-pink-600 bg-pink-100 px-4 py-2 rounded-full border-2 border-pink-200 tracking-wide uppercase",
        };

      case "beginner": // Ages 6-8
        return {
          wrapper: "bg-gradient-to-br from-indigo-100 via-sky-100 to-teal-50 text-indigo-900 pb-20",
          container: "bg-white border-3 border-sky-300 p-8 md:p-10 rounded-[2rem] shadow-xl shadow-indigo-100",
          header: "text-indigo-700 font-extrabold pb-4",
          buttonActive: "bg-sky-500 text-white border-3 border-sky-600 shadow-md",
          buttonInactive: "bg-white text-indigo-700 border-3 border-indigo-100 hover:border-sky-300 hover:bg-sky-50 font-bold text-xl",
          submitButton: "bg-sky-500 text-white font-bold px-8 py-4 rounded-2xl hover:bg-sky-600 shadow transition-all",
          accentText: "text-sky-600 font-bold",
          badge: "text-xs font-bold text-sky-600 bg-sky-50 px-3 py-2 rounded-xl border border-sky-100 uppercase tracking-wider",
        };

      case "intermediate": // Ages 9-11
        return {
          wrapper: "bg-gradient-to-br from-teal-50 to-indigo-50 text-gray-800 pb-20",
          container: "bg-white border-2 border-[#EADFC9] p-8 md:p-10 rounded-3xl shadow-lg",
          header: "text-indigo-800 font-bold pb-4 border-b border-gray-100",
          buttonActive: "bg-[#E87A5D] text-white border-2 border-[#E87A5D]",
          buttonInactive: "bg-white text-gray-700 border-2 border-gray-200 hover:border-teal-400 hover:bg-teal-50/50 font-semibold text-lg",
          submitButton: "bg-[#E87A5D] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#D16549] transition",
          accentText: "text-teal-600 font-bold",
          badge: "text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 uppercase",
        };

      case "advanced": // Ages 12-14
      default:
        return {
          wrapper: "bg-gradient-to-br from-slate-50 via-zinc-100 to-blue-50 text-[#1F2A44] pb-20",
          container: "bg-white border border-gray-200 p-8 md:p-10 rounded-2xl shadow-md",
          header: "text-[#1F2A44] font-semibold pb-4 border-b border-slate-100",
          buttonActive: "bg-indigo-600 text-white border border-indigo-600",
          buttonInactive: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-medium text-lg",
          submitButton: "bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-indigo-700 transition",
          accentText: "text-indigo-600 font-medium",
          badge: "text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100",
        };
    }
  };

  const theme = getThemeClasses();
  const currentQuestion = questions[currentIndex];

  // Helper to render image or simple text option
  const renderOptionContent = (opt) => {
    if (opt.endsWith(".png")) {
      // Return a cartoon description or simulate local image asset
      const cleanName = opt.replace(".png", "");
      const emojiMap = {
        cat: "🐱", dog: "🐶", car: "🚗", ball: "⚽", cube: "🧊", puzzle: "🧩", 
        sun: "☀️", moon: "🌙", star: "⭐", tree: "🌳", house: "🏠", fish: "🐟", 
        bird: "🐦", apple: "🍎", orange: "🍊", banana: "🍌", pear: "🍐"
      };
      const emoji = emojiMap[cleanName] || "📦";
      return (
        <div className="flex flex-col items-center gap-3 py-3">
          <span className="text-6xl md:text-7xl select-none">{emoji}</span>
          <span className="text-xl capitalize font-extrabold">{cleanName}</span>
        </div>
      );
    }
    return <span>{opt}</span>;
  };

  return (
    <div className={`min-h-screen font-sans ${theme.wrapper} ${dyslexicFont ? "font-dyslexic" : ""}`}>
      <Navbar />

      {/* Floating Accessibility Toolbar */}
      <div className="fixed top-24 right-4 z-40 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-2xl p-4 flex flex-col gap-3 max-w-[280px]">
        <div className="flex items-center justify-between border-b pb-2 mb-1">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Helper Tools</h3>
          <HelpCircle size={14} className="text-slate-400" />
        </div>
        
        {/* Toggle OpenDyslexic Font */}
        <button
          onClick={() => setDyslexicFont(!dyslexicFont)}
          className={`flex items-center justify-between p-2 rounded-xl text-sm font-semibold transition border ${
            dyslexicFont 
              ? "bg-teal-50 border-teal-300 text-teal-700" 
              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
          } cursor-pointer`}
        >
          <div className="flex items-center gap-2">
            <Type size={16} />
            <span>Dyslexic Font</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider">{dyslexicFont ? "ON" : "OFF"}</span>
        </button>

        {/* Adjust Font Size */}
        <div className="flex items-center justify-between p-2 rounded-xl text-sm font-semibold bg-slate-50 border border-slate-200 text-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">Text Size</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFontSize(Math.max(16, fontSize - 2))}
              className="w-8 h-8 rounded-lg bg-white border font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              A-
            </button>
            <span className="text-xs font-bold w-6 text-center">{fontSize}px</span>
            <button 
              onClick={() => setFontSize(Math.min(28, fontSize + 2))}
              className="w-8 h-8 rounded-lg bg-white border font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              A+
            </button>
          </div>
        </div>

        {/* Spacing Toggle */}
        <button
          onClick={() => setDoubleSpacing(!doubleSpacing)}
          className={`flex items-center justify-between p-2 rounded-xl text-sm font-semibold transition border ${
            doubleSpacing 
              ? "bg-teal-50 border-teal-300 text-teal-700" 
              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
          } cursor-pointer`}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold">↔ Double Spacing</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider">{doubleSpacing ? "ON" : "OFF"}</span>
        </button>

        {/* Low Distraction Toggle */}
        <button
          onClick={() => setLowDistraction(!lowDistraction)}
          className={`flex items-center justify-between p-2 rounded-xl text-sm font-semibold transition border ${
            lowDistraction 
              ? "bg-slate-50 border-slate-400 text-slate-900 bg-slate-200 font-bold" 
              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
          } cursor-pointer`}
        >
          <div className="flex items-center gap-2">
            <Eye size={16} />
            <span>Low Distraction</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider">{lowDistraction ? "ON" : "OFF"}</span>
        </button>

        {/* TTS Toggle */}
        <button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          className={`flex items-center justify-between p-2 rounded-xl text-sm font-semibold transition border ${
            ttsEnabled 
              ? "bg-teal-50 border-teal-300 text-teal-700" 
              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
          } cursor-pointer`}
        >
          <div className="flex items-center gap-2">
            <Volume2 size={16} />
            <span>Auto Voice</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider">{ttsEnabled ? "ON" : "OFF"}</span>
        </button>
      </div>

      {/* Main Core Container */}
      <div className="pt-28 px-4 max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Loading State */}
        {loading && (
          <div className="bg-white border-2 rounded-3xl p-12 shadow-xl text-center min-h-[400px] flex flex-col justify-center items-center w-full max-w-2xl">
            <RefreshCw className="animate-spin text-teal-600 mb-4" size={48} />
            <p className="text-xl font-bold text-gray-700 animate-pulse">Setting up your personalized reading room...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white border border-red-200 rounded-3xl p-10 shadow-xl text-center min-h-[350px] flex flex-col justify-center items-center w-full max-w-2xl">
            <AlertTriangle className="text-red-500 mb-4" size={54} />
            <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 font-semibold border border-red-100">
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-teal-600 text-white px-8 py-3 rounded-full text-lg font-bold hover:bg-teal-700 transition"
            >
              Reload Page
            </button>
          </div>
        )}

        {/* Encouraging Interaction overlay */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm"
            >
              <div className="bg-white border-4 border-yellow-400 rounded-3xl p-8 max-w-sm text-center shadow-2xl">
                <Sparkles className="mx-auto text-yellow-500 mb-4 animate-bounce" size={54} />
                <h3 className="text-2xl font-black text-purple-900 mb-2">Wonderful Effort!</h3>
                <p className="text-xl font-extrabold text-teal-600 leading-relaxed">{feedbackText}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assessment Submission State */}
        {submitting && (
          <div className="bg-white border rounded-3xl p-12 shadow-xl text-center min-h-[400px] flex flex-col justify-center items-center w-full max-w-2xl">
            <RefreshCw className="animate-spin text-indigo-600 mb-4" size={48} />
            <p className="text-xl font-bold text-gray-700 animate-pulse">Analyzing dyslexia indicators & calculating risk...</p>
          </div>
        )}

        {/* Question Panel */}
        {!loading && !error && !submitting && !isLastStep && questions.length > 0 && (
          <div className="w-full">
            
            {/* Progress Header */}
            <div className="w-full max-w-3xl mx-auto mb-6 flex justify-between items-center px-2">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className={theme.badge}>
                  Age: {ageGroup} Group
                </span>
              </div>
              
              {/* Question Timer */}
              {timeLeft !== null && (
                <div className={`flex items-center gap-2 font-bold px-4 py-2 rounded-xl text-lg ${
                  timeLeft <= 3 ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-100 text-slate-700"
                }`}>
                  <span>⏱️ {timeLeft}s</span>
                </div>
              )}
            </div>

            {/* Assessment Panel Container */}
            <div 
              className={theme.container}
              style={{ fontSize: `${fontSize}px`, lineHeight: doubleSpacing ? "2.5" : "1.75" }}
            >
              
              {/* Question Text */}
              <div className="mb-8 flex items-start gap-4">
                <button
                  onClick={() => speakText(currentQuestion.question.replace(/\.png/g, ""))}
                  className="p-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-600 rounded-full transition-colors flex-shrink-0 cursor-pointer"
                  title="Read Aloud"
                  aria-label="Read question aloud"
                >
                  <Volume2 size={24} />
                </button>
                <h2 className={`font-extrabold ${theme.header} w-full leading-snug`}>
                  {currentQuestion.question.replace(/\.png/g, "")}
                </h2>
              </div>

              {/* Options Grid */}
              <div className={`grid gap-4 ${
                currentQuestion.options[0]?.endsWith(".png") ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"
              }`}>
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(opt)}
                      className={`p-5 rounded-2xl border-3 text-left transition-all cursor-pointer ${
                        isSelected ? theme.buttonActive : theme.buttonInactive
                      }`}
                      style={{ fontSize: `${fontSize * 0.9}px` }}
                    >
                      {renderOptionContent(opt)}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-12 border-t border-slate-100 pt-6">
                <button
                  onClick={() => handleNext(false)} // Treat skip as a blank choice
                  className="text-gray-500 font-bold hover:text-gray-700 px-4 py-2 border-2 border-transparent hover:border-gray-200 rounded-xl transition cursor-pointer"
                >
                  Skip Question
                </button>

                <button
                  onClick={() => handleNext(false)}
                  disabled={!selectedOption}
                  className={`${theme.submitButton} flex items-center justify-center gap-2`}
                >
                  <span>{currentIndex === questions.length - 1 ? "Finish Assessment" : "Next Question"}</span>
                  <ArrowRight size={20} />
                </button>
              </div>

            </div>

            {/* Encouraging tip below card */}
            {!lowDistraction && (
              <div className="text-center mt-6 text-sm text-gray-500 font-bold animate-pulse">
                {ageGroup === "advanced"
                  ? "💡 Take your time — read each passage carefully and trust your reasoning."
                  : "🐱 \"You are doing amazing! Take your time and focus on the letters!\""}
              </div>
            )}

          </div>
        )}

        {/* Final Result / Success Message Page */}
        {!loading && !error && !submitting && isLastStep && assessmentResult && (
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 md:p-12 shadow-2xl w-full max-w-3xl text-center">
            <div className="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-500 mb-6 border border-emerald-100">
              <CheckCircle size={56} className="animate-pulse" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
              Assessment completed successfully! Redirecting to Home Page...
            </h2>
          </div>
        )}

      </div>
    </div>
  );
}
