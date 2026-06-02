import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function WordRecognitionTest({ onNext, updateScore }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});

  const QUESTIONS = [
    {
      word: "friend",
      options: ["friend", "freind"],
      correct: "friend",
    },
    {
      word: "said",
      options: ["siad", "said"],
      correct: "said",
    },
    {
      word: "what",
      options: ["what", "waht"],
      correct: "what",
    },
    {
      word: "night",
      options: ["nihgt", "night"],
      correct: "night",
    },
    {
      word: "because",
      options: ["becuase", "because"],
      correct: "because",
    },
  ];

  const handleSelect = (option) => {
    setAnswers(prev => ({ ...prev, [currentQ]: option }));
  };

  const handleNext = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      let score = 0;
      QUESTIONS.forEach((q, idx) => {
        if (answers[idx] === q.correct) {
          score += 4; // 5 questions * 4 = 20 points
        }
      });
      updateScore("wordRecognition", score);
      onNext();
    }
  };

  const q = QUESTIONS[currentQ];

  return (
    <div className="bg-white/80 backdrop-blur-md border border-[#EADFC9] rounded-3xl p-8 md:p-12 shadow-xl min-h-[400px] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-[#1F2A44]">Part 2: Word Recognition</h2>
          <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 uppercase tracking-wider">
            Section {currentQ + 1} of {QUESTIONS.length}
          </span>
        </div>

        <p className="text-xl text-gray-700 font-bold mb-8 tracking-wide">
          Select the word that is spelled <strong className="text-teal-600 font-black">correctly</strong>:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
          {q.options.map((option) => {
            const isSelected = answers[currentQ] === option;
            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`py-8 text-3xl font-extrabold rounded-2xl border-3 transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#E87A5D] bg-[#FFEFE7] text-[#E87A5D] scale-102"
                    : "border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-gray-800"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-100 pt-6 mt-8">
        <button
          onClick={handleNext}
          disabled={!answers[currentQ]}
          className="flex items-center gap-2 bg-teal-600 text-white px-8 py-3.5 rounded-full text-lg font-bold hover:bg-teal-700 shadow-md transition disabled:opacity-50 transform active:scale-95 cursor-pointer"
        >
          {currentQ === QUESTIONS.length - 1 ? "Submit Section" : "Next Word"} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
