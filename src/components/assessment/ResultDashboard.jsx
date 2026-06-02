import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { FileText, Settings, Award } from "lucide-react";

export default function ResultDashboard({ scores, onContinue }) {
  const [saveStatus, setSaveStatus] = useState("Saving results...");

  const totalScore =
    (scores.letterConfusion || 0) +
    (scores.wordRecognition || 0) +
    (scores.readingAccuracy || 0) +
    (scores.memory || 0) +
    (scores.comprehension || 0) +
    (scores.spelling || 0);

  let level = "";
  let recommendation = "";
  let color = "";

  if (totalScore >= 80) {
    level = "Mild Dyslexia";
    recommendation =
      "You have good reading skills. We recommend using our Mild Dashboard to keep practicing with challenges and monitor your reading speeds.";
    color = "#10b981"; // Emerald
  } else if (totalScore >= 50) {
    level = "Moderate Dyslexia";
    recommendation =
      "You show some signs of reading difficulty. We recommend using our Moderate Dashboard to practice with Bionic Reading and structured story exercises.";
    color = "#f59e0b"; // Amber
  } else {
    level = "Severe Dyslexia";
    recommendation =
      "You may benefit from significant reading support. We recommend using our Severe Dashboard with the visual Reading Ruler and voice guides.";
    color = "#ef4444"; // Red
  }

  useEffect(() => {
    const saveResults = async () => {
      try {
        const storedUser = localStorage.getItem("loggedInUser");
        const user = storedUser ? JSON.parse(storedUser) : { name: "Guest User", _id: "guest" };

        await addDoc(collection(db, "assessments"), {
          userId: user._id || user.id,
          userName: user.name,
          scores: scores,
          totalScore,
          detectedLevel: level,
          date: new Date().toISOString(),
        });
        setSaveStatus("Results saved securely to cloud.");
      } catch (err) {
        console.error(err);
        setSaveStatus("Note: Could not save results to cloud (Check Firebase config).");
      }
    };

    saveResults();
  }, [scores, totalScore, level]);

  const chartData = [
    { name: "Letter (10)", score: scores.letterConfusion || 0, fill: "#8b5cf6" },
    { name: "Word Rec (20)", score: scores.wordRecognition || 0, fill: "#3b82f6" },
    { name: "Reading (20)", score: scores.readingAccuracy || 0, fill: "#06b6d4" },
    { name: "Memory (20)", score: scores.memory || 0, fill: "#ec4899" },
    { name: "Comp (15)", score: scores.comprehension || 0, fill: "#f59e0b" },
    { name: "Spelling (15)", score: scores.spelling || 0, fill: "#10b981" },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md border border-white rounded-3xl p-8 md:p-12 shadow-xl">
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="inline-flex items-center justify-center p-6 bg-gradient-to-br from-indigo-100 to-teal-100 rounded-full text-indigo-600 mb-6"
        >
          <Award size={64} />
        </motion.div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Assessment Complete</h1>
        <p className="text-sm text-gray-500">{saveStatus}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex flex-col justify-center items-center text-center">
          <p className="text-gray-500 uppercase tracking-widest text-sm font-semibold mb-2">
            Total Score
          </p>
          <div className="text-7xl font-black mb-4" style={{ color }}>
            {totalScore}
            <span className="text-3xl text-gray-400">/100</span>
          </div>
          <div
            className="px-4 py-2 rounded-full text-sm font-bold"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {level}
          </div>
        </div>

        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
          <p className="text-gray-500 uppercase tracking-widest text-sm font-semibold mb-6">
            Score Breakdown
          </p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 mb-10">
        <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
          <Settings size={24} /> AI Recommendation
        </h3>
        <p className="text-indigo-800 text-lg leading-relaxed">{recommendation}</p>
      </div>

      <div className="flex justify-center gap-4">
        {onContinue ? (
          <button
            onClick={onContinue}
            className="flex items-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-teal-700 shadow-lg transition transform hover:-translate-y-1 cursor-pointer"
          >
            Go to Dashboard
          </button>
        ) : (
          <button className="flex items-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-teal-700 shadow-lg transition transform hover:-translate-y-1">
            <FileText size={20} /> View Full Report
          </button>
        )}
      </div>
    </div>
  );
}
