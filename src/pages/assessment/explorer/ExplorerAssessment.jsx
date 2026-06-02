/* eslint-disable */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "../../../components/Navbar";
import { 
  Volume2, Eye, Type, Sparkles, ArrowRight, RefreshCw, AlertTriangle, CheckCircle, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExplorerAssessment() {
  const navigate = useNavigate();
  const { user, token, updateUser, logout, refreshUser } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [doubleSpacing, setDoubleSpacing] = useState(false);
  const [lowDistraction, setLowDistraction] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const [timedOut, setTimedOut] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isLastStep, setIsLastStep] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);

  const encouragingPhrases = [
    "Amazing job! You are doing awesome! 🌟",
    "Keep it up, superstar! 🚀",
    "Wow, fantastic effort! 🎈",
    "Super cool! Let's check the next one! 🐱",
    "Brilliant! You're a natural learner! 🧸",
  ];

  useEffect(() => {
    if (user?.accessibilityPreferences) {
      const prefs = user.accessibilityPreferences;
      if (prefs.dyslexicFontEnabled !== null) setDyslexicFont(prefs.dyslexicFontEnabled);
      if (prefs.fontSize !== null) setFontSize(prefs.fontSize);
      if (prefs.lineSpacing !== null) setDoubleSpacing(prefs.lineSpacing > 1.8);
      if (prefs.ttsEnabled !== null) setTtsEnabled(prefs.ttsEnabled);
    }
  }, [user]);

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

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length && !loading && !showFeedback && !assessmentResult) {
      const q = questions[currentIndex];
      let textToSpeak = q.question;
      if (q.category === "image_recognition") {
        textToSpeak = q.question.replace(/\.png/g, "");
      }
      
      if (ttsEnabled) {
        const t = setTimeout(() => {
          speakText(textToSpeak);
        }, 600);
        return () => clearTimeout(t);
      }
    }
  }, [currentIndex, questions, loading, showFeedback, assessmentResult, ttsEnabled]);

  useEffect(() => {
    if (timedOut) {
      setTimedOut(false);
      handleNext(true);
    }
  }, [timedOut]);

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length && !loading && !showFeedback && !assessmentResult) {
      const q = questions[currentIndex];
      const timeLimitMs = q.metadata?.responseTimeLimitMs || 20000;
      setTimeLeft(Math.ceil(timeLimitMs / 1000));

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
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
    let optionSpoken = option.replace(/\.png/g, "");
    speakText(optionSpoken);
  };

  const handleNext = (isTimeout = false) => {
    if (questions.length === 0) return;
    
    const timeLimitMs = questions[currentIndex].metadata?.responseTimeLimitMs || 20000;
    const elapsed = Date.now() - startTime;
    const finalElapsed = isTimeout ? timeLimitMs : Math.min(elapsed, timeLimitMs);

    const currentAnswer = {
      questionId: questions[currentIndex].id,
      selectedOption: isTimeout ? "" : selectedOption,
      responseTimeMs: finalElapsed,
    };

    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);

    // RESTORED: Playful feedback
    const randPhrase = encouragingPhrases[Math.floor(Math.random() * encouragingPhrases.length)];
    setFeedbackText(randPhrase);
    setShowFeedback(true);
    speakText(randPhrase.split("!").slice(0, -1).join("!") || "Great job!");
    
    setTimeout(() => {
      setShowFeedback(false);
      advanceQuestion(newAnswers);
    }, 2000);
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

      speakText(`Congratulations! You finished! Your playful learning room is ready.`);
    } catch (err) {
      console.error("Submit assessment error:", err);
      setError(err.message || "Error occurred while saving results.");
    } finally {
      setSubmitting(false);
    }
  };



  // RESTORED: Colorful Explorer Theme
  const theme = {
    wrapper: "bg-gradient-to-br from-pink-100 via-yellow-100 to-cyan-100 text-purple-900 pb-20",
    container: "bg-white/95 border-4 border-yellow-400 p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-yellow-200/50 relative overflow-hidden max-w-3xl mx-auto w-full",
    header: "text-pink-600 font-black pb-4",
    buttonActive: "bg-gradient-to-r from-pink-500 to-yellow-500 text-white border-4 border-yellow-400 shadow-lg scale-105 transform",
    buttonInactive: "bg-cyan-50 text-cyan-800 border-4 border-cyan-300 hover:border-pink-300 hover:bg-pink-50 transition-all font-black text-2xl p-6",
    submitButton: "bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-extrabold px-10 py-5 rounded-full text-xl shadow-lg border-b-4 border-yellow-600 hover:brightness-105 active:scale-95 transition",
    badge: "text-sm font-black text-pink-600 bg-pink-100 px-4 py-2 rounded-full border-2 border-pink-200 tracking-wide uppercase"
  };

  const currentQuestion = questions[currentIndex];

  const renderOptionContent = (opt) => {
    if (opt.endsWith(".png")) {
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

      <div className="pt-24 px-4 flex flex-col items-center">
        
        {loading && (
          <div className="bg-white border-2 rounded-3xl p-12 shadow-xl text-center min-h-[400px] flex flex-col justify-center items-center w-full max-w-2xl">
            <RefreshCw className="animate-spin text-teal-600 mb-4" size={48} />
            <p className="text-xl font-bold text-gray-700 animate-pulse">Setting up your learning game...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-white border border-red-200 rounded-3xl p-10 shadow-xl text-center min-h-[350px] flex flex-col justify-center items-center w-full max-w-2xl">
            <AlertTriangle className="text-red-500 mx-auto mb-4" size={54} />
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

        {/* RESTORED: Encouraging Interaction overlay */}
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

        {submitting && (
          <div className="bg-white border rounded-3xl p-12 shadow-xl text-center min-h-[400px] flex flex-col justify-center items-center w-full max-w-2xl">
            <RefreshCw className="animate-spin text-indigo-600 mb-4" size={48} />
            <p className="text-xl font-bold text-gray-700 animate-pulse">Preparing your playroom...</p>
          </div>
        )}

        {!loading && !error && !submitting && !isLastStep && questions.length > 0 && (
          <div className="w-full">
            <div className="w-full max-w-3xl mx-auto mb-6 flex justify-between items-center px-2">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className={theme.badge}>Age: 4-5 Group</span>
              </div>
              
              {timeLeft !== null && (
                <div className={`flex items-center gap-2 font-bold px-4 py-2 rounded-xl text-lg ${
                  timeLeft <= 3 ? "bg-red-100 text-red-600 animate-pulse" : "bg-white text-slate-700 shadow-sm"
                }`}>
                  <span>⏱️ {timeLeft}s</span>
                </div>
              )}
            </div>

            <div className={theme.container} style={{ fontSize: `${fontSize}px`, lineHeight: doubleSpacing ? "2.5" : "1.75" }}>
              <div className="mb-8 flex items-start gap-4">
                <button
                  onClick={() => speakText(currentQuestion.question.replace(/\.png/g, ""))}
                  className="p-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-600 rounded-full transition-colors flex-shrink-0 cursor-pointer"
                  title="Read Aloud"
                >
                  <Volume2 size={24} />
                </button>
                <h2 className={`font-extrabold ${theme.header} w-full leading-snug`}>
                  {currentQuestion.question.replace(/\.png/g, "")}
                </h2>
              </div>

              <div className={`grid gap-4 ${currentQuestion.options[0]?.endsWith(".png") ? "grid-cols-2" : "grid-cols-1"}`}>
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

              <div className="flex justify-between items-center mt-12 border-t border-yellow-100 pt-6">
                <button
                  onClick={() => handleNext(false)}
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
            
            <div className="text-center mt-6 text-sm text-gray-500 font-bold animate-pulse">
              🐱 "You are doing amazing! Take your time!"
            </div>
          </div>
        )}

        {!loading && !error && !submitting && isLastStep && assessmentResult && (
          <div className="bg-white border-4 border-yellow-400 rounded-3xl p-8 md:p-12 shadow-2xl w-full max-w-3xl text-center">
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
