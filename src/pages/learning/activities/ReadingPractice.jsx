/* eslint-disable */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, BookOpen, CheckCircle, ChevronRight, Volume2 } from 'lucide-react';

const CONTENT = {
  explorer: {
    title: "Picture Words & Sight Words",
    exercises: [
      {
        type: "sight-words",
        label: "Sight Words",
        words: [
          { word: "Cat", emoji: "🐱" },
          { word: "Dog", emoji: "🐶" },
          { word: "Apple", emoji: "🍎" },
          { word: "Ball", emoji: "⚽" },
          { word: "Sun", emoji: "☀️" },
          { word: "Fish", emoji: "🐟" },
          { word: "Tree", emoji: "🌳" },
          { word: "Bird", emoji: "🐦" },
          { word: "Moon", emoji: "🌙" },
          { word: "Star", emoji: "⭐" },
          { word: "Milk", emoji: "🥛" },
          { word: "Book", emoji: "📖" },
        ],
      },
    ],
  },
  beginner: {
    title: "Fun Stories & Vocabulary",
    exercises: [
      {
        type: "story",
        label: "The Little Fox",
        passages: [
          "Once upon a time, there was a little fox named Felix. Felix loved to play in the green forest.",
          "One day, he found a shiny blue stone near the river. He picked it up carefully.",
          "He took it home to show his friends. They all thought it was magical!",
          "From that day on, Felix and his friends went on many adventures together.",
        ],
        questions: [
          { q: "What was the fox's name?", options: ["Felix", "Max", "Leo"], answer: 0 },
          { q: "What did Felix find?", options: ["A flower", "A blue stone", "A fish"], answer: 1 },
          { q: "Where did Felix find it?", options: ["In a cave", "Near the river", "On a mountain"], answer: 1 },
        ],
      },
    ],
  },
  intermediate: {
    title: "Academic Reading & Comprehension",
    exercises: [
      {
        type: "passage",
        label: "The Water Cycle",
        passages: [
          "The water cycle is the continuous movement of water within the Earth and atmosphere. It is a complex system that includes many different processes.",
          "Liquid water evaporates into water vapor, condenses to form clouds, and precipitates back to earth in the form of rain and snow.",
          "This cycle is crucial for all living organisms and helps regulate the climate of our planet. Without it, life as we know it would not exist.",
        ],
        questions: [
          { q: "What happens to water when it evaporates?", options: ["It freezes", "It becomes water vapor", "It disappears"], answer: 1 },
          { q: "What does water vapor form?", options: ["Rivers", "Clouds", "Ice"], answer: 1 },
          { q: "Why is the water cycle important?", options: ["For technology", "For all living organisms", "For buildings"], answer: 1 },
        ],
      },
    ],
  },
  advanced: {
    title: "Professional Documents & Articles",
    exercises: [
      {
        type: "document",
        label: "Quarterly Review Email",
        passages: [
          "Dear Team,",
          "Please review the attached quarterly report prior to our meeting on Thursday. We will be discussing the recent market trends and evaluating our strategic positioning for the upcoming fiscal year.",
          "Pay close attention to the sections on customer acquisition costs and lifetime value metrics. These are key areas where we need to show improvement.",
          "Make sure to note down any questions regarding the budget allocations for Q4. We will allocate dedicated time for an open discussion at the end of the session.",
          "Best regards,\nManagement",
        ],
        questions: [
          { q: "When is the meeting scheduled?", options: ["Monday", "Thursday", "Friday"], answer: 1 },
          { q: "What should the team pay attention to?", options: ["Social media", "Customer acquisition costs", "Office decor"], answer: 1 },
          { q: "What will happen at the end?", options: ["A party", "Open discussion", "A quiz"], answer: 1 },
        ],
      },
    ],
  },
};

