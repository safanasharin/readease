import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function LetterConfusionTest({ onNext, updateScore }) {
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [selectedLetters1, setSelectedLetters1] = useState([]); // indices of clicked letters
  const [selectedLetters2, setSelectedLetters2] = useState([]); // indices of clicked letters
  const [q3Answer, setQ3Answer] = useState(null);
  const [q4Answer, setQ4Answer] = useState(null);

  // Question 1: Find all 'b's in a grid of 'b's and 'd's.
  // b is at indices: 0, 3, 5, 8, 9, 11 (6 total 'b's)
  const lettersGrid1 = ["b", "d", "d", "b", "d", "b", "d", "d", "b", "b", "d", "b"];
  const correctIndices1 = [0, 3, 5, 8, 9, 11];

  // Question 2: Find all 'p's in a grid of 'p's and 'q's.
  // p is at indices: 1, 2, 4, 7, 9, 10 (6 total 'p's)
  const lettersGrid2 = ["q", "p", "p", "q", "p", "q", "q", "p", "q", "p", "p", "q"];
  const correctIndices2 = [1, 2, 4, 7, 9, 10];

  const handleToggle1 = (idx) => {
    if (selectedLetters1.includes(idx)) {
      setSelectedLetters1(prev => prev.filter(i => i !== idx));
    } else {
      setSelectedLetters1(prev => [...prev, idx]);
    }
  };

  const handleToggle2 = (idx) => {
    if (selectedLetters2.includes(idx)) {
      setSelectedLetters2(prev => prev.filter(i => i !== idx));
    } else {
      setSelectedLetters2(prev => [...prev, idx]);
    }
  };

  const calculateScoreAndProceed = () => {
    let score = 0;

    // Q1: 3 points
    // Calculate how many of correct indices were selected and how many incorrect indices were avoided
    let q1Correct = 0;
    lettersGrid1.forEach((letter, idx) => {
      const isCorrectLetter = correctIndices1.includes(idx);
      const isSelected = selectedLetters1.includes(idx);
      if ((isCorrectLetter && isSelected) || (!isCorrectLetter && !isSelected)) {
        q1Correct++;
      }
    });
    if (q1Correct === lettersGrid1.length) score += 3;
    else if (q1Correct >= lettersGrid1.length - 2) score += 2;
    else if (q1Correct >= lettersGrid1.length - 4) score += 1;

    // Q2: 3 points
    let q2Correct = 0;
    lettersGrid2.forEach((letter, idx) => {
      const isCorrectLetter = correctIndices2.includes(idx);
      const isSelected = selectedLetters2.includes(idx);
      if ((isCorrectLetter && isSelected) || (!isCorrectLetter && !isSelected)) {
        q2Correct++;
      }
    });
    if (q2Correct === lettersGrid2.length) score += 3;
    else if (q2Correct >= lettersGrid2.length - 2) score += 2;
    else if (q2Correct >= lettersGrid2.length - 4) score += 1;

    // Q3: 2 points
    if (q3Answer === "d") score += 2;

    // Q4: 2 points
    if (q4Answer === "q") score += 2;

    updateScore("letterConfusion", score);
    onNext();
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-[#EADFC9] rounded-3xl p-8 md:p-12 shadow-xl min-h-[450px] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-[#1F2A44]">Part 1: Letter Confusion</h2>
          <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 uppercase tracking-wider">
            Section 1 of 6
          </span>
        </div>

        {currentSubStep === 0 && (
          <div>
            <p className="text-xl text-gray-700 font-bold mb-4 tracking-wide">
              Q1. Tap/click on all the letters that are <strong className="text-teal-600 text-2xl font-black">"b"</strong> (Ignore all "d"s).
            </p>
            <div className="grid grid-cols-4 gap-4 max-w-md mx-auto my-8">
              {lettersGrid1.map((letter, idx) => {
                const isSelected = selectedLetters1.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleToggle1(idx)}
                    className={`h-16 w-16 text-4xl font-extrabold rounded-2xl border-3 transition-all flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? "border-[#E87A5D] bg-[#FFEFE7] text-[#E87A5D] scale-105"
                        : "border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-gray-800"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {currentSubStep === 1 && (
          <div>
            <p className="text-xl text-gray-700 font-bold mb-4 tracking-wide">
              Q2. Tap/click on all the letters that are <strong className="text-teal-600 text-2xl font-black">"p"</strong> (Ignore all "q"s).
            </p>
            <div className="grid grid-cols-4 gap-4 max-w-md mx-auto my-8">
              {lettersGrid2.map((letter, idx) => {
                const isSelected = selectedLetters2.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleToggle2(idx)}
                    className={`h-16 w-16 text-4xl font-extrabold rounded-2xl border-3 transition-all flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? "border-[#E87A5D] bg-[#FFEFE7] text-[#E87A5D] scale-105"
                        : "border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-gray-800"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {currentSubStep === 2 && (
          <div>
            <p className="text-xl text-gray-700 font-bold mb-6 tracking-wide text-center">
              Q3. Which letter does the word <strong className="text-teal-600 text-2xl font-black">"dog"</strong> start with?
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto my-8">
              {["b", "d", "p", "q"].map((letter) => {
                const isSelected = q3Answer === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => setQ3Answer(letter)}
                    className={`py-6 text-4xl font-extrabold rounded-2xl border-3 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#E87A5D] bg-[#FFEFE7] text-[#E87A5D]"
                        : "border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-gray-800"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {currentSubStep === 3 && (
          <div>
            <p className="text-xl text-gray-700 font-bold mb-6 tracking-wide text-center">
              Q4. Which letter does the word <strong className="text-teal-600 text-2xl font-black">"queen"</strong> start with?
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto my-8">
              {["b", "d", "p", "q"].map((letter) => {
                const isSelected = q4Answer === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => setQ4Answer(letter)}
                    className={`py-6 text-4xl font-extrabold rounded-2xl border-3 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#E87A5D] bg-[#FFEFE7] text-[#E87A5D]"
                        : "border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-gray-800"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-8 border-t border-gray-100 pt-6">
        {currentSubStep < 3 ? (
          <button
            onClick={() => setCurrentSubStep(prev => prev + 1)}
            className="flex items-center gap-2 bg-teal-600 text-white px-8 py-3.5 rounded-full text-lg font-bold hover:bg-teal-700 shadow-md transition transform active:scale-95 cursor-pointer"
          >
            Next Question <ArrowRight size={20} />
          </button>
        ) : (
          <button
            onClick={calculateScoreAndProceed}
            disabled={!q4Answer}
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-full text-lg font-bold hover:bg-indigo-700 shadow-md transition disabled:opacity-50 transform active:scale-95 cursor-pointer"
          >
            Submit Section <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
