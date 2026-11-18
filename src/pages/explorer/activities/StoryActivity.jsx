import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, PlayCircle, Star, Pause, Play, RotateCcw, Turtle, Rabbit, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";

// ─── Age Group 1 (Explorer) Story Reading ────────────────────────────────────
// ISOLATED: Do NOT import or reuse logic from Age Groups 2, 3, or 4.

export default function ChildrensStoryLibrary() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stories, setStories]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [view, setView]                     = useState("library"); // 'library' | 'reader' | 'complete'
  const [selectedStory, setSelectedStory]   = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [readingSeconds, setReadingSeconds] = useState(0); // accumulated seconds spent reading

  // Fetch stories on mount
  useEffect(() => {
    async function fetchStories() {
      try {
        console.log("[Explorer Story] Story loaded — fetching from API");
        const res = await fetch("http://localhost:5000/api/stories");
        if (!res.ok) throw new Error("Failed to fetch stories");
        const data = await res.json();
        const arr = Array.isArray(data) ? data : Array.isArray(data.stories) ? data.stories : [];
        setStories(arr);
        console.log(`[Explorer Story] ${arr.length} stories loaded`);
      } catch (err) {
        console.error("[Explorer Story] Error fetching stories:", err);
        setError("Oops! We couldn't load the stories right now.");
      } finally {
        setLoading(false);
      }
    }
    fetchStories();
  }, []);

  const categories      = ["All", ...new Set(stories.map(s => s.category).filter(Boolean))];
  const filteredStories = selectedCategory === "All" ? stories : stories.filter(s => s.category === selectedCategory);

  const getCategoryEmoji = (category) => {
    const cats = {
      "Animal Stories":    "🐰",
      "Fairy Tales":       "🧚",
      "Nature Stories":    "🌳",
      "Friendship Stories":"🤝",
      "Learning Stories":  "📚",
      "Popular Stories":   "⭐",
    };
    return cats[category] || "📖";
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Animal Stories":    "bg-orange-100 text-orange-600 border-orange-200",
      "Fairy Tales":       "bg-pink-100 text-pink-600 border-pink-200",
      "Nature Stories":    "bg-green-100 text-green-600 border-green-200",
      "Friendship Stories":"bg-blue-100 text-blue-600 border-blue-200",
      "Learning Stories":  "bg-purple-100 text-purple-600 border-purple-200",
      "Popular Stories":   "bg-yellow-100 text-yellow-600 border-yellow-200",
    };
    return colors[category] || "bg-indigo-100 text-indigo-600 border-indigo-200";
  };

  const startStory = (story) => {
    setReadingSeconds(0);
    setSelectedStory(story);
    setView("reader");
    console.log(`[Explorer Story] Story reading started — "${story.title}"`);
  };

  const handleComplete = (extraSeconds = 0) => {
    setReadingSeconds(s => s + extraSeconds);
    setView("complete");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100">
      <AnimatePresence mode="wait">
        {view === "library" && (
          <LibraryView
            key="library"
            stories={filteredStories}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            getCategoryEmoji={getCategoryEmoji}
            getCategoryColor={getCategoryColor}
            onSelectStory={startStory}
            navigate={navigate}
            loading={loading}
            error={error}
          />
        )}
        {view === "reader" && selectedStory && (
          <ReaderView
            key="reader"
            story={selectedStory}
            onBack={() => setView("library")}
            onComplete={handleComplete}
            onTimeUpdate={(secs) => setReadingSeconds(s => s + secs)}
          />
        )}
        {view === "complete" && selectedStory && (
          <CompleteView
            key="complete"
            story={selectedStory}
            readingSeconds={readingSeconds}
            onBackToLibrary={() => setView("library")}
            userId={user?._id}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Library View ─────────────────────────────────────────────────────────────
function LibraryView({ stories, categories, selectedCategory, setSelectedCategory, getCategoryEmoji, getCategoryColor, onSelectStory, navigate, loading, error }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate("/explorer")} className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition bg-indigo-50 px-4 py-2 rounded-full">
          <ArrowLeft size={20} /> Back to Hub
        </button>
      </div>

      <div className="text-center mb-12">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="inline-block mb-4">
          <span className="text-7xl drop-shadow-lg">📚</span>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-indigo-900 mb-4 tracking-tight">Story Reading Adventure</h1>
        <p className="text-xl font-bold text-indigo-400">Welcome Explorer! Choose a story and start reading.</p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-sm border-2 ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                : "bg-white text-gray-600 border-gray-100 hover:border-indigo-200"
            }`}
          >
            {getCategoryEmoji(cat)} {cat}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-20 text-2xl font-bold text-indigo-300 animate-pulse">Loading amazing stories...</div>}
      {error   && <div className="text-center py-20 text-xl font-bold text-red-500 bg-red-50 rounded-3xl border border-red-100">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <motion.div
              key={story._id}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white rounded-[2rem] p-6 shadow-lg shadow-indigo-100/50 border border-indigo-50 flex flex-col h-full relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 ${getCategoryColor(story.category).split(' ')[0]}`}></div>

              <div className="flex items-center gap-3 mb-4 relative z-10">
                <span className="text-4xl bg-gray-50 w-16 h-16 flex items-center justify-center rounded-2xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                  {getCategoryEmoji(story.category)}
                </span>
                <div>
                  <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${getCategoryColor(story.category)}`}>
                    {story.category || "Story"}
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-black text-gray-800 mb-3 leading-tight relative z-10">{story.title}</h2>
              <p className="text-gray-500 font-medium mb-6 line-clamp-2 relative z-10">{story.summary || "A wonderful adventure awaits you!"}</p>

              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2 text-indigo-400 font-bold">
                  <Clock size={18} /> {story.estimatedReadingTime || 5} min
                </div>
                <button
                  onClick={() => onSelectStory(story)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-md hover:shadow-lg"
                >
                  Read <PlayCircle size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {!loading && !error && stories.length === 0 && (
        <div className="text-center py-20 text-xl font-bold text-gray-400">No stories found in this category.</div>
      )}
    </motion.div>
  );
}

// ─── Reader View ──────────────────────────────────────────────────────────────
// FIX: Uses a ref (isPlayingRef) alongside state so the speechSynthesis onend
// callback always reads the *current* play state, avoiding the stale-closure
// bug that caused reading to stop mid-story.
function ReaderView({ story, onBack, onComplete }) {
  const [isPlaying, setIsPlaying]           = useState(false);
  const [speed, setSpeed]                   = useState(0.8);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(-1);
  const [progress, setProgress]             = useState(0); // 0–100

  // Refs — survive re-renders without causing stale closures
  const synthRef         = useRef(window.speechSynthesis);
  const isPlayingRef     = useRef(false);   // ← KEY FIX: always up-to-date
  const currentIdxRef    = useRef(-1);
  const startTimeRef     = useRef(null);
  const hasSavedRef      = useRef(false);

  // Split full content into sentences
  const sentences = story.content
    ? story.content.match(/[^.!?]+[.!?]+/g) || [story.content]
    : [];
  const totalSentences = sentences.length;

  // Keep ref in sync with state
  const setPlayState = (val) => {
    isPlayingRef.current = val;
    setIsPlaying(val);
  };

  const stopReading = useCallback(() => {
    synthRef.current?.cancel();
    setPlayState(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { synthRef.current?.cancel(); };
  }, []);

  // ── Core sequential reading engine ──────────────────────────────────────────
  const playSentence = useCallback((idx) => {
    // Reached the end of the story
    if (idx >= totalSentences) {
      setPlayState(false);
      currentIdxRef.current = totalSentences; // past last
      setCurrentSentenceIdx(totalSentences);
      setProgress(100);
      console.log("[Explorer Story] Story reading completed — all sentences read");
      // Trigger completion (save + complete view)
      if (!hasSavedRef.current) {
        hasSavedRef.current = true;
        const elapsed = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
        onComplete(elapsed);
      }
      return;
    }

    synthRef.current?.cancel();

    currentIdxRef.current = idx;
    setCurrentSentenceIdx(idx);
    setProgress(Math.round((idx / totalSentences) * 100));

    const text      = sentences[idx].trim();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate  = speed;
    utterance.pitch = 1.1;
    utterance.lang  = "en-US";

    utterance.onend = () => {
      // Use ref — not stale state — to decide whether to continue
      if (isPlayingRef.current) {
        playSentence(currentIdxRef.current + 1);
      }
    };

    utterance.onerror = (e) => {
      // Ignore "interrupted" errors caused by cancel() calls; re-throw others
      if (e.error !== "interrupted") {
        console.warn("[Explorer Story] Speech error:", e.error);
        setPlayState(false);
      }
    };

    setPlayState(true);
    synthRef.current.speak(utterance);
  }, [sentences, speed, totalSentences, onComplete]);

  const togglePlayPause = () => {
    if (isPlayingRef.current) {
      stopReading();
    } else {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      const startIdx = currentIdxRef.current < 0 ? 0 : currentIdxRef.current;
      playSentence(startIdx);
    }
  };

  const repeatSentence = () => {
    const idx = currentIdxRef.current < 0 ? 0 : currentIdxRef.current;
    if (!startTimeRef.current) startTimeRef.current = Date.now();
    playSentence(idx);
  };

  const changeSpeed = (newSpeed) => {
    setSpeed(newSpeed);
    if (isPlayingRef.current) {
      const idx = currentIdxRef.current;
      stopReading();
      setTimeout(() => playSentence(idx), 80);
    }
  };

  const handleFinishButton = () => {
    stopReading();
    if (!hasSavedRef.current) {
      hasSavedRef.current = true;
      const elapsed = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
      console.log("[Explorer Story] Story finished via Finish button");
      onComplete(elapsed);
    }
  };

  const pctDone = progress;

  return (
    <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="min-h-screen bg-indigo-50 flex flex-col">
      {/* Navbar */}
      <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <button onClick={() => { stopReading(); onBack(); }} className="flex items-center gap-2 text-indigo-500 font-bold bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 transition">
          <ArrowLeft size={20} /> Library
        </button>
        <div className="hidden md:flex flex-col items-center">
          <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-100 text-indigo-600">{story.category}</span>
          {pctDone > 0 && (
            <div className="mt-1 text-xs font-bold text-indigo-400">{pctDone}% read</div>
          )}
        </div>
        <button onClick={handleFinishButton} className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-6 py-2 rounded-full hover:bg-green-100 transition border border-green-200">
          Finish Story <CheckCircle size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 gap-8 relative">

        {/* Main Reading Area */}
        <div className="flex-1 bg-white rounded-[3rem] shadow-xl p-8 md:p-16 relative overflow-y-auto mb-32 lg:mb-0">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-12 text-center leading-tight">{story.title}</h1>

          <div className="text-2xl md:text-3xl lg:text-4xl leading-[2.5] md:leading-[2.5] text-gray-700 font-medium max-w-4xl mx-auto">
            {sentences.map((sentence, idx) => (
              <span
                key={idx}
                onClick={() => {
                  if (!startTimeRef.current) startTimeRef.current = Date.now();
                  stopReading();
                  setTimeout(() => playSentence(idx), 80);
                }}
                className={`transition-colors duration-200 cursor-pointer rounded-lg px-1 ${
                  currentSentenceIdx === idx
                    ? "bg-yellow-200 text-gray-900 font-bold shadow-sm"
                    : idx < currentSentenceIdx
                    ? "text-indigo-400"
                    : "hover:bg-gray-100"
                }`}
              >
                {sentence}{" "}
              </span>
            ))}
          </div>
        </div>

        {/* Floating AI Reading Buddy */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:sticky lg:top-24 lg:translate-x-0 w-11/12 lg:w-80 bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl border-4 border-indigo-100 shrink-0 h-fit z-50">
          <div className="flex flex-col items-center">
            <motion.div animate={{ y: isPlaying ? [0, -10, 0] : 0 }} transition={{ repeat: Infinity, duration: 1 }} className="text-6xl mb-4 drop-shadow-md">
              🤖
            </motion.div>
            <h3 className="text-xl font-black text-indigo-900 mb-2">Reading Buddy</h3>
            {isPlaying && (
              <p className="text-xs font-bold text-indigo-400 mb-4 text-center animate-pulse">
                Reading sentence {currentSentenceIdx + 1} of {totalSentences}
              </p>
            )}

            {/* Progress bar */}
            <div className="w-full bg-indigo-50 rounded-full h-2 mb-6">
              <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pctDone}%` }}></div>
            </div>

            <div className="flex items-center justify-center gap-4 w-full mb-6">
              <button
                onClick={repeatSentence}
                className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-100 transition"
                title="Repeat Sentence"
              >
                <RotateCcw size={20} />
              </button>

              <button
                onClick={togglePlayPause}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transform transition hover:scale-105 ${
                  isPlaying ? "bg-red-500 shadow-red-200" : "bg-indigo-500 shadow-indigo-200"
                }`}
              >
                {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-2" />}
              </button>
            </div>

            <div className="w-full bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider text-center mb-3">Reading Speed</p>
              <div className="flex justify-between gap-2">
                <SpeedBtn icon={<Turtle size={18} />} label="Slow"   active={speed === 0.6} onClick={() => changeSpeed(0.6)} />
                <SpeedBtn icon={<BookOpen size={18} />} label="Normal" active={speed === 0.8} onClick={() => changeSpeed(0.8)} />
                <SpeedBtn icon={<Rabbit size={18} />} label="Fast"   active={speed === 1.1} onClick={() => changeSpeed(1.1)} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

// ─── Speed Button ─────────────────────────────────────────────────────────────
function SpeedBtn({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition ${
        active ? "bg-indigo-500 text-white shadow-md" : "bg-white text-gray-500 hover:bg-indigo-100"
      }`}
    >
      {icon}
      <span className="text-[10px] font-bold mt-1">{label}</span>
    </button>
  );
}

