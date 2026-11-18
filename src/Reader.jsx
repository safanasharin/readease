import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

export default function Reader() {
  const [assessmentChecked, setAssessmentChecked] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const utteranceRef = useRef(null);
  const startTimeRef = useRef(null);
  const hasSavedRef = useRef(false);
  const wordPositionsRef = useRef([]);
  const highlightTimerRef = useRef(null);
  const currentIndexRef = useRef(-1);

  const isCancelledRef = useRef(false);

  const story = location.state?.story || null;

  const { user, token } = useAuth();

  const [text, setText] = useState("");
  const [words, setWords] = useState([]);
  const [index, setIndex] = useState(-1);
  const [speed, setSpeed] = useState(0.9);
  const [saveMessage, setSaveMessage] = useState("");
  const [voices, setVoices] = useState([]);
  const [fontSize, setFontSize] = useState(24);

  useEffect(() => {
    if (story?.content) {
      setText(story.content);
      setWords(story.content.match(/\S+/g) || []);
    } else {
      setText("");
      setWords([]);
    }

    setIndex(-1);
    setSaveMessage("");
    hasSavedRef.current = false;
    isCancelledRef.current = false;
    currentIndexRef.current = -1;
    clearHighlightTimer();
  }, [story]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      isCancelledRef.current = true;
      window.speechSynthesis.cancel();
      if (!hasSavedRef.current && startTimeRef.current) {
        hasSavedRef.current = true;
        handleSaveProgress(false);
      }
    };
  }, []);

  const clearHighlightTimer = () => {
    if (highlightTimerRef.current) {
      clearInterval(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
  };

  const buildWordPositions = (inputText) => {
    const matches = [...inputText.matchAll(/\S+/g)];
    const positions = matches.map((match) => ({
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
    }));

    wordPositionsRef.current = positions;
    setWords(positions.map((item) => item.word));
  };

  const estimateWordDuration = () => {
    const base = 380;
    return Math.max(120, Math.round(base / speed));
  };

  const startFallbackHighlight = () => {
    clearHighlightTimer();

    const positions = wordPositionsRef.current;
    if (!positions.length) return;

    if (currentIndexRef.current < 0) {
      currentIndexRef.current = 0;
      setIndex(0);
    }

    const stepMs = estimateWordDuration();

    highlightTimerRef.current = setInterval(() => {
      currentIndexRef.current += 1;

      if (currentIndexRef.current >= positions.length) {
        clearHighlightTimer();
        return;
      }

      setIndex(currentIndexRef.current);
    }, stepMs);
  };

  const getBestVoice = () => {
    if (!voices.length) return null;

    return (
      voices.find((v) => v.name.includes("Google US English")) ||
      voices.find((v) => v.name.includes("Google UK English Female")) ||
      voices.find((v) => v.name.includes("Google")) ||
      voices.find((v) => v.lang === "en-US") ||
      voices.find((v) => v.lang.startsWith("en")) ||
      null
    );
  };

  const handleSaveProgress = async (completedStatus = false) => {
    try {
      const userId = user?._id;

      if (!userId || !token) {
        setSaveMessage("Please login to save progress.");
        return;
      }

      // ONLY completed stories count. Ignore custom, incomplete, or missing storyId
      if (!story?._id || !completedStatus) {
        return;
      }

      const endTime = Date.now();
      const readingTime = startTimeRef.current
        ? Math.max(1, Math.round((endTime - startTimeRef.current) / 1000))
        : 1;

      console.log("Age Group:", user?.ageGroup);
      console.log("Reading Time Recorded:", readingTime);

      const ageGroupStr = String(user?.ageGroup).toLowerCase();
      const isAgeGroup34 = ageGroupStr === "3" || ageGroupStr === "4" || ageGroupStr === "intermediate" || ageGroupStr === "advanced";

      if (isAgeGroup34) {
        fetch("http://localhost:5000/api/child-progress/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            storyId: story?._id || null,
            storyTitle: story?.title || "Custom Reading",
            readingTime,
            completed: completedStatus,
            score: completedStatus ? 100 : 0,
            activityType: "story_explorer", 
            contentSource: story?._id ? "story" : "custom",
            date: new Date(),
          }),
        }).catch(err => console.error("Child progress save error:", err));
      }

      const response = await fetch("http://localhost:5000/api/progress/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          storyId: story?._id || null,
          storyTitle: story?.title || "Custom Reading",
          readingTime,
          completed: completedStatus,
          score: completedStatus ? 100 : 0,
          activityType: "reader",
          contentSource: story?._id ? "story" : "custom",
          date: new Date(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(data.message || "Failed to save progress");
      }

      setSaveMessage(
        completedStatus ? "✅ Story completed and saved" : "📘 Session saved"
      );
    } catch (error) {
      console.error("Save error:", error);
      setSaveMessage(`❌ ${error.message || "Failed to save progress"}`);
    }
  };

  const startReading = () => {
    if (!text.trim()) {
      alert("Please enter text or select a story.");
      return;
    }

    isCancelledRef.current = true;
    window.speechSynthesis.cancel();
    clearHighlightTimer();

    setTimeout(() => {
      hasSavedRef.current = false;
      isCancelledRef.current = false;
      startTimeRef.current = Date.now();
      currentIndexRef.current = -1;

      buildWordPositions(text);

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      utterance.rate = Number(speed);
      utterance.pitch = 1;
      utterance.volume = 1;

      const selectedVoice = getBestVoice();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = "en-US";
      }

      let boundaryWorked = false;

      utterance.onstart = () => {
        setIndex(0);
        currentIndexRef.current = 0;

        setTimeout(() => {
          if (!boundaryWorked) {
            startFallbackHighlight();
          }
        }, 400);
      };

      utterance.onboundary = (event) => {
        if (typeof event.charIndex !== "number") return;

        boundaryWorked = true;
        clearHighlightTimer();

        const charIndex = event.charIndex;
        const positions = wordPositionsRef.current;

        for (let i = 0; i < positions.length; i++) {
          if (charIndex >= positions[i].start && charIndex < positions[i].end) {
            currentIndexRef.current = i;
            setIndex(i);
            break;
          }
        }
      };

      utterance.onpause = () => {
        clearHighlightTimer();
      };

      utterance.onresume = () => {
        setTimeout(() => {
          if (!boundaryWorked) {
            startFallbackHighlight();
          }
        }, 150);
      };

      utterance.onend = async () => {
        clearHighlightTimer();
        setIndex(-1);

        if (!hasSavedRef.current) {
          hasSavedRef.current = true;
          await handleSaveProgress(!isCancelledRef.current);
        }
      };

      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const pauseReading = () => {
    window.speechSynthesis.pause();
    clearHighlightTimer();
  };

  const resumeReading = () => {
    window.speechSynthesis.resume();

    if (!highlightTimerRef.current && index >= 0) {
      startFallbackHighlight();
    }
  };

  const stopReading = async () => {
    isCancelledRef.current = true;
    window.speechSynthesis.cancel();
    clearHighlightTimer();
    setIndex(-1);

    if (!hasSavedRef.current) {
      hasSavedRef.current = true;
      await handleSaveProgress(false);
    }
  };

  const clearText = async () => {
    window.speechSynthesis.cancel();
    clearHighlightTimer();
    setIndex(-1);
    setSaveMessage("");
    currentIndexRef.current = -1;

    if (!hasSavedRef.current && startTimeRef.current) {
      hasSavedRef.current = true;
      await handleSaveProgress(false);
    }

    if (story?.content) {
      setText(story.content);
      setWords(story.content.match(/\S+/g) || []);
    } else {
      setText("");
      setWords([]);
    }

    wordPositionsRef.current = [];
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-24 px-6 lg:px-10 pb-10">


        <p className="text-sm uppercase tracking-wide text-teal-600 font-semibold mb-2">
          Reading tool
        </p>

        <h1 className="text-4xl font-bold mb-6 text-gray-900">
          AI Reading Assistant
        </h1>

        {saveMessage && (
          <div className="mb-6 bg-teal-50 border border-teal-100 text-teal-700 p-4 rounded-xl">
            {saveMessage}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
          <label className="block text-lg font-semibold mb-3">
            Reading Content
          </label>

          <textarea
            className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-teal-300"
            rows="6"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your reading content here..."
          />

          <div>
            <label className="font-semibold text-gray-700">
              Speed: {speed}
            </label>

            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full mt-2"
            />
          </div>
          <div className="mt-4">
  <label className="font-semibold text-gray-700">
    Font Size: {fontSize}px
  </label>

  <input
    type="range"
    min="16"
    max="50"
    step="2"
    value={fontSize}
    onChange={(e) => setFontSize(Number(e.target.value))}
    className="w-full mt-2"
  />
</div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={startReading}
            className="bg-teal-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
          >
            Start
          </button>

          <button
            onClick={pauseReading}
            className="bg-yellow-500 text-white px-5 py-2 rounded-lg font-semibold"
          >
            Pause
          </button>

          <button
            onClick={resumeReading}
            className="bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold"
          >
            Resume
          </button>

          <button
            onClick={stopReading}
            className="bg-red-500 text-white px-5 py-2 rounded-lg font-semibold"
          >
            Stop
          </button>

          <button
            onClick={clearText}
            className="bg-gray-500 text-white px-5 py-2 rounded-lg font-semibold"
          >
            Clear
          </button>
        </div>

<div
  className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm min-h-[80px] overflow-hidden break-words"
  style={{
    fontSize: `${fontSize}px`,
    lineHeight: `${fontSize * 1.8}px`,
  }}
>
          {words.length === 0 ? (
            <p className="text-gray-400">Highlighted words will appear here...</p>
          ) : (
            words.map((word, i) => (
            <span
  key={i}
  className={`inline-block mr-2 mb-2 px-2 py-1 rounded-lg break-words transition ${
    i === index
      ? "bg-yellow-300 text-gray-900"
      : ""
  }`}
>
  {word}
</span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}