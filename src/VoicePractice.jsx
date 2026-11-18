import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

export default function VoicePractice() {
  const navigate = useNavigate();
  const location = useLocation();

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const hasSavedRef = useRef(false);
  const startTimeRef = useRef(null);

  const selectedStory = location.state?.story || null;

  const { user, token } = useAuth();

  const [passage, setPassage] = useState("");
  const [spokenText, setSpokenText] = useState("");

  const [matchedWords, setMatchedWords] = useState([]);
  const [wrongWords, setWrongWords] = useState([]);

  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [score, setScore] = useState(null);
  const [browserMessage, setBrowserMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const words = useMemo(() => passage.split(/\s+/).filter(Boolean), [passage]);

  useEffect(() => {
    if (selectedStory?.content) {
      setPassage(selectedStory.content);
    } else {
      setPassage("");
    }

    setSpokenText("");
    setMatchedWords([]);
    setWrongWords([]);
    setCurrentWordIndex(-1);
    setScore(null);
    setSaveMessage("");
    setBrowserMessage("");

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (!hasSavedRef.current && startTimeRef.current) {
        const readingTime = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
        hasSavedRef.current = true;
        saveProgressToDB({ finalScore: score || 0 }, readingTime);
      }
    };
  }, [selectedStory]);

  const normalizeWord = (word) =>
    word.toLowerCase().replace(/[.,!?;:'"()]/g, "").trim();

  const levenshteinDistance = (a, b) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            Math.min(
              matrix[i][j - 1] + 1, // insertion
              matrix[i - 1][j] + 1 // deletion
            )
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  const isSimilar = (a, b) => {
    if (a === b) return true;
    if (!a || !b) return false;

    if (a.length > 3 && b.length > 3) {
      if (a === b + "s" || b === a + "s") return true;
      if (a === b + "ed" || b === a + "ed") return true;
      if (a === b + "ing" || b === a + "ing") return true;
      if (a === b + "d" || b === a + "d") return true;
      if (a === b + "es" || b === a + "es") return true;
    }

    const lenDiff = Math.abs(a.length - b.length);
    if (lenDiff > 2) return false;
    if (lenDiff > 1 && Math.min(a.length, b.length) < 4) return false;

    const distance = levenshteinDistance(a, b);
    const maxMistakes = Math.min(a.length, b.length) <= 4 ? 1 : 2;
    return distance <= maxMistakes;
  };

  const trackProgress = (transcript) => {
    const spokenWords = transcript.split(/\s+/).map(normalizeWord).filter(Boolean);
    // Crucial fix: do NOT filter Boolean here, so that targetWords indexes match `words` perfectly
    const targetWords = words.map(normalizeWord);

    let matchedIndexes = [];
    let targetIndex = 0;
    let lastMatchedTargetIndex = -1;

    for (let s = 0; s < spokenWords.length; s++) {
      const spoken = spokenWords[s];

      let windowSize = 5;
      let skippedEmpty = [];
      let foundMatch = false;

      for (let t = targetIndex; t < targetWords.length && t < targetIndex + windowSize; t++) {
        if (!targetWords[t]) {
          skippedEmpty.push(t);
          windowSize++; // Extend window since this is a punctuation-only word
          continue;
        }

        if (targetWords[t] === spoken || isSimilar(targetWords[t], spoken)) {
          matchedIndexes.push(...skippedEmpty, t);
          lastMatchedTargetIndex = t;
          targetIndex = t + 1;
          foundMatch = true;
          break;
        }
      }
    }

    setMatchedWords(matchedIndexes);

    let nextWordIdx = lastMatchedTargetIndex + 1;
    while (nextWordIdx < targetWords.length && !targetWords[nextWordIdx]) {
      nextWordIdx++;
    }

    if (nextWordIdx < targetWords.length) {
      setCurrentWordIndex(nextWordIdx);
    } else {
      setCurrentWordIndex(-1);
    }
  };

  const calculateFinalScore = (transcript) => {
    const spokenWords = transcript.split(/\s+/).map(normalizeWord).filter(Boolean);
    const targetWords = words.map(normalizeWord);

    let matchedIndexes = [];
    let targetIndex = 0;

    for (let s = 0; s < spokenWords.length; s++) {
      const spoken = spokenWords[s];

      let windowSize = 5;
      let skippedEmpty = [];

      for (let t = targetIndex; t < targetWords.length && t < targetIndex + windowSize; t++) {
        if (!targetWords[t]) {
          skippedEmpty.push(t);
          windowSize++;
          continue;
        }

        if (targetWords[t] === spoken || isSimilar(targetWords[t], spoken)) {
          matchedIndexes.push(...skippedEmpty, t);
          targetIndex = t + 1;
          break;
        }
      }
    }

    const wrongIndexes = [];
    let correctCount = 0;
    let totalScorable = 0;

    for (let i = 0; i < targetWords.length; i++) {
      if (targetWords[i]) {
        totalScorable++;
        if (!matchedIndexes.includes(i)) {
          wrongIndexes.push(i);
        } else {
          correctCount++;
        }
      }
    }

    const finalScore = totalScorable > 0 ? Math.round((correctCount / totalScorable) * 100) : 0;

    setMatchedWords(matchedIndexes);
    setWrongWords(wrongIndexes);
    setCurrentWordIndex(-1);
    setScore(finalScore);

    return {
      finalScore,
      correctWords: correctCount,
      totalWords: totalScorable,
      matchedWords: matchedIndexes,
      wrongWords: wrongIndexes,
    };
  };

  const saveProgressToDB = async (result, readingTime) => {
    // ONLY completed stories count. Ignore custom, incomplete, or missing storyId
    if (!selectedStory?._id) {
      return;
    }
    try {
      const userId = user?._id || user?.id;

      if (!userId || !token) {
        setSaveMessage("Login required to save progress.");
        return;
      }

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
            storyId: selectedStory?._id || null,
            storyTitle: selectedStory?.title || "Voice Practice",
            readingTime,
            score: result.finalScore,
            completed: true,
            activityType: "story_explorer", // Maps to storyExplorerTotalTime in summary
            contentSource: selectedStory?._id ? "story" : "custom",
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
          storyId: selectedStory?._id || null,
          storyTitle: selectedStory?.title || "Voice Practice",
          readingTime,
          score: result.finalScore,
          completed: true,
          activityType: "voice-practice",
          contentSource: selectedStory?._id ? "story" : "custom",
          date: new Date(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save progress");
      }

      setSaveMessage("Progress saved successfully.");
    } catch (error) {
      console.error(error);
      setSaveMessage(error.message || "Server error while saving progress.");
    }
  };

  const startReading = () => {
    if (!passage.trim()) {
      setBrowserMessage("Please enter some content first.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setBrowserMessage("Please use Google Chrome or Microsoft Edge.");
      return;
    }

    setBrowserMessage("");
    setSaveMessage("");
    setSpokenText("");
    setMatchedWords([]);
    setWrongWords([]); // Clear red words before starting
    setCurrentWordIndex(0);
    setScore(null);

    finalTranscriptRef.current = "";
    hasSavedRef.current = false;
    startTimeRef.current = Date.now();

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;
    setIsListening(true);

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }

      transcript = transcript.trim();
      finalTranscriptRef.current = transcript;
      setSpokenText(transcript);

      trackProgress(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setBrowserMessage("Voice recognition error. Please try again in Chrome.");
    };

    recognition.onend = async () => {
      setIsListening(false);

      const finalTranscript = finalTranscriptRef.current.trim();

      if (finalTranscript && !hasSavedRef.current) {
        const result = calculateFinalScore(finalTranscript);

        const readingTime = Math.max(
          1,
          Math.round((Date.now() - startTimeRef.current) / 1000)
        );

        hasSavedRef.current = true;
        await saveProgressToDB(result, readingTime);
      }
    };

    recognition.start();
  };

  const stopReading = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      <Navbar />

      <div className="pt-24 px-6 lg:px-10 pb-10 max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-wide text-teal-600 font-semibold mb-2">
            Voice practice
          </p>
          <h1 className="text-4xl font-bold mb-4">Read and Get Score</h1>
          <p className="text-gray-600 text-lg">
            Type or paste your own content, then speak it aloud. Correct words
            will be highlighted and your progress will be saved.
          </p>
        </div>

        {browserMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {browserMessage}
          </div>
        )}

        {saveMessage && (
          <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-teal-700">
            {saveMessage}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
          <label className="block text-xl font-semibold mb-3 text-gray-800">
            Enter Your Own Content
          </label>

          <textarea
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
            rows={5}
            placeholder="Type or paste your reading content here..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-8 leading-10 text-2xl flex flex-wrap gap-x-2 gap-y-3">
          {words.map((word, index) => {
            const isMatched = matchedWords.includes(index);
            const isWrong = wrongWords.includes(index);
            const isCurrent = currentWordIndex === index && isListening;

            return (
              <span
                key={index}
                className={`px-2 py-1 rounded-lg transition-colors duration-200 ${isMatched
                  ? "bg-green-200 text-green-900"
                  : isWrong
                    ? "bg-red-200 text-red-900"
                    : isCurrent
                      ? "bg-yellow-200 text-gray-900"
                      : ""
                  }`}
              >
                {word}
              </span>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={startReading}
            disabled={isListening}
            className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition disabled:opacity-50"
          >
            Start Reading
          </button>

          <button
            onClick={stopReading}
            disabled={!isListening}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition disabled:opacity-50"
          >
            Stop Reading
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-semibold mb-2">Spoken Text</h3>
          <p className="text-gray-700 min-h-[1.5rem]">
            {spokenText || "Your speech will appear here..."}
          </p>
        </div>

        {score !== null && (
          <div className="bg-yellow-100 border border-yellow-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-2xl font-bold mb-2">Reading Score</h3>
            <p className="text-3xl font-bold text-teal-700 mb-2">{score}%</p>
            <p className="text-gray-700">
              {score >= 80
                ? "Excellent reading!"
                : score >= 50
                  ? "Good job! Keep practicing."
                  : "Nice try. Practice again to improve your score."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}