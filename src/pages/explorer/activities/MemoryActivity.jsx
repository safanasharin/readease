import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { useRewards } from "../../../rewardSystem/useRewards";
import MascotGuide from "../../../components/explorer/MascotGuide";

const CARDS_DATA = [
  { id: 1, content: "🐶", type: "dog" },
  { id: 2, content: "🐱", type: "cat" },
  { id: 3, content: "🐰", type: "rabbit" },
  { id: 4, content: "🦊", type: "fox" },
  { id: 5, content: "🐻", type: "bear" },
  { id: 6, content: "🐼", type: "panda" },
];

export default function MemoryActivity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { awardActivity } = useRewards();

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Metrics
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());

  // Determine difficulty based on Support Level
  // Intensive (Level 3) -> Easy (2 pairs)
  // Guided (Level 2) -> Medium (4 pairs)
  // Emerging (Level 1) -> Hard (6 pairs)
  const supportLevel = user?.supportLevel || "emerging_support";
  let pairCount = 6; // Default Hard
  let difficultyLabel = "🌳 Hard";
  if (supportLevel === "intensive_support") {
    pairCount = 2;
    difficultyLabel = "🌱 Easy";
  } else if (supportLevel === "guided_support") {
    pairCount = 4;
    difficultyLabel = "🌿 Medium";
  }

  const initializeGame = () => {
    // Slice only the number of pairs needed
    const gamePool = CARDS_DATA.slice(0, pairCount);
    const shuffledCards = [...gamePool, ...gamePool]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ ...card, uniqueId: index }));
    
    setCards(shuffledCards);
    setFlipped([]);
    setMatched([]);
    setIsComplete(false);
    setAttempts(0);
  };

  useEffect(() => {
    initializeGame();
  }, [supportLevel]);

  const handleCardClick = (index) => {
    if (disabled || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setAttempts((a) => a + 1);
      setDisabled(true);
      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];

      if (firstCard.type === secondCard.type) {
        const newMatched = [...matched, newFlipped[0], newFlipped[1]];
        setMatched(newMatched);
        setFlipped([]);
        setDisabled(false);

        if (newMatched.length === cards.length) {
          setTimeout(async () => {
            setIsComplete(true);
            const totalTime = Date.now() - startTime;
            // Accuracy: perfect score would be equal to pairCount. 
            // Accuracy is calculated relative to total attempts vs minimum attempts.
            const minAttempts = pairCount;
            const accuracy = Math.round((minAttempts / Math.max(minAttempts, attempts + 1)) * 100);

            await awardActivity({
              activityId: "/explorer/activity/memory",
              xpEarned: 10,
              starsEarned: 1,
              message: "Memory Master Badge Unlocked! ⭐",
              analytics: {
                memoryAccuracy: accuracy,
                attempts: attempts + 1,
                completionTime: totalTime,
                accuracy
              }
            });
          }, 500);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/explorer")}
          className="flex items-center gap-2 text-indigo-600 font-black hover:text-indigo-800 transition cursor-pointer"
        >
          <ArrowLeft size={20} /> Back to Hub
        </button>
        <h1 className="text-3xl font-black text-indigo-600">Memory Match</h1>
        <button
          onClick={initializeGame}
          className="flex items-center gap-2 text-indigo-600 font-black hover:text-indigo-800 transition cursor-pointer"
        >
          <RefreshCw size={20} /> Restart
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border-4 border-indigo-200 p-8 md:p-12 w-full max-w-3xl text-center relative overflow-hidden">
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Trophy size={100} className="text-yellow-400 mb-6 drop-shadow-xl" />
              </motion.div>
              <h2 className="text-4xl font-black text-indigo-600 mb-4">You did it! 🎉</h2>
              <p className="text-xl text-gray-600 font-bold mb-8">
                Outstanding memory! You completed the game in {attempts} flips.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={initializeGame}
                  className="bg-indigo-500 text-white px-8 py-4 rounded-full font-black text-xl hover:bg-indigo-600 shadow-md transition transform hover:scale-105 cursor-pointer"
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate("/explorer")}
                  className="bg-indigo-100 text-indigo-600 px-8 py-4 rounded-full font-black text-xl hover:bg-indigo-200 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center mb-6">
          <div className="text-5xl">🧠</div>
          <div className="flex gap-2">
            <span className="bg-indigo-100 text-indigo-700 font-black px-4 py-1.5 rounded-full text-sm">
              Difficulty: {difficultyLabel}
            </span>
            <span className="bg-purple-100 text-purple-700 font-black px-4 py-1.5 rounded-full text-sm">
              Flips: {attempts}
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-black text-gray-800 mb-1">Match the animal cards!</h2>
        <p className="text-gray-500 mb-8 font-semibold">
          Tap two cards to flip them and find the matches.
        </p>

        <div
          className={`grid gap-4 mb-4 ${
            pairCount === 2
              ? "grid-cols-2 max-w-sm mx-auto"
              : pairCount === 4
              ? "grid-cols-4 max-w-xl mx-auto"
              : "grid-cols-3 md:grid-cols-4 max-w-2xl mx-auto"
          }`}
        >
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || matched.includes(index);
            return (
              <div
                key={card.uniqueId}
                className="perspective-1000 relative h-28 md:h-36 w-full cursor-pointer"
                onClick={() => handleCardClick(index)}
              >
                <motion.div
                  className="w-full h-full preserve-3d relative"
                  initial={false}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
                >
                  {/* Front of card (hidden initially) */}
                  <div className="absolute inset-0 backface-hidden flex items-center justify-center bg-white border-4 border-indigo-100 rounded-2xl shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50">
                    <span className="text-4xl opacity-30 font-black text-indigo-300">?</span>
                  </div>

                  {/* Back of card (revealed) */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center bg-indigo-50 border-4 border-indigo-300 rounded-2xl shadow-md">
                    <span className="text-5xl md:text-6xl">{card.content}</span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <MascotGuide activity="memory" mood="happy" />
        </div>
      </div>

      {/* Required CSS for 3D flip effect without tailwind plugin */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