// ─── Complete View ────────────────────────────────────────────────────────────
// Saves progress to /api/child-progress/save using userId + storyId as the
// unique key (duplicate prevention: frontend ref guard + backend upsert).
function CompleteView({ story, readingSeconds, onBackToLibrary, userId }) {
  const [saving, setSaving]     = useState(true);
  const [saveError, setSaveError] = useState(false);
  // Internal ref guard: prevents double-save even in React Strict Mode
  const hasSavedRef = useRef(false);

  useEffect(() => {
    // IMPORTANT: empty deps [] — run ONCE on mount only.
    // readingSeconds is captured from the closure at mount time.
    // Do NOT add readingSeconds to deps — that would re-fire the save
    // every time the parent updates readingSeconds state, causing duplicates.
    async function saveProgress() {
      if (hasSavedRef.current) {
        console.log("[Explorer Story] Save already in progress — skipping duplicate");
        return;
      }
      hasSavedRef.current = true;

      if (!userId) {
        console.warn("[Explorer Story] No userId — skipping save");
        setSaving(false);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const payload = {
          userId,
          activityType:  "story_reading",
          storyId:       story._id,
          storyTitle:    story.title,
          storyCategory: story.category,
          readingTime:   readingSeconds || (story.estimatedReadingTime || 5) * 60,
          completed:     true,
          completedAt:   new Date().toISOString(),
        };
        console.log("[Explorer Story] Saving story progress — payload:", payload);

        const res = await fetch("http://localhost:5000/api/child-progress/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Save failed: ${res.status}`);
        console.log("[Explorer Story] Story progress saved successfully ✓");
      } catch (err) {
        console.error("[Explorer Story] Failed to save story progress:", err);
        hasSavedRef.current = false; // allow retry on error
        setSaveError(true);
      } finally {
        setSaving(false);
      }
    }
    saveProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← [] intentional: save exactly once when CompleteView mounts

  const celebrations = [
    { emoji: "📚", line: "Story Completed!" },
    { emoji: "🌟", line: "Wonderful Reading!" },
    { emoji: "🎉", line: "Great Job Explorer!" },
    { emoji: "⭐", line: `You Finished "${story.title}"!` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6"
    >
      <div className="bg-white max-w-xl w-full rounded-[3rem] shadow-2xl p-10 text-center border-8 border-indigo-100 relative overflow-hidden">

        {/* Confetti-like decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {["🎊","⭐","🌟","✨","🎈"].map((e, i) => (
            <motion.span
              key={i}
              className="absolute text-3xl"
              style={{ left: `${10 + i * 18}%`, top: "-10%" }}
              animate={{ y: ["0%", "110%"], rotate: [0, 360], opacity: [1, 0] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
            >
              {e}
            </motion.span>
          ))}
        </div>

        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-8xl mb-6 relative z-10"
        >
          🎉
        </motion.div>

        <div className="space-y-2 mb-8 relative z-10">
          {celebrations.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center justify-center gap-2"
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className={`font-black ${i === 0 ? "text-3xl text-indigo-900" : "text-xl text-indigo-600"}`}>{c.line}</span>
            </motion.div>
          ))}
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-8 relative z-10">
          <p className="text-gray-500 font-bold mb-1 text-sm uppercase tracking-wider">You finished</p>
          <p className="text-2xl font-black text-indigo-800 flex items-center justify-center gap-2">
            <Star className="text-yellow-400 fill-yellow-400" /> {story.title} <Star className="text-yellow-400 fill-yellow-400" />
          </p>
          {readingSeconds > 0 && (
            <p className="text-sm text-indigo-400 font-bold mt-2">
              Reading time: {Math.round(readingSeconds / 60)} min {readingSeconds % 60}s
            </p>
          )}
        </div>

        {saveError && (
          <p className="text-red-400 text-sm font-bold mb-4 relative z-10">⚠️ Progress could not be saved. Check your connection.</p>
        )}

        <button
          onClick={onBackToLibrary}
          disabled={saving}
          className={`w-full py-4 rounded-full font-black text-xl transition shadow-lg relative z-10 ${
            saving
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-indigo-500 hover:bg-indigo-600 text-white transform hover:scale-105"
          }`}
        >
          {saving ? "Saving Progress... 💾" : "Back to Library 📚"}
        </button>
      </div>
    </motion.div>
  );
}
