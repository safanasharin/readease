import { motion } from "framer-motion";
import { Mic, Brain, BookOpen, Clock } from "lucide-react";

export default function WelcomeScreen({ onNext }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-8 md:p-12 shadow-xl text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="inline-flex items-center justify-center p-4 bg-teal-100 rounded-full text-teal-600 mb-6"
      >
        <Brain size={48} />
      </motion.div>
      
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
        Dyslexia Reading Assessment
      </h1>
      
      <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
        Welcome! This interactive assessment will help us understand your reading style and identify any potential signs of dyslexia. We'll test word reading, sentence fluency, and comprehension.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <Mic className="text-indigo-500 mb-3" size={28} />
          <h3 className="font-semibold text-gray-900 mb-2">Microphone Required</h3>
          <p className="text-sm text-gray-500">You will need to read aloud. Please allow microphone permissions when asked.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <BookOpen className="text-teal-500 mb-3" size={28} />
          <h3 className="font-semibold text-gray-900 mb-2">Read Naturally</h3>
          <p className="text-sm text-gray-500">Don't rush. Read at your normal pace. It's okay to make mistakes.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <Clock className="text-orange-500 mb-3" size={28} />
          <h3 className="font-semibold text-gray-900 mb-2">Takes ~5 Minutes</h3>
          <p className="text-sm text-gray-500">The test is quick and consists of 3 simple reading sections.</p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="bg-teal-600 text-white px-10 py-4 rounded-full text-xl font-semibold hover:bg-teal-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        Start Assessment
      </button>
    </div>
  );
}
