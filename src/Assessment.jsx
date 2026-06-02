import { useState } from "react";
import Navbar from "./components/Navbar";
import WelcomeScreen from "./components/assessment/WelcomeScreen";
import WordReadingTest from "./components/assessment/WordReadingTest";
import SentenceReadingTest from "./components/assessment/SentenceReadingTest";
import ComprehensionTest from "./components/assessment/ComprehensionTest";
import ResultDashboard from "./components/assessment/ResultDashboard";
import { AnimatePresence, motion } from "framer-motion";

export default function Assessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState({
    wordReading: 0,
    sentenceReading: 0,
    readingSpeed: 0,
    comprehension: 0,
  });

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  
  const restart = () => {
    setScores({
      wordReading: 0,
      sentenceReading: 0,
      readingSpeed: 0,
      comprehension: 0,
    });
    setCurrentStep(0);
  };

  const updateScore = (testName, score) => {
    setScores((prev) => ({ ...prev, [testName]: score }));
  };

  const steps = [
    <WelcomeScreen key="welcome" onNext={nextStep} />,
    <WordReadingTest key="word" onNext={nextStep} updateScore={updateScore} />,
    <SentenceReadingTest key="sentence" onNext={nextStep} updateScore={updateScore} />,
    <ComprehensionTest key="comp" onNext={nextStep} updateScore={updateScore} />,
    <ResultDashboard key="result" scores={scores} onRestart={restart} />
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 text-gray-800 font-sans">
      <Navbar />
      <div className="pt-24 px-6 lg:px-10 pb-10 max-w-5xl mx-auto flex flex-col items-center">
        
        {currentStep > 0 && currentStep < 4 && (
          <div className="w-full max-w-3xl mb-8">
            <div className="flex justify-between text-sm font-semibold text-gray-500 mb-2">
              <span>Part {currentStep} of 3</span>
              <span>{Math.round((currentStep / 3) * 100)}%</span>
            </div>
            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
}
