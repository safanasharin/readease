import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeScreen from "../components/assessment/WelcomeScreen";
import LetterConfusionTest from "../components/assessment/LetterConfusionTest";
import WordRecognitionTest from "../components/assessment/WordRecognitionTest";
import ReadingAccuracyTest from "../components/assessment/ReadingAccuracyTest";
import MemoryTest from "../components/assessment/MemoryTest";
import ComprehensionTest from "../components/assessment/ComprehensionTest";
import SpellingTest from "../components/assessment/SpellingTest";
import ResultDashboard from "../components/assessment/ResultDashboard";
import Navbar from "../components/Navbar";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function InitialAssessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState({
    letterConfusion: 0,
    wordRecognition: 0,
    readingAccuracy: 0,
    memory: 0,
    comprehension: 0,
    spelling: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  // On mount, if the user has already completed the assessment, redirect them to dashboard
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.screeningCompleted) {
      navigate("/dashboard");
    }
  }, [navigate]);



  const updateScore = (testName, score) => {
    setScores((prev) => ({ ...prev, [testName]: score }));
  };

  const saveAssessmentResults = async (finalScores) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("loggedInUser");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user || !token) {
        setError("User session not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Calculate total score out of 100
      const finalScore = (
        (finalScores.letterConfusion || 0) +
        (finalScores.wordRecognition || 0) +
        (finalScores.readingAccuracy || 0) +
        (finalScores.memory || 0) +
        (finalScores.comprehension || 0) +
        (finalScores.spelling || 0)
      );

      let level = "";
      if (finalScore >= 80) level = "Mild";
      else if (finalScore >= 50) level = "Moderate";
      else level = "Severe";

      const payload = {
        userId: user._id || user.id,
        letterConfusionScore: finalScores.letterConfusion || 0,
        wordRecognitionScore: finalScores.wordRecognition || 0,
        readingAccuracyScore: finalScores.readingAccuracy || 0,
        memoryScore: finalScores.memory || 0,
        comprehensionScore: finalScores.comprehension || 0,
        spellingScore: finalScores.spelling || 0,
        finalScore,
        dyslexiaLevel: level,
      };

      const response = await fetch("http://localhost:5000/api/assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save assessment results");
      }

      // Update user state globally in local storage & Auth context
      const updatedUser = {
        ...user,
        screeningCompleted: true,
        hasCompletedAssessment: true,
        assessmentScore: finalScore,
        dyslexiaLevel: level,
      };

      // Successfully saved, move to result page (step 7)
      setCurrentStep(7);
      
      // Navigate first, then update user state to prevent AssessmentGuard from intercepting the current route
      setTimeout(() => {
        navigate("/");
        setTimeout(() => updateUser(updatedUser), 100);
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while saving your results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 6) {
      // Finished all 6 tests, save results to DB
      saveAssessmentResults(scores);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const restart = () => {
    setScores({
      letterConfusion: 0,
      wordRecognition: 0,
      readingAccuracy: 0,
      memory: 0,
      comprehension: 0,
      spelling: 0,
    });
    setCurrentStep(0);
    setError("");
  };

  const handleContinue = () => {
    navigate("/");
  };

  const steps = [
    <WelcomeScreen key="welcome" onNext={nextStep} />,
    <LetterConfusionTest key="letterConfusion" onNext={nextStep} updateScore={updateScore} />,
    <WordRecognitionTest key="wordRecognition" onNext={nextStep} updateScore={updateScore} />,
    <ReadingAccuracyTest key="readingAccuracy" onNext={nextStep} updateScore={updateScore} />,
    <MemoryTest key="memory" onNext={nextStep} updateScore={updateScore} />,
    <ComprehensionTest key="comprehension" onNext={nextStep} updateScore={updateScore} />,
    <SpellingTest key="spelling" onNext={nextStep} updateScore={updateScore} />,
    <div key="result" className="bg-white/80 backdrop-blur-md border border-white rounded-3xl p-8 md:p-12 shadow-xl text-center">
      <h2 className="text-3xl md:text-4xl font-black text-teal-600 mb-2">
        Assessment completed successfully! Redirecting to Home Page...
      </h2>
    </div>
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 text-gray-800 font-sans">
      <Navbar />
      <div className="pt-24 px-6 lg:px-10 pb-10 max-w-5xl mx-auto flex flex-col items-center">
        
        {currentStep > 0 && currentStep < 7 && (
          <div className="w-full max-w-3xl mb-8">
            <div className="flex justify-between text-sm font-semibold text-gray-500 mb-2">
              <span>Part {currentStep} of 6</span>
              <span>{Math.round((currentStep / 6) * 100)}%</span>
            </div>
            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 6) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-white/80 backdrop-blur-md border border-white rounded-3xl p-8 md:p-12 shadow-xl text-center min-h-[400px] flex flex-col justify-center items-center w-full max-w-3xl">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-bold text-gray-800 animate-pulse">Saving your assessment results...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-white/80 backdrop-blur-md border border-red-200 rounded-3xl p-8 md:p-12 shadow-xl text-center min-h-[400px] flex flex-col justify-center items-center w-full max-w-3xl">
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-semibold">
              {error}
            </div>
            <button
              onClick={() => saveAssessmentResults(scores)}
              className="bg-teal-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-teal-700 shadow-lg transition cursor-pointer"
            >
              Retry Saving Results
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="w-full max-w-4xl relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                {steps[currentStep]}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
