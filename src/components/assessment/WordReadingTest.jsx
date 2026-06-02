import { useState, useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";

const WORD_LIST = [
  "cat", "book", "apple", "friend", "school", // Simple
  "beautiful", "important", "knowledge", "extraordinary", "specifically" // Complex
];

export default function WordReadingTest({ onNext, updateScore }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [browserMessage, setBrowserMessage] = useState("");
  const [results, setResults] = useState([]); // { word, correct }
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const normalizeWord = (w) => w.toLowerCase().replace(/[.,!?;:'"()]/g, "").trim();

  const levenshteinDistance = (a, b) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
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
  };

  const isSimilar = (a, b) => {
    if (a === b) return true;
    const lenDiff = Math.abs(a.length - b.length);
    if (lenDiff > 2) return false;
    const maxMistakes = Math.min(a.length, b.length) <= 5 ? 1 : 2;
    return levenshteinDistance(a, b) <= maxMistakes;
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserMessage("Please use Chrome or Edge for speech recognition.");
      return;
    }

    setBrowserMessage("");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = normalizeWord(event.results[0][0].transcript);
      const targetWord = normalizeWord(WORD_LIST[currentIndex]);
      
      const spokenWords = transcript.split(/\s+/);
      let correct = false;
      
      for(let w of spokenWords) {
        if (w.includes(targetWord) || isSimilar(targetWord, w)) {
          correct = true;
          break;
        }
      }
      
      const newResults = [...results, { word: targetWord, correct }];
      setResults(newResults);
      setIsListening(false);
      
      if (currentIndex < WORD_LIST.length - 1) {
        setTimeout(() => setCurrentIndex(prev => prev + 1), 500);
      } else {
        setTimeout(() => finishTest(newResults), 500);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setBrowserMessage("Couldn't hear you. Please try again.");
    };

    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const finishTest = (finalResults) => {
    const correctCount = finalResults.filter(r => r.correct).length;
    const score = Math.round((correctCount / WORD_LIST.length) * 30);
    updateScore("wordReading", score);
    onNext();
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-white rounded-3xl p-8 md:p-12 shadow-xl text-center min-h-[400px] flex flex-col justify-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Part 1: Word Reading</h2>
      <p className="text-gray-500 mb-10">Read the word on the screen aloud. Click the microphone before speaking.</p>

      {browserMessage && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
          {browserMessage}
        </div>
      )}

      <div className="mb-12">
        <p className="text-sm text-teal-600 font-semibold uppercase tracking-wider mb-4">
          Word {currentIndex + 1} of {WORD_LIST.length}
        </p>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-6xl md:text-7xl font-bold text-gray-900 tracking-wide"
        >
          {WORD_LIST[currentIndex]}
        </motion.div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={isListening ? () => recognitionRef.current?.stop() : startListening}
          className={`flex items-center gap-3 px-8 py-4 rounded-full text-lg font-semibold transition ${
            isListening 
              ? "bg-red-100 text-red-600 hover:bg-red-200 animate-pulse"
              : "bg-teal-600 text-white hover:bg-teal-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          }`}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          {isListening ? "Listening..." : "Tap to Speak"}
        </button>
      </div>
    </div>
  );
}
