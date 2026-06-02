import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Trophy, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRewards } from "../../../rewardSystem/useRewards";
import MascotGuide from "../../../components/explorer/MascotGuide";

const ROUNDS = [
  {
    type: "shape",
    title: "Sort the shapes!",
    desc: "Drag the shapes to their matching outlines.",
    items: [
      { id: "circle", label: "🔴 Circle", color: "bg-red-400", style: "rounded-full w-20 h-20" },
      { id: "square", label: "🟦 Square", color: "bg-blue-400", style: "rounded-2xl w-20 h-20" },
      { id: "triangle", label: "🔺 Triangle", color: "border-b-[80px] border-l-[40px] border-r-[40px] border-l-transparent border-r-transparent border-yellow-400 w-0 h-0", style: "" }
    ],
    zones: ["circle", "square", "triangle"]
  },
  {
    type: "color",
    title: "Sort the colors!",
    desc: "Drag the items to their correct color baskets.",
    items: [
      { id: "red", label: "🍎", basket: "red" },
      { id: "yellow", label: "🍌", basket: "yellow" },
      { id: "green", label: "🥦", basket: "green" }
    ],
    zones: ["red", "yellow", "green"]
  },
  {
    type: "category",
    title: "Sort by Category!",
    desc: "Drag food items to the Bowl, and animals to the House.",
    items: [
      { id: "food", label: "🍕", basket: "food" },
      { id: "food", label: "🍩", basket: "food" },
      { id: "animal", label: "🐶", basket: "animal" },
      { id: "animal", label: "🦁", basket: "animal" }
    ],
    zones: ["food", "animal"]
  }
];

