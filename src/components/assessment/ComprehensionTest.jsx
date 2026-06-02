import { useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";

const PASSAGE = "Leo the little lion loved to read. Every night, he would sit under the big oak tree and look at books. One evening, he found a magical story about a shiny blue star.";

const QUESTIONS = [
  {
    question: "What did Leo love to do?",
    options: ["Read books", "Run in the grass", "Play with toys", "Sleep all day"],
    answer: "Read books"
  },
  {
    question: "Where did Leo sit to read his books?",
    options: ["On the grass", "Under the big oak tree", "In his comfortable bed", "Near the river"],
    answer: "Under the big oak tree"
  },
  {
    question: "What was the magical story about?",
    options: ["A shiny blue star", "A green forest monster", "A golden treasure map", "A flying turtle"],
    answer: "A shiny blue star"
  }
];

export default function ComprehensionTest({ onNext, updateScore }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isReading, setIsReading] = useState(true);

  const handleSelect = (option) => {
    setAnswers(prev => ({ ...prev, [currentQIndex]: option }));
  };

  const handleNext = () => {
    if (currentQIndex < QUESTIONS.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      let correctCount = 0;
      QUESTIONS.forEach((q, i) => {
        if (answers[i] === q.answer) correctCount++;
      });
      // Score out of 15 (3 questions * 5 points each)
      const score = correctCount * 5;
      updateScore("comprehension", score);
      onNext();
    }
  };

  if (isReading) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-[#EADFC9] rounded-3xl p-8 md:p-12 shadow-xl min-h-[400px] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-[#1F2A44]">Part 5: Comprehension</h2>
            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 uppercase tracking-wider">
              Section 5 of 6
            </span>
          </div>

          <p className="text-lg text-gray-500 mb-6">
            Read this simple story carefully. You will answer 3 questions about it.
          </p>
          
          <div className="bg-amber-50/50 p-8 rounded-2xl border border-amber-100 my-8">
            <p className="text-2xl font-semibold leading-loose text-gray-800 tracking-wide text-center">
              {PASSAGE}
            </p>
          </div>
        </div>

        <div className="flex justify-center border-t border-gray-100 pt-6 mt-8">
          <button
            onClick={() => setIsReading(false)}
            className="flex items-center gap-2 bg-teal-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-teal-700 shadow-md transition transform active:scale-95 cursor-pointer"
          >
            I am Ready for Questions <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[currentQIndex];

  return (
    <div className="bg-white/80 backdrop-blur-md border border-[#EADFC9] rounded-3xl p-8 md:p-12 shadow-xl min-h-[400px] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-400 uppercase tracking-wider">
            Question {currentQIndex + 1} of {QUESTIONS.length}
          </h2>
          <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 uppercase tracking-wider">
            Section 5 of 6
          </span>
        </div>
        
        <p className="text-2xl text-[#1F2A44] mb-8 font-extrabold tracking-wide">{q.question}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {q.options.map((opt) => {
            const isSelected = answers[currentQIndex] === opt;
            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`w-full text-left p-6 rounded-2xl border-3 transition-all text-xl font-bold cursor-pointer ${
                  isSelected 
                    ? "border-[#E87A5D] bg-[#FFEFE7] text-[#E87A5D]" 
                    : "border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-gray-700"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-100 pt-6 mt-8">
        <button
          onClick={handleNext}
          disabled={!answers[currentQIndex]}
          className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-full text-lg font-bold hover:bg-indigo-700 shadow-md transition disabled:opacity-50 transform active:scale-95 cursor-pointer"
        >
          {currentQIndex === QUESTIONS.length - 1 ? "Submit Section" : "Next Question"} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
