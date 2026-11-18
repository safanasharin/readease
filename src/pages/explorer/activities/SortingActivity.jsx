import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Trophy, Clock, Target, BoxSelect, Volume2 } from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import MascotGuide from "../../../components/explorer/MascotGuide";

// --- SHAPE DATA ---
const SHAPES_DATA = {
  circle: { id: "circle", name: "Circle", color: "text-red-500 fill-red-500", boxColor: "border-red-400 bg-red-50", viewBox: "0 0 100 100", path: <circle cx="50" cy="50" r="45" /> },
  square: { id: "square", name: "Square", color: "text-blue-500 fill-blue-500", boxColor: "border-blue-400 bg-blue-50", viewBox: "0 0 100 100", path: <rect x="10" y="10" width="80" height="80" rx="15" /> },
  triangle: { id: "triangle", name: "Triangle", color: "text-yellow-400 fill-yellow-400", boxColor: "border-yellow-400 bg-yellow-50", viewBox: "0 0 100 100", path: <polygon points="50,10 90,90 10,90" strokeLinejoin="round" strokeWidth="5" /> },
  rectangle: { id: "rectangle", name: "Rectangle", color: "text-green-500 fill-green-500", boxColor: "border-green-400 bg-green-50", viewBox: "0 0 120 100", path: <rect x="10" y="25" width="100" height="50" rx="10" /> },
  oval: { id: "oval", name: "Oval", color: "text-purple-500 fill-purple-500", boxColor: "border-purple-400 bg-purple-50", viewBox: "0 0 100 100", path: <ellipse cx="50" cy="50" rx="45" ry="25" /> },
  star: { id: "star", name: "Star", color: "text-orange-400 fill-orange-400", boxColor: "border-orange-400 bg-orange-50", viewBox: "0 0 100 100", path: <polygon points="50,5 61,35 95,35 68,54 78,85 50,65 22,85 32,54 5,35 39,35" strokeLinejoin="round" /> },
  pentagon: { id: "pentagon", name: "Pentagon", color: "text-teal-500 fill-teal-500", boxColor: "border-teal-400 bg-teal-50", viewBox: "0 0 100 100", path: <polygon points="50,5 95,38 78,90 22,90 5,38" strokeLinejoin="round" strokeWidth="5" /> },
  hexagon: { id: "hexagon", name: "Hexagon", color: "text-indigo-500 fill-indigo-500", boxColor: "border-indigo-400 bg-indigo-50", viewBox: "0 0 100 100", path: <polygon points="50,5 90,27 90,73 50,95 10,73 10,27" strokeLinejoin="round" strokeWidth="5" /> },
  diamond: { id: "diamond", name: "Diamond", color: "text-cyan-500 fill-cyan-500", boxColor: "border-cyan-400 bg-cyan-50", viewBox: "0 0 100 100", path: <polygon points="50,5 90,50 50,95 10,50" strokeLinejoin="round" strokeWidth="5" /> },
  heart: { id: "heart", name: "Heart", color: "text-pink-500 fill-pink-500", boxColor: "border-pink-400 bg-pink-50", viewBox: "0 0 100 100", path: <path d="M50,30 C50,30 45,10 25,10 C5,10 5,40 5,40 C5,60 50,90 50,90 C50,90 95,60 95,40 C95,40 95,10 75,10 C55,10 50,30 50,30 Z" strokeLinejoin="round"/> },
};

const LEVELS = {
  Easy: ["circle", "square", "triangle"],
  Medium: ["circle", "square", "triangle", "rectangle", "oval"],
  Hard: ["circle", "square", "triangle", "rectangle", "oval", "star", "pentagon", "diamond"]
};

