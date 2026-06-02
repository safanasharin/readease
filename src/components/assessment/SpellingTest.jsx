import { useState, useEffect } from "react";
import { ArrowRight, Volume2 } from "lucide-react";

export default function SpellingTest({ onNext, updateScore }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [answers, setAnswers] = useState({ 0: "", 1: "", 2: "" });
  const [inputVal, setInputVal] = useState("");

  const SPELLING_WORDS = ["play", "house", "light"];

  const speak = (word) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.85; // slightly slower rate for better clarity
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speak the word on mounting or index change
  useEffect(() => {
    speak(SPELLING_WORDS[currentWordIndex]);
  }, [currentWordIndex]);

  const handleNext = () => {
    // Save current answer
    const updatedAnswers = { ...answers, [currentWordIndex]: inputVal.trim() };
    setAnswers(updatedAnswers);

    if (currentWordIndex < SPELLING_WORDS.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      setInputVal(updatedAnswers[currentWordIndex + 1] || "");
    } else {
      // Calculate score (5 points per word, total 15)
      let score = 0;
      SPELLING_WORDS.forEach((word, idx) => {
        const userAns = (updatedAnswers[idx] || "").toLowerCase();
        if (userAns === word.toLowerCase()) {
          score += 5;
        }
      });
      updateScore("spelling", score);
      onNext();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && inputVal.trim()) {
      handleNext();
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-[#EADFC9] rounded-3xl p-8 md:p-12 shadow-xl min-h-[400px] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-[#1F2A44]">Part 6: Spelling Test</h2>
          <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 uppercase tracking-wider">
            Word {currentWordIndex + 1} of {SPELLING_WORDS.length}
          </span>
        </div>

        <p className="text-xl text-gray-700 font-bold mb-6 tracking-wide">
          Listen to the word and type it in the box below:
        </p>

        <div className="flex flex-col items-center justify-center gap-6 my-8">
          <button
            onClick={() => speak(SPELLING_WORDS[currentWordIndex])}
            className="flex items-center gap-3 bg-teal-50 border-2 border-teal-200 hover:border-teal-400 text-teal-700 px-8 py-5 rounded-2xl text-xl font-bold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Volume2 size={28} />
            <span>Listen Again</span>
          </button>

          <div className="w-full max-w-md">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type the word here..."
              autoFocus
              className="w-full text-center text-3xl font-extrabold tracking-wider border-3 border-gray-200 focus:border-teal-500 rounded-2xl p-4 outline-none transition-all placeholder:text-gray-300 uppercase"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-100 pt-6 mt-8">
        <button
          onClick={handleNext}
          disabled={!inputVal.trim()}
          className="flex items-center gap-2 bg-teal-600 text-white px-8 py-3.5 rounded-full text-lg font-bold hover:bg-teal-700 shadow-md transition disabled:opacity-50 transform active:scale-95 cursor-pointer"
        >
          {currentWordIndex === SPELLING_WORDS.length - 1 ? "Finish Test" : "Next Word"}{" "}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
