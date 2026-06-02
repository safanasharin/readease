import { useState, useRef, useEffect, useMemo } from "react";
import { Mic, MicOff, ArrowRight, Play, Award, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ReadingAccuracyTest({ onNext, updateScore }) {
  const PASSAGE = "Reading every day makes your brain stronger and smarter.";
  const words = useMemo(() => PASSAGE.split(/\s+/).filter(Boolean), []);

  const [isListening, setIsListening] = useState(false);
  const [browserMessage, setBrowserMessage] = useState("");
  const [matchedWords, setMatchedWords] = useState([]); // indices of correctly spoken words
  const [failedWords, setFailedWords] = useState([]); // indices of words clicked as "difficult"
  const [mode, setMode] = useState("choose"); // 'choose', 'speak', 'manual'
  const [completed, setCompleted] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const normalizeWord = (w) => w.toLowerCase().replace(/[.,!?;:'"()]/g, "").trim();

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserMessage("Speech recognition is not supported in this browser. Please use the self-evaluation mode.");
      setMode("manual");
      return;
    }

    setBrowserMessage("");
    setMatchedWords([]);
    setFailedWords([]);
    setCompleted(false);

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const spokenWords = transcript.split(/\s+/).map(normalizeWord).filter(Boolean);
      const targetWords = words.map(normalizeWord);

      let matchedIdxs = [];
      targetWords.forEach((target, tIdx) => {
        // Simple search in spoken words
        if (spokenWords.includes(target)) {
          matchedIdxs.push(tIdx);
        }
      });

      setMatchedWords(matchedIdxs);
      setIsListening(false);
      setCompleted(true);
    };

    recognition.onerror = (err) => {
      console.error(err);
      setIsListening(false);
      setBrowserMessage("Could not hear your voice clearly. Switching to self-evaluation mode.");
      setMode("manual");
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleWordToggle = (index) => {
    if (failedWords.includes(index)) {
      setFailedWords(prev => prev.filter(i => i !== index));
    } else {
      setFailedWords(prev => [...prev, index]);
    }
  };

  const submitScore = () => {
    let score = 0;
    if (mode === "speak" && completed) {
      // Speak mode score
      const correctCount = matchedWords.length;
      score = Math.round((correctCount / words.length) * 20);
    } else {
      // Manual/self-eval mode score
      const correctCount = words.length - failedWords.length;
      score = Math.round((correctCount / words.length) * 20);
    }
    updateScore("readingAccuracy", score);
    onNext();
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-[#EADFC9] rounded-3xl p-8 md:p-12 shadow-xl min-h-[420px] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-[#1F2A44]">Part 3: Reading Accuracy</h2>
          <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 uppercase tracking-wider">
            Section 3 of 6
          </span>
        </div>

        {mode === "choose" && (
          <div className="text-center py-6">
            <p className="text-xl text-gray-700 font-bold mb-8">
              How would you like to perform the reading test?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md mx-auto">
              <button
                onClick={() => {
                  setMode("speak");
                  startListening();
                }}
                className="p-6 bg-teal-50 border-2 border-teal-200 hover:border-teal-500 rounded-2xl flex flex-col items-center gap-3 hover:shadow-md transition cursor-pointer"
              >
                <Mic size={36} className="text-teal-600" />
                <span className="text-lg font-black text-teal-900">Read Aloud (Mic)</span>
                <span className="text-xs text-teal-700 font-medium">Read the sentence using your microphone</span>
              </button>

              <button
                onClick={() => setMode("manual")}
                className="p-6 bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-500 rounded-2xl flex flex-col items-center gap-3 hover:shadow-md transition cursor-pointer"
              >
                <CheckCircle size={36} className="text-indigo-600" />
                <span className="text-lg font-black text-indigo-900">Self-Evaluation</span>
                <span className="text-xs text-indigo-700 font-medium">Read silently and tap words you struggle with</span>
              </button>
            </div>
          </div>
        )}

        {mode === "speak" && (
          <div>
            <p className="text-lg text-gray-500 mb-6">Read the sentence below aloud into your microphone:</p>
            
            <div className="bg-[#FFFDF9] border border-[#F0E6D2] p-8 rounded-2xl text-center mb-8">
              <p className="text-3xl font-semibold leading-loose text-[#1F2A44] flex flex-wrap gap-x-2 justify-center">
                {words.map((word, idx) => {
                  const isWordMatched = matchedWords.includes(idx);
                  return (
                    <span
                      key={idx}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        completed
                          ? isWordMatched
                            ? "text-green-600 bg-green-50 font-bold"
                            : "text-red-500 bg-red-50 line-through"
                          : isListening
                          ? "text-teal-700 font-medium"
                          : ""
                      }`}
                    >
                      {word}
                    </span>
                  );
                })}
              </p>
            </div>

            {browserMessage && (
              <p className="text-red-500 text-sm font-semibold mb-4 text-center">{browserMessage}</p>
            )}

            <div className="flex justify-center gap-4">
              {!completed ? (
                <button
                  onClick={isListening ? () => recognitionRef.current?.stop() : startListening}
                  className={`flex items-center gap-3 px-8 py-4 rounded-full text-lg font-bold transition shadow ${
                    isListening
                      ? "bg-red-100 text-red-600 hover:bg-red-200 animate-pulse"
                      : "bg-teal-600 text-white hover:bg-teal-700"
                  } cursor-pointer`}
                >
                  {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                  {isListening ? "Stop Recording" : "Start Microphone"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCompleted(false);
                    setMatchedWords([]);
                    startListening();
                  }}
                  className="bg-gray-100 border border-gray-300 text-gray-700 px-6 py-3 rounded-full text-base font-bold hover:bg-gray-200 cursor-pointer"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}

        {mode === "manual" && (
          <div>
            <p className="text-lg text-gray-500 mb-6">
              Read the sentence silently. Tap/click on the words that you found <strong className="text-red-500">difficult</strong> or had to skip:
            </p>

            <div className="bg-[#FFFDF9] border border-[#F0E6D2] p-8 rounded-2xl text-center mb-8">
              <p className="text-3xl font-semibold leading-loose text-[#1F2A44] flex flex-wrap gap-x-3 gap-y-4 justify-center">
                {words.map((word, idx) => {
                  const isFailed = failedWords.includes(idx);
                  return (
                    <span
                      key={idx}
                      onClick={() => handleWordToggle(idx)}
                      className={`px-3 py-1.5 rounded-xl cursor-pointer border-2 transition-all ${
                        isFailed
                          ? "border-red-400 bg-red-50 text-red-600 scale-95"
                          : "border-gray-100 hover:border-teal-300 hover:bg-teal-50"
                      }`}
                    >
                      {word}
                    </span>
                  );
                })}
              </p>
            </div>

            <p className="text-sm text-gray-400 text-center font-medium">
              * Red highlighted words will mark them as skipped or difficult. If you read everything fine, leave them all white.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center border-t border-gray-100 pt-6 mt-8">
        {mode !== "choose" ? (
          <button
            onClick={() => {
              if (recognitionRef.current) recognitionRef.current.stop();
              setIsListening(false);
              setMode("choose");
              setCompleted(false);
            }}
            className="text-gray-500 font-bold hover:text-gray-700 cursor-pointer"
          >
            ← Change Mode
          </button>
        ) : (
          <div />
        )}

        {mode !== "choose" && (mode !== "speak" || completed) && (
          <button
            onClick={submitScore}
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-full text-lg font-bold hover:bg-indigo-700 shadow-md transition transform active:scale-95 cursor-pointer"
          >
            Submit Section <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