export default function ReadingPractice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ageGroup = (user?.ageGroup || 'explorer').toLowerCase();

  const content = CONTENT[ageGroup] || CONTENT.explorer;
  const exercise = content.exercises[0];

  const [currentPassage, setCurrentPassage] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const isExplorer = ageGroup === 'explorer';

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = isExplorer ? 0.7 : 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  // Explorer sight words view
  if (isExplorer) {
    return (
      <div className="min-h-screen font-sans pb-16 bg-gradient-to-br from-pink-50 via-yellow-50 to-cyan-50">
        <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-pink-100 shadow-sm px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 font-bold text-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="font-black text-lg text-pink-600">📖 Reading Practice</h1>
          <div className="text-sm font-bold text-pink-500">Explorer</div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-pink-600 mb-2">{content.title}</h2>
            <p className="text-slate-500 font-medium">Tap a word to hear how it sounds!</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {exercise.words.map((w, i) => (
              <button
                key={i}
                onClick={() => speakText(w.word)}
                className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-pink-100 hover:border-pink-300 cursor-pointer"
              >
                <span className="text-4xl block mb-2">{w.emoji}</span>
                <span className="text-xl font-black text-slate-800">{w.word}</span>
              </button>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={() => setCompleted(true)}
              disabled={completed}
              className={`px-8 py-3 rounded-xl font-bold text-lg transition shadow-lg ${completed ? 'bg-emerald-200 text-emerald-800' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'}`}
            >
              {completed ? '✅ Completed!' : 'Mark as Complete'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Story / Passage view for other age groups
  const passages = exercise.passages || [];
  const questions = exercise.questions || [];

  const quizScore = quizSubmitted
    ? questions.filter((q, i) => answers[i] === q.answer).length
    : 0;

  return (
    <div className="min-h-screen font-sans pb-16 bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50">
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-slate-100 shadow-sm px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 font-bold text-sm">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="font-black text-lg text-indigo-700">📖 Reading Practice</h1>
        <div className="text-sm font-bold text-slate-500 capitalize">{ageGroup}</div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 mb-2">{content.title}</h2>
          <p className="text-slate-500 font-medium">{exercise.label}</p>
        </div>

        {/* Reading Section */}
        {!showQuiz ? (
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-400">Paragraph {currentPassage + 1} of {passages.length}</span>
                <button onClick={() => speakText(passages[currentPassage])} className="flex items-center gap-1 text-indigo-600 font-bold text-sm hover:text-indigo-800 transition">
                  <Volume2 size={16} /> Listen
                </button>
              </div>
              <p className="text-xl leading-relaxed text-slate-700 font-medium">{passages[currentPassage]}</p>
            </div>

            {/* Passage navigation */}
            <div className="flex gap-3 mb-6">
              <button
                disabled={currentPassage === 0}
                onClick={() => setCurrentPassage(p => p - 1)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition disabled:opacity-40"
              >
                Previous
              </button>
              {currentPassage < passages.length - 1 ? (
                <button
                  onClick={() => setCurrentPassage(p => p + 1)}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  Next <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={() => setShowQuiz(true)}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-lg shadow-emerald-200"
                >
                  Take Quiz →
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-slate-500">Reading Progress</span>
                <span className="font-bold text-indigo-600">{Math.round(((currentPassage + 1) / passages.length) * 100)}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${((currentPassage + 1) / passages.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Quiz Section */
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-6">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <BookOpen size={24} className="text-indigo-600" /> Comprehension Quiz
              </h3>
              <div className="space-y-6">
                {questions.map((q, qi) => (
                  <div key={qi}>
                    <p className="font-bold text-slate-700 mb-3">{qi + 1}. {q.q}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        let styles = 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50';
                        if (answers[qi] === oi) styles = 'bg-indigo-100 border-indigo-400 text-indigo-800';
                        if (quizSubmitted) {
                          if (oi === q.answer) styles = 'bg-emerald-100 border-emerald-400 text-emerald-800';
                          else if (answers[qi] === oi && oi !== q.answer) styles = 'bg-rose-100 border-rose-400 text-rose-800';
                        }
                        return (
                          <button
                            key={oi}
                            disabled={quizSubmitted}
                            onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                            className={`w-full text-left p-3 rounded-xl border font-medium transition ${styles}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {quizSubmitted && (
              <div className={`rounded-2xl p-6 mb-6 text-center border ${quizScore === questions.length ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                <CheckCircle size={40} className={`mx-auto mb-3 ${quizScore === questions.length ? 'text-emerald-500' : 'text-amber-500'}`} />
                <p className="text-2xl font-black text-slate-800">{quizScore} / {questions.length} Correct!</p>
                <p className="text-slate-500 font-medium mt-1">
                  {quizScore === questions.length ? "Perfect score! Amazing work! 🎉" : "Good effort! Keep reading to improve!"}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowQuiz(false); setCurrentPassage(0); }}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
              >
                Re-read Passage
              </button>
              {!quizSubmitted ? (
                <button
                  disabled={Object.keys(answers).length < questions.length}
                  onClick={() => setQuizSubmitted(true)}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-lg shadow-indigo-200 disabled:opacity-40"
                >
                  Submit Answers
                </button>
              ) : (
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-lg shadow-emerald-200"
                >
                  Done ✓
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