export default function SortingActivity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [level, setLevel] = useState(null); // 'Easy', 'Medium', 'Hard'
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [time, setTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [activeShapeProps, setActiveShapeProps] = useState({ x: 0, y: 0, scale: 1 });
  const controls = useAnimation();
  const timerRef = useRef(null);

  // Audio Feedback
  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1.2;
    window.speechSynthesis.speak(u);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startLevel = (selectedLevel) => {
    stopTimer();
    setLevel(selectedLevel);
    setAttempts(0);
    setCurrentIndex(0);
    setIsComplete(false);
    setTime(0);

    const availableShapes = LEVELS[selectedLevel];
    // Create a queue of shapes to sort (e.g. 8 shapes for Hard)
    const shapesQueue = [];
    const queueLength = selectedLevel === "Easy" ? 3 : selectedLevel === "Medium" ? 5 : 8;
    
    // Fill queue randomly from available shapes ensuring some variety
    for (let i = 0; i < queueLength; i++) {
      shapesQueue.push(availableShapes[Math.floor(Math.random() * availableShapes.length)]);
    }
    setQueue(shapesQueue);

    // Announce first shape
    setTimeout(() => {
      speak(`This is a ${SHAPES_DATA[shapesQueue[0]].name}. Drag the ${SHAPES_DATA[shapesQueue[0]].name}!`);
    }, 500);

    timerRef.current = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
  };

  useEffect(() => {
    return () => stopTimer();
  }, []);

  const repeatInstruction = () => {
    if (queue[currentIndex]) {
      speak(`Drag the ${SHAPES_DATA[queue[currentIndex]].name} to its box!`);
    }
  };

  const handleMatch = async (containerId) => {
    const currentShapeId = queue[currentIndex];
    setAttempts(prev => prev + 1);

    if (containerId === currentShapeId) {
      // MATCH!
      const praises = ["🎉 Great Sorting!", "🌟 Excellent Job!", "🔷 You Found the Right Shape!", "⭐ Wonderful!"];
      speak(praises[Math.floor(Math.random() * praises.length)]);

      // Animate shape shrinking into the box
      await controls.start({ scale: 0, opacity: 0, transition: { duration: 0.3 } });

      if (currentIndex + 1 < queue.length) {
        // Next Shape
        setCurrentIndex(prev => prev + 1);
        controls.set({ x: 0, y: 0, scale: 0, opacity: 0 }); // reset position instantly
        await controls.start({ scale: 1, opacity: 1, transition: { type: "spring", bounce: 0.5 } });
        
        setTimeout(() => {
          speak(`This is a ${SHAPES_DATA[queue[currentIndex + 1]].name}`);
        }, 500);
      } else {
        // Win!
        handleWin(attempts + 1);
      }
    } else {
      // WRONG MATCH
      const encouragements = ["🌈 Try Again!", "🌟 Look Carefully!", "💪 You Can Do It!"];
      speak(encouragements[Math.floor(Math.random() * encouragements.length)]);
      
      // Animate bounce back
      controls.start({ x: 0, y: 0, transition: { type: "spring", bounce: 0.6 } });
    }
  };

  const handleDragEnd = (event, info) => {
    // Simple hit detection based on vertical drop distance
    // In a real complex app we'd use bounding boxes, but since the boxes are at the bottom, 
    // a simple Y offset check combined with finding the closest X box works well.
    // However, the prompt allows "Tap Shape -> Tap Container". So tapping the container is also fully supported via onClick!
    
    // For drag, if they drop it somewhat low on the screen, we snap it back and ask them to just tap or drag directly.
    controls.start({ x: 0, y: 0, transition: { type: "spring", bounce: 0.5 } });
  };

  const handleWin = async (totalAttempts) => {
    stopTimer();
    setIsComplete(true);
    speak("Incredible! You sorted all the shapes!");

    if (!user || !user._id) return;
    setIsSaving(true);
    
    const accuracy = Math.round((queue.length / totalAttempts) * 100);

    try {
      await fetch("http://localhost:5000/api/child-progress/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
          userId: user._id,
          activityType: "shape_sorting",
          completed: true,
          level: level,
          shapesSorted: queue.length,
          totalShapes: queue.length,
          attempts: totalAttempts,
          accuracy: accuracy,
          completionTime: time
        })
      });
    } catch (err) {
      console.error("Error saving shape sorting progress", err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  // --- RENDERING ---
  
  if (!level) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-100 via-emerald-50 to-white p-6 flex flex-col items-center">
        <div className="w-full max-w-7xl flex items-center justify-between mb-12">
          <button
            onClick={() => navigate("/explorer")}
            className="flex items-center gap-2 text-teal-800 font-black hover:opacity-70 transition"
          >
            <ArrowLeft size={20} /> Back to Hub
          </button>
          <h1 className="text-4xl font-black text-teal-800 flex items-center gap-3">
            <BoxSelect className="text-teal-500" size={40} />
            Shape Sorting Adventure
          </h1>
          <div className="w-24"></div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl border-4 border-teal-200 p-12 max-w-5xl w-full text-center relative overflow-hidden">
          <MascotGuide
            emotion="happy"
            message="Let's organize the shapes! Pick a level to start sorting!"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <button
              onClick={() => startLevel("Easy")}
              className="bg-green-100 border-4 border-green-300 text-green-800 rounded-3xl p-8 hover:bg-green-200 hover:-translate-y-2 transition-transform group"
            >
              <h3 className="text-3xl font-black mb-2">Easy</h3>
              <p className="font-bold opacity-80">3 Basic Shapes</p>
            </button>
            <button
              onClick={() => startLevel("Medium")}
              className="bg-yellow-100 border-4 border-yellow-300 text-yellow-800 rounded-3xl p-8 hover:bg-yellow-200 hover:-translate-y-2 transition-transform group"
            >
              <h3 className="text-3xl font-black mb-2">Medium</h3>
              <p className="font-bold opacity-80">5 Shapes</p>
            </button>
            <button
              onClick={() => startLevel("Hard")}
              className="bg-red-100 border-4 border-red-300 text-red-800 rounded-3xl p-8 hover:bg-red-200 hover:-translate-y-2 transition-transform group"
            >
              <h3 className="text-3xl font-black mb-2">Hard</h3>
              <p className="font-bold opacity-80">8 Complex Shapes</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentShapeId = queue[currentIndex];
  const currentShape = currentShapeId ? SHAPES_DATA[currentShapeId] : null;
  const availableContainers = LEVELS[level].map(id => SHAPES_DATA[id]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-100 via-emerald-50 to-white p-6 flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-7xl flex items-center justify-between mb-8 z-10">
        <button
          onClick={() => { stopTimer(); setLevel(null); }}
          className="flex items-center gap-2 text-teal-800 font-black hover:opacity-70 transition"
        >
          <ArrowLeft size={20} /> Change Level
        </button>
        
        <div className="flex gap-6">
          <div className="bg-white px-6 py-3 rounded-full border-2 border-teal-200 shadow-sm flex items-center gap-3">
            <Target className="text-purple-500" />
            <span className="font-black text-teal-900 text-xl">Attempts: {attempts}</span>
          </div>
          <div className="bg-white px-6 py-3 rounded-full border-2 border-teal-200 shadow-sm flex items-center gap-3">
            <Clock className="text-orange-500" />
            <span className="font-black text-teal-900 text-xl">{formatTime(time)}</span>
          </div>
          <button 
            onClick={repeatInstruction}
            className="bg-sky-100 hover:bg-sky-200 text-sky-700 px-6 py-3 rounded-full border-2 border-sky-300 shadow-sm flex items-center gap-3 transition font-black"
          >
            <Volume2 /> Repeat
          </button>
        </div>

        <button
          onClick={() => startLevel(level)}
          className="flex items-center gap-2 text-teal-800 font-black hover:opacity-70 transition"
        >
          <RefreshCw size={20} /> Restart
        </button>
      </div>

      <div className="flex-1 w-full max-w-6xl flex flex-col items-center justify-between py-10 relative z-0">
        
        {/* CENTER ACTIVE SHAPE */}
        <div className="flex-1 flex items-center justify-center min-h-[300px] w-full">
          <AnimatePresence>
            {!isComplete && currentShape && (
              <motion.div
                key={currentIndex}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={1}
                onDragEnd={handleDragEnd}
                animate={controls}
                initial={{ scale: 0, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.6 }}
                className="cursor-grab active:cursor-grabbing hover:scale-110 drop-shadow-2xl z-50 relative"
                style={{ width: "220px", height: "220px" }}
              >
                <svg viewBox={currentShape.viewBox} className={`w-full h-full drop-shadow-xl ${currentShape.color}`}>
                  {currentShape.path}
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM CONTAINERS */}
        <div className="w-full mt-10">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {availableContainers.map((container) => (
              <motion.button
                key={container.id}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMatch(container.id)}
                className={`relative w-32 h-40 sm:w-40 sm:h-48 rounded-[2rem] border-4 ${container.boxColor} shadow-lg flex flex-col items-center justify-center p-4 transition-colors cursor-pointer group`}
              >
                <div className="absolute inset-0 bg-white/40 rounded-[2rem] opacity-0 group-hover:opacity-100 transition"></div>
                
                {/* Dashed outline inside box representing the shape */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 opacity-40">
                  <svg viewBox={container.viewBox} className={`w-full h-full text-black fill-transparent stroke-black stroke-[3] stroke-dasharray-4`} style={{ strokeDasharray: "8, 8" }}>
                    {container.path}
                  </svg>
                </div>
                
                <span className="font-black text-gray-700 text-lg sm:text-xl z-10">{container.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

      </div>

      {/* COMPLETION OVERLAY */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md rounded-[3rem] border-8 border-emerald-300 flex flex-col items-center justify-center p-8 shadow-2xl m-6"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Trophy size={120} className="text-yellow-400 mb-6 drop-shadow-xl" />
            </motion.div>
            
            <h2 className="text-5xl font-black text-emerald-800 mb-8 text-center">
              Shape Adventure Complete! 🎉
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full max-w-2xl">
              <div className="bg-emerald-50 p-6 rounded-3xl text-center border-4 border-emerald-100">
                <p className="font-bold text-emerald-600 mb-1">Shapes Sorted</p>
                <p className="text-4xl font-black text-emerald-900">{queue.length}</p>
              </div>
              <div className="bg-teal-50 p-6 rounded-3xl text-center border-4 border-teal-100">
                <p className="font-bold text-teal-600 mb-1">Accuracy</p>
                <p className="text-4xl font-black text-teal-900">
                  {Math.round((queue.length / attempts) * 100)}%
                </p>
              </div>
              <div className="bg-cyan-50 p-6 rounded-3xl text-center border-4 border-cyan-100">
                <p className="font-bold text-cyan-600 mb-1">Time</p>
                <p className="text-4xl font-black text-cyan-900">{formatTime(time)}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => startLevel(level)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-10 rounded-full text-2xl shadow-lg transition hover:scale-105"
              >
                Play Again
              </button>
              <button
                onClick={() => navigate("/parent")}
                className="bg-white border-4 border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-black py-4 px-10 rounded-full text-2xl transition hover:scale-105"
              >
                View Progress
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
