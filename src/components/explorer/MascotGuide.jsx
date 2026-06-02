import { useState, useEffect } from "react";

const MASCOT_MESSAGES = {
  idle: ["Hi there! Ready to learn today? 🌟", "Pick an activity and let's play! 🎉", "You're a star learner! ⭐"],
  tracing: ["Let's trace some letters! ✏️", "Move your finger along the dots!", "You're doing amazing!"],
  "sound-matching": ["Listen carefully! 🔊", "What letter makes that sound?", "Great ears! Keep going!"],
  memory: ["Look carefully at the cards! 🧠", "Can you remember where they are?", "Excellent memory!"],
  sorting: ["Sort those shapes! 🎨", "Where does this one go?", "Brilliant sorting skills!"],
  story: ["Story time! 📖", "Listen to the words carefully.", "What a great listener you are!"],
  success: ["WOW! You did it! 🎉", "AMAZING work! ⭐⭐⭐", "You are a SUPERSTAR! 🌟"],
  encouragement: ["Great try! Let's go again! 💪", "You're getting better every time!", "Keep going, champion! 🏆"],
};

export default function MascotGuide({ activity = "idle", mood = "happy", customMessage = null }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const messages = MASCOT_MESSAGES[activity] || MASCOT_MESSAGES.idle;
  const currentMessage = customMessage || messages[messageIndex % messages.length];

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMessageIndex((i) => i + 1);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [activity]);

  const mascotEmoji = mood === "celebrating" ? "🦊" : mood === "thinking" ? "🐸" : "🦁";
  const bubbleColor =
    mood === "celebrating"
      ? "bg-yellow-50 border-yellow-300"
      : mood === "thinking"
      ? "bg-sky-50 border-sky-300"
      : "bg-white border-pink-200";

  return (
    <div className="flex items-end gap-3">
      {/* Mascot avatar */}
      <div
        className="text-5xl select-none"
        style={{ animation: "mascotBob 2s ease-in-out infinite" }}
      >
        {mascotEmoji}
      </div>

      {/* Speech bubble */}
      <div
        className={`relative px-5 py-3 rounded-2xl rounded-bl-sm border-2 shadow-sm max-w-xs transition-opacity duration-400 ${bubbleColor} ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <p className="text-sm font-bold text-gray-700 leading-snug">{currentMessage}</p>
        <div
          className={`absolute -bottom-2 left-4 w-4 h-4 rotate-45 border-b-2 border-l-2 ${bubbleColor} ${bubbleColor}`}
          style={{ borderColor: "inherit" }}
        />
      </div>

      <style>{`
        @keyframes mascotBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
