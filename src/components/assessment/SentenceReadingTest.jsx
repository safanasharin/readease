import { useState, useRef, useEffect, useMemo } from "react";
import { Mic, MicOff, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const SENTENCES = [
  "The quick brown fox jumps over the lazy dog.",
  "Reading every day makes your brain stronger and smarter.",
  "Sometimes it is hard to read fast, but practice always helps."
];

export default function SentenceReadingTest({ onNext, updateScore }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [browserMessage, setBrowserMessage] = useState("");
  
  const [matchedWords, setMatchedWords] = useState([]);
  const [wrongWords, setWrongWords] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const startTimeRef = useRef(null);
  
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWordsCount, setTotalWordsCount] = useState(0);
  const [totalTimeMs, setTotalTimeMs] = useState(0);

  const passage = SENTENCES[currentIndex];
  const words = useMemo(() => passage.split(/\s+/).filter(Boolean), [passage]);

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
    if (!a || !b) return false;
    if (a.length > 3 && b.length > 3) {
      if (a === b + "s" || b === a + "s") return true;
      if (a === b + "ed" || b === a + "ed") return true;
      if (a === b + "ing" || b === a + "ing") return true;
    }
    const lenDiff = Math.abs(a.length - b.length);
    if (lenDiff > 2) return false;
    const maxMistakes = Math.min(a.length, b.length) <= 4 ? 1 : 2;
    return levenshteinDistance(a, b) <= maxMistakes;
  };

  const trackProgress = (transcript) => {
    const spokenWords = transcript.split(/\s+/).map(normalizeWord).filter(Boolean);
    const targetWords = words.map(normalizeWord);

    let currentMatched = [];
    let targetIndex = 0;

    for (let s = 0; s < spokenWords.length; s++) {
      const spoken = spokenWords[s];
      let windowSize = 5;
      let skippedEmpty = [];

      for (let t = targetIndex; t < targetWords.length && t < targetIndex + windowSize; t++) {
        if (!targetWords[t]) {
          skippedEmpty.push(t);
          windowSize++;
          continue;
        }

        if (targetWords[t] === spoken || isSimilar(targetWords[t], spoken)) {
          currentMatched.push(...skippedEmpty, t);
          targetIndex = t + 1;
          break;
        }
      }
    }
    setMatchedWords(currentMatched);
  };

  const calculateFinalScore = (transcript) => {
    const spokenWords = transcript.split(/\s+/).map(normalizeWord).filter(Boolean);
    const targetWords = words.map(normalizeWord);

    let currentMatched = [];
    let targetIndex = 0;

    for (let s = 0; s < spokenWords.length; s++) {
      const spoken = spokenWords[s];
      let windowSize = 5;
      let skippedEmpty = [];

      for (let t = targetIndex; t < targetWords.length && t < targetIndex + windowSize; t++) {
        if (!targetWords[t]) {
          skippedEmpty.push(t);
          windowSize++;
          continue;
        }

        if (targetWords[t] === spoken || isSimilar(targetWords[t], spoken)) {
          currentMatched.push(...skippedEmpty, t);
          targetIndex = t + 1;
          break;
        }
      }
    }

    const wrongIdxs = [];
    let correctCount = 0;
    let totalScorable = 0;

    for (let i = 0; i < targetWords.length; i++) {
      if (targetWords[i]) {
        totalScorable++;
        if (!currentMatched.includes(i)) {
          wrongIdxs.push(i);
        } else {
          correctCount++;
        }
      }
    }

    setMatchedWords(currentMatched);
    setWrongWords(wrongIdxs);
    return { correctCount, totalScorable };
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserMessage("Please use Chrome or Edge for speech recognition.");
      return;
    }

    setBrowserMessage("");
    setMatchedWords([]);
    setWrongWords([]);
    setIsCompleted(false);
    finalTranscriptRef.current = "";
    startTimeRef.current = Date.now();

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      const finalTrans = transcript.trim();
      finalTranscriptRef.current = finalTrans;
      trackProgress(finalTrans);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setBrowserMessage("Couldn't hear you. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsCompleted(true);
      
      const timeSpent = Date.now() - startTimeRef.current;
      setTotalTimeMs(prev => prev + timeSpent);
      
      const res = calculateFinalScore(finalTranscriptRef.current);
      setTotalCorrect(prev => prev + res.correctCount);
      setTotalWordsCount(prev => prev + res.totalScorable);
    };
    
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleNext = () => {
    if (currentIndex < SENTENCES.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setMatchedWords([]);
      setWrongWords([]);
      setIsCompleted(false);
    } else {
      const sentenceScore = Math.round((totalCorrect / totalWordsCount) * 30) || 0;
      updateScore("sentenceReading", sentenceScore);
      
      const minutes = totalTimeMs / 60000;
      const wpm = minutes > 0 ? (totalWordsCount / minutes) : 0;
      
      let speedScore = 0;
      if (wpm >= 100) speedScore = 20;
      else if (wpm >= 70) speedScore = 15;
      else if (wpm >= 40) speedScore = 10;
      else speedScore = 5;
      
      updateScore("readingSpeed", speedScore);
      onNext();
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-white rounded-3xl p-8 md:p-12 shadow-xl min-h-[400px] flex flex-col justify-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Part 2: Sentence Reading</h2>
      <p className="text-gray-500 mb-10 text-center">Read the sentence aloud. Click start, read, then click stop.</p>

      {browserMessage && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center">
          {browserMessage}
        </div>
      )}

      <div className="mb-12">
        <p className="text-sm text-teal-600 font-semibold uppercase tracking-wider mb-4 text-center">
          Sentence {currentIndex + 1} of {SENTENCES.length}
        </p>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl md:text-4xl font-semibold text-gray-900 leading-relaxed flex flex-wrap gap-x-2 gap-y-3 justify-center"
        >
          {words.map((word, index) => {
            const isMatched = matchedWords.includes(index);
            const isWrong = wrongWords.includes(index);
            
            let colorClass = "";
            if (isCompleted) {
               colorClass = isMatched ? "text-green-600 bg-green-50" : (isWrong ? "text-red-600 bg-red-50 line-through" : "");
            } else if (isListening && isMatched) {
               colorClass = "text-green-600 bg-green-50";
            }

            return (
              <span key={index} className={`px-2 py-1 rounded-lg transition-colors ${colorClass}`}>
                {word}
              </span>
            );
          })}
        </motion.div>
      </div>

      <div className="flex justify-center gap-4">
        {!isCompleted ? (
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex items-center gap-3 px-8 py-4 rounded-full text-lg font-semibold transition ${
              isListening 
                ? "bg-red-100 text-red-600 hover:bg-red-200 animate-pulse"
                : "bg-teal-600 text-white hover:bg-teal-700 shadow-lg"
            }`}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            {isListening ? "Stop Recording" : "Start Recording"}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-3 px-8 py-4 rounded-full text-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg transition transform hover:-translate-y-1"
          >
            Next <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