export default function SortingActivity() {
  const navigate = useNavigate();
  const { awardActivity } = useRewards();

  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [placed, setPlaced] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [feedback, setFeedback] = useState("");

  const round = ROUNDS[currentRoundIdx];

  // Refs for drop zones
  const zoneRefs = {
    circle: useRef(null),
    square: useRef(null),
    triangle: useRef(null),
    red: useRef(null),
    yellow: useRef(null),
    green: useRef(null),
    food: useRef(null),
    animal: useRef(null),
  };

  useEffect(() => {
    // Initialize placed map for current items
    const initialPlaced = {};
    round.items.forEach((item, index) => {
      initialPlaced[index] = false;
    });
    setPlaced(initialPlaced);
  }, [currentRoundIdx]);

  const checkDrop = (itemIndex, item, info) => {
    const x = info.point.x;
    const y = info.point.y;
    
    // Find target zone
    let targetZone = null;
    if (round.type === "shape") {
      targetZone = item.id;
    } else {
      targetZone = item.basket;
    }

    const ref = zoneRefs[targetZone];
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    // Check overlap
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      setPlaced((prev) => ({ ...prev, [itemIndex]: true }));
      setFeedback("Excellent! You sorted it! 🎉");
      
      // Speak positive feedback
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance("Good sorting!");
        utter.rate = 0.8;
        utter.pitch = 1.3;
        window.speechSynthesis.speak(utter);
      }

      setTimeout(() => setFeedback(""), 1200);
    } else {
      setMistakes((m) => m + 1);
      setFeedback("Look closely! Try another basket. 🧺");
      
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance("Let's try again!");
        utter.rate = 0.8;
        utter.pitch = 1.3;
        window.speechSynthesis.speak(utter);
      }

      setTimeout(() => setFeedback(""), 1200);
    }
  };

  // Check if all items in current round are placed
  const isRoundFinished = Object.keys(placed).length > 0 && Object.values(placed).every(v => v === true);

  const handleNextRound = async () => {
    if (currentRoundIdx + 1 < ROUNDS.length) {
      setCurrentRoundIdx((r) => r + 1);
    } else {
      setIsComplete(true);
      const totalTime = Date.now() - sessionStartTime;
      const totalItems = ROUNDS.reduce((sum, r) => sum + r.items.length, 0);
      const accuracy = Math.round((totalItems / (totalItems + mistakes)) * 100);

      await awardActivity({
        activityId: "/explorer/activity/sorting",
        xpEarned: 10,
        starsEarned: 1,
        message: "Sorting Champion Badge Unlocked! ⭐",
        analytics: {
          sortingAccuracy: accuracy,
          completionTime: totalTime,
          accuracy
        }
      });
    }
  };

  const resetGame = () => {
    setCurrentRoundIdx(0);
    setPlaced({});
    setIsComplete(false);
    setMistakes(0);
    setFeedback("");
  };

  return (
    <div className="min-h-screen bg-teal-50 p-6 flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/explorer")}
          className="flex items-center gap-2 text-teal-600 font-black hover:text-teal-800 transition cursor-pointer"
        >
          <ArrowLeft size={20} /> Back to Hub
        </button>
        <h1 className="text-3xl font-black text-teal-600">Sorting Corner</h1>
        <button
          onClick={resetGame}
          className="flex items-center gap-2 text-teal-600 font-black hover:text-teal-800 transition cursor-pointer"
        >
          <RefreshCw size={20} /> Restart
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border-4 border-teal-200 p-8 md:p-12 w-full max-w-3xl text-center relative overflow-hidden flex flex-col items-center min-h-[500px]">
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Trophy size={100} className="text-yellow-400 mb-6 drop-shadow-xl" />
              </motion.div>
              <h2 className="text-4xl font-black text-teal-600 mb-4">Master Sorter! 🎨</h2>
              <p className="text-xl text-gray-600 font-bold mb-8">
                You successfully sorted colors, shapes, and categories!
              </p>

              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className="bg-teal-500 text-white px-8 py-4 rounded-full font-black text-xl hover:bg-teal-600 shadow-md transition transform hover:scale-105 cursor-pointer"
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate("/explorer")}
                  className="bg-teal-100 text-teal-600 px-8 py-4 rounded-full font-black text-xl hover:bg-teal-200 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full flex justify-between items-center mb-4">
          <div className="text-5xl">🎨</div>
          <div className="bg-teal-100 text-teal-700 font-black px-4 py-1.5 rounded-full text-sm">
            Round {currentRoundIdx + 1} / {ROUNDS.length}
          </div>
        </div>

        <h2 className="text-2xl font-black text-gray-800 mb-1">{round.title}</h2>
        <p className="text-gray-500 mb-8 font-semibold">{round.desc}</p>

        {feedback && (
          <div className="h-6 mb-4 text-md font-black text-teal-600 animate-bounce">
            {feedback}
          </div>
        )}

        {/* Drop Zones */}
        <div className="flex justify-around w-full mb-12 gap-4">
          {round.zones.map((zoneKey) => {
            const hasPlacedCount = round.items.filter((item, idx) => {
              const matchedZone = round.type === "shape" ? item.id : item.basket;
              return matchedZone === zoneKey && placed[idx];
            }).length;

            const isFilled = hasPlacedCount > 0;

            return (
              <div
                key={zoneKey}
                ref={zoneRefs[zoneKey]}
                className={`w-32 h-32 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all duration-300
                  ${isFilled
                    ? "border-teal-500 bg-teal-50/50 scale-105"
                    : "border-slate-300 bg-slate-50"
                  }`}
              >
                {/* Visual indicator inside drop zone */}
                {round.type === "shape" && zoneKey === "circle" && (
                  <div className={`w-16 h-16 rounded-full border-4 border-dashed border-red-300 flex items-center justify-center text-xs text-red-500 font-bold ${isFilled ? "bg-red-400 border-none text-white text-2xl" : ""}`}>
                    {isFilled ? "🔴" : "Circle"}
                  </div>
                )}
                {round.type === "shape" && zoneKey === "square" && (
                  <div className={`w-16 h-16 rounded-xl border-4 border-dashed border-blue-300 flex items-center justify-center text-xs text-blue-500 font-bold ${isFilled ? "bg-blue-400 border-none text-white text-2xl" : ""}`}>
                    {isFilled ? "🟦" : "Square"}
                  </div>
                )}
                {round.type === "shape" && zoneKey === "triangle" && (
                  <div className={`w-16 h-16 border-4 border-dashed border-yellow-300 flex items-center justify-center text-xs text-yellow-500 font-bold ${isFilled ? "bg-yellow-400 border-none text-white text-2xl" : ""}`}>
                    {isFilled ? "🔺" : "Triangle"}
                  </div>
                )}

                {/* Color mode zones */}
                {round.type === "color" && (
                  <div className="text-center">
                    <span className="text-4xl">🧺</span>
                    <p className="text-xs font-black capitalize mt-1 text-slate-500">{zoneKey} Box</p>
                    {isFilled && <span className="text-xl">✨ Loaded</span>}
                  </div>
                )}

                {/* Category mode zones */}
                {round.type === "category" && (
                  <div className="text-center p-2">
                    <span className="text-4xl">{zoneKey === "food" ? "🥣" : "🏠"}</span>
                    <p className="text-xs font-black capitalize mt-1 text-slate-500">
                      {zoneKey === "food" ? "Bowl (Food)" : "House (Animal)"}
                    </p>
                    {isFilled && <span className="text-xs font-black text-teal-600">{hasPlacedCount} Items</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Draggable Shapes / Objects */}
        <div className="flex justify-around w-full max-w-xl relative h-28 items-center bg-slate-50 rounded-3xl p-4 border-2 border-slate-100">
          {round.items.map((item, idx) => {
            if (placed[idx]) return null;

            return (
              <motion.div
                key={idx}
                drag
                dragSnapToOrigin
                onDragEnd={(e, info) => checkDrop(idx, item, info)}
                whileDrag={{ scale: 1.15, zIndex: 10, cursor: "grabbing" }}
                className={`cursor-grab flex items-center justify-center text-4xl shadow-md p-2 bg-white rounded-2xl border border-slate-200 select-none
                  ${round.type === "shape" && item.id === "triangle" ? "" : "w-16 h-16"}`}
              >
                {round.type === "shape" ? (
                  item.id === "circle" ? "🔴" : item.id === "square" ? "🟦" : "🔺"
                ) : (
                  item.label
                )}
              </motion.div>
            );
          })}

          {isRoundFinished && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleNextRound}
              className="absolute inset-0 bg-teal-500 text-white font-black text-xl rounded-3xl flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:bg-teal-600 transition"
            >
              <span>{currentRoundIdx === ROUNDS.length - 1 ? "Finish Game! 🏆" : "Next Sorting Round! 🧺"}</span>
              <ArrowRight size={22} />
            </motion.button>
          )}
        </div>

        <div className="mt-8 w-full">
          <MascotGuide activity="sorting" mood="happy" />
        </div>
      </div>
    </div>
  );
}
