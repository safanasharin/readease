import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Search, Filter, PlayCircle, StopCircle, ArrowLeft, Brain, BookOpen, Volume2, VolumeX, Mic, RefreshCw, ChevronRight, ChevronLeft, CheckCircle, Star } from "lucide-react";
import { motion } from "framer-motion";

const getActivitySupportLabel = (level) => {
  if (level === 1 || level === "Easy" || level === "1") return "Mild Support";
  if (level === 2 || level === "Medium" || level === "2") return "Moderate Support";
  if (level === 3 || level === "Hard" || level === "3") return "Severe Support";
  return "Mild Support";
};

// --- Helper: Levenshtein Distance for Fuzzy Matching ---
function levenshtein(a, b) {
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
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function isFuzzyMatch(target, spoken) {
  const distance = levenshtein(target, spoken);
  const maxLength = Math.max(target.length, spoken.length);
  const similarity = (maxLength - distance) / maxLength;
  return similarity >= 0.8;
}

export default function StoryExplorer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // App State
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("LIST"); // LIST, READ, PRACTICE, RESULT
  const [currentStory, setCurrentStory] = useState(null);
  const [pages, setPages] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  
  // TTS State
  const [autoRead, setAutoRead] = useState(false);
  const synth = window.speechSynthesis;
  
  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const recognitionRef = useRef(null);
  
  // Library State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Stories");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch Stories
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/stories?level=Easy&limit=50");
        if (res.ok) {
          const data = await res.json();
          setStories(data.stories || []);
        }
      } catch (err) {
        console.error("Failed to fetch stories", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }
    
    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;
    }

    const recognition = recognitionRef.current;
    let silenceTimer = null;
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      let completeTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        completeTranscript += event.results[i][0].transcript + " ";
      }
      setTranscript(completeTranscript.trim());
      
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        try { recognition.stop(); } catch(e) {}
      }, 3000);
    };
    
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setSpeechSupported(false);
      }
      setIsListening(false);
    };
    
    recognition.onend = () => setIsListening(false);
    
    return () => {
      try { recognition.stop(); } catch(e) {}
      if (synth.speaking) synth.cancel();
      if (silenceTimer) clearTimeout(silenceTimer);
    };
  }, [synth]);

  // Handle Assessment Completion
  useEffect(() => {
    if (view === "PRACTICE" && !isListening && transcript.length > 0 && startTime) {
      finalizeAssessment();
    }
  }, [isListening, view]);

  // Handle Auto Read
  useEffect(() => {
    if (view === "READ" && autoRead && pages.length > 0) {
      playTTS();
    } else {
      if (synth.speaking) synth.cancel();
    }
  }, [pageIndex, view, autoRead, pages]);

  const selectStory = (story) => {
    // Chunk content into pages (~3 sentences per page)
    const sentences = story.content.match(/[^.!?]+[.!?]+/g) || [story.content];
    let chunkedPages = [];
    for (let i = 0; i < sentences.length; i += 3) {
      chunkedPages.push(sentences.slice(i, i + 3).join(" ").trim());
    }
    
    setCurrentStory(story);
    setPages(chunkedPages);
    
    // Check for saved progress
    const saved = localStorage.getItem(`storyExplorer_${user?._id}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.storyId === story._id && parsed.pageIndex < chunkedPages.length) {
        setPageIndex(parsed.pageIndex);
        setView("READ");
        return;
      }
    }
    
    setPageIndex(0);
    setView("READ");
  };

  const saveLocalProgress = (idx) => {
    if (user && currentStory) {
      localStorage.setItem(`storyExplorer_${user._id}`, JSON.stringify({
        storyId: currentStory._id,
        pageIndex: idx
      }));
    }
  };

  const playTTS = () => {
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(pages[pageIndex]);
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    synth.speak(utterance);
  };

  const startPractice = () => {
    if (synth.speaking) synth.cancel();
    setView("PRACTICE");
    setTranscript("");
    setStartTime(Date.now());
    try {
      recognitionRef.current.start();
    } catch(e) {
      setIsListening(true); // Fallback handling
    }
  };

  const calculateScore = (finalTranscript) => {
    const targetWords = pages[pageIndex].split(/\s+/).map(w => w.replace(/[^\w\s]/g, ""));
    const cleaned = finalTranscript.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
    const spokenWords = cleaned.split(/\s+/).filter(w => w.length > 0);
    
    let correctCount = 0;
    let missedCount = 0;
    
    const wordFeedback = targetWords.map(targetWord => {
      const tw = targetWord.toLowerCase();
      const spokenMatchIndex = spokenWords.findIndex(sw => isFuzzyMatch(tw, sw));
      
      if (spokenMatchIndex !== -1) {
        correctCount++;
        spokenWords.splice(spokenMatchIndex, 1);
        return { word: targetWord, status: 'correct' }; // Green
      } else {
        const status = spokenWords.length > 0 ? 'mispronounced' : 'skipped'; // Red or Yellow
        if (spokenWords.length > 0) spokenWords.shift();
        missedCount++;
        return { word: targetWord, status };
      }
    });

    const accuracy = Math.round((correctCount / targetWords.length) * 100);
    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    
    return { correctCount, missedCount, accuracy, timeTaken, wordFeedback, targetWordsLength: targetWords.length };
  };

  const saveProgressToMongo = async (stats = {}) => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const baseReadingTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : (currentStory?.estimatedReadingTime * 60 || 120);
      
      await fetch("http://localhost:5000/api/child-progress/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id,
          activityType: "story_explorer",
          readingTime: stats.timeTaken || baseReadingTime,
          accuracy: stats.accuracy || 100, // Default to 100 if just read through
          xpEarned: stats.accuracy ? Math.round(stats.accuracy / 10) + 5 : 10,
          completed: true,
          storyId: currentStory?._id,
          storyTitle: currentStory?.title,
        }),
      });
    } catch (err) {
      console.error("Failed to save story progress to Mongo:", err);
    }
  };

  const finalizeAssessment = () => {
    const score = calculateScore(transcript);
    setScoreData(score);
    saveProgressToMongo(score);
    setView("RESULT");
  };

  const nextPage = () => {
    if (synth.speaking) synth.cancel();
    if (pageIndex < pages.length - 1) {
      const newIndex = pageIndex + 1;
      setPageIndex(newIndex);
      saveLocalProgress(newIndex);
      setView("READ");
    } else {
      // Finished story without assessment
      saveProgressToMongo();
      if (user) localStorage.removeItem(`storyExplorer_${user._id}`);
      setView("LIST");
    }
  };

  const prevPage = () => {
    if (synth.speaking) synth.cancel();
    if (pageIndex > 0) {
      const newIndex = pageIndex - 1;
      setPageIndex(newIndex);
      saveLocalProgress(newIndex);
      setView("READ");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // LIST VIEW
  if (view === "LIST") {
    // Continue Reading Data
    let continueStoryData = null;
    if (user) {
      const saved = localStorage.getItem(`storyExplorer_${user._id}`);
      if (saved) continueStoryData = JSON.parse(saved);
    }
    const continueStory = continueStoryData ? stories.find(s => s._id === continueStoryData.storyId) : null;

    // Derived Data
    const categories = [...new Set(stories.map(s => s.category).filter(Boolean))];
    const recommendedStories = stories.slice(0, 3); // Mock logic: just take first 3

    // Filtering Logic
    const filteredStories = stories.filter(story => {
      // Category match
      if (selectedCategory && story.category !== selectedCategory) return false;
      // Search match
      if (searchQuery && !story.title.toLowerCase().includes(searchQuery.toLowerCase()) && !(story.category || "").toLowerCase().includes(searchQuery.toLowerCase())) return false;
      // Filter match
      if (activeFilter === "Easy" && story.level !== "Easy") return false;
      if (activeFilter === "Medium" && story.level !== "Medium") return false;
      if (activeFilter === "Hard" && story.level !== "Hard") return false;
      return true;
    });

    return (
      <div className="min-h-screen font-sans bg-slate-50 text-slate-800 p-6 md:p-10">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => selectedCategory ? setSelectedCategory(null) : navigate("/beginner")} className="p-2 hover:bg-slate-200 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <BookOpen size={24} className="font-bold" />
            </div>
            <div>
              <h1 className="font-black text-3xl text-slate-800 leading-none">Story Library</h1>
              {selectedCategory && <p className="text-emerald-600 font-bold">{selectedCategory}</p>}
            </div>
          </div>
        </header>

        {/* Search & Filter Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search stories by title or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 pl-12 pr-4 py-4 rounded-2xl font-medium text-lg focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {["All Stories", "Easy", "Medium", "Hard", "Completed"].map(f => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`whitespace-nowrap px-6 py-4 rounded-2xl font-bold border-2 transition-all ${
                  activeFilter === f 
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-md" 
                    : "bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {!selectedCategory && !searchQuery ? (
          <>
            {/* Continue Reading */}
            {continueStory && activeFilter === "All Stories" && (
              <section className="mb-10">
                <h2 className="text-xl font-black text-slate-700 mb-4 flex items-center gap-2">📖 Continue Reading</h2>
                <div 
                  onClick={() => selectStory(continueStory)} 
                  className="p-6 md:p-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl text-white shadow-lg shadow-teal-200/50 cursor-pointer hover:scale-[1.02] transition relative overflow-hidden"
                >
                  <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shrink-0">📖</div>
                      <div>
                        <p className="text-emerald-100 font-bold uppercase tracking-wider text-sm mb-1">{continueStory.category || "Story"}</p>
                        <h3 className="text-2xl font-black">{continueStory.title}</h3>
                        <p className="text-emerald-50 font-medium">Page {continueStoryData.pageIndex + 1}</p>
                      </div>
                    </div>
                    <button className="hidden sm:flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-xl font-black shadow-sm">
                      Continue <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Recommended Stories */}
            {activeFilter === "All Stories" && recommendedStories.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-black text-slate-700 mb-4 flex items-center gap-2">⭐ Recommended For You</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendedStories.map(story => (
                    <div key={story._id} onClick={() => selectStory(story)} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:border-amber-400 hover:shadow-md transition cursor-pointer group">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">⭐</div>
                      <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">{story.category || "Story"}</span>
                      <h3 className="text-xl font-black text-slate-800 leading-tight mt-1 mb-2">{story.title}</h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <span className="bg-slate-100 px-2 py-1 rounded-md">{getActivitySupportLabel(story.level)}</span>
                        <span className="bg-slate-100 px-2 py-1 rounded-md">{story.estimatedReadingTime || 2} min read</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Categories */}
            <section>
              <h2 className="text-xl font-black text-slate-700 mb-4 flex items-center gap-2">📚 Story Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((cat, i) => {
                  const colors = [
                    "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
                    "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100",
                    "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100",
                    "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100",
                    "bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100",
                  ];
                  const emojiMap = {
                    "Animals": "🐶",
                    "School Life": "🏫",
                    "Family": "👨‍👩‍👧",
                    "Nature": "🌳",
                    "Adventure": "🚀",
                    "Friendship": "🤝"
                  };
                  const color = colors[i % colors.length];
                  const emoji = emojiMap[cat] || "✨";
                  
                  return (
                    <div 
                      key={cat} 
                      onClick={() => setSelectedCategory(cat)}
                      className={`${color} p-6 rounded-3xl border-2 shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95 text-center flex flex-col items-center justify-center gap-2`}
                    >
                      <span className="text-4xl filter drop-shadow-sm">{emoji}</span>
                      <h3 className="text-lg font-black">{cat}</h3>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          /* Filtered / Category View */
          <section>
            {filteredStories.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4 opacity-50">🔍</div>
                <h3 className="text-2xl font-black text-slate-800">No stories found</h3>
                <p className="text-slate-500 font-medium">Try changing your filters or search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStories.map(story => (
                  <div key={story._id} className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm hover:border-emerald-400 hover:shadow-lg transition-all flex flex-col overflow-hidden">
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{story.category || "Story"}</span>
                        <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 text-slate-700">{getActivitySupportLabel(story.level)}</span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 leading-tight mb-2">{story.title}</h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-6">
                        <span className="flex items-center gap-1"><BookOpen size={14}/> {story.estimatedReadingTime || 2} min read</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 border-t border-slate-100">
                      <button 
                        onClick={() => selectStory(story)}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2"
                      >
                        Read Story <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    );
  }

  // READ, PRACTICE, or RESULT VIEW
  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-800 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => { if (synth.speaking) synth.cancel(); setView("LIST"); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="font-black text-xl text-slate-800">{currentStory.title}</h1>
            <p className="text-xs font-bold text-slate-500 uppercase">Page {pageIndex + 1} of {pages.length}</p>
          </div>
        </div>
        <button 
          onClick={() => { setAutoRead(!autoRead); if(synth.speaking) synth.cancel(); }} 
          className={`p-2 rounded-full transition flex items-center gap-2 text-sm font-bold ${autoRead ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
        >
          {autoRead ? <Volume2 size={20} /> : <VolumeX size={20} />}
          <span className="hidden sm:inline">Auto Read</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto">
        
        {view === "READ" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border-4 border-slate-100 mb-8 min-h-[300px] flex items-center justify-center relative">
              <p className="text-4xl md:text-5xl font-medium text-slate-800 leading-[1.8] tracking-wide" style={{ fontFamily: "Comic Sans MS, 'OpenDyslexic', sans-serif" }}>
                {pages[pageIndex]}
              </p>
              <button onClick={playTTS} className="absolute top-4 right-4 p-3 bg-slate-100 text-slate-600 rounded-full hover:bg-emerald-100 hover:text-emerald-600 transition">
                <Volume2 size={24} />
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={prevPage} disabled={pageIndex === 0} className="flex-1 py-4 rounded-xl font-bold border-2 border-slate-200 text-slate-600 disabled:opacity-50">
                Previous
              </button>
              <button onClick={startPractice} className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 text-xl">
                <Mic size={24} /> Practice Reading
              </button>
              <button onClick={nextPage} className="flex-1 py-4 rounded-xl font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-700">
                {pageIndex === pages.length - 1 ? "Finish Story" : "Next Page"}
              </button>
            </div>
          </motion.div>
        )}

        {view === "PRACTICE" && (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full text-center">
            <h2 className="text-2xl font-black text-purple-600 mb-6 flex items-center justify-center gap-2"><Mic /> Practice Mode</h2>
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border-4 border-slate-100 mb-8 min-h-[300px] flex items-center justify-center">
              <p className="text-4xl md:text-5xl font-medium text-slate-800 leading-[1.8] tracking-wide opacity-50" style={{ fontFamily: "Comic Sans MS, 'OpenDyslexic', sans-serif" }}>
                {pages[pageIndex]}
              </p>
            </div>
            
            <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 mb-8">
              <p className="text-purple-600 font-bold uppercase tracking-wider mb-2 animate-pulse">{isListening ? "Listening..." : "Processing..."}</p>
              <p className="text-purple-900 font-medium italic text-lg">{transcript || "Speak clearly into your microphone..."}</p>
            </div>
            
            <button onClick={() => { if(recognitionRef.current) recognitionRef.current.stop(); }} className="px-8 py-4 bg-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-300">
              Stop Reading
            </button>
          </motion.div>
        )}

        {view === "RESULT" && scoreData && (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full bg-white rounded-[2rem] shadow-xl border-2 border-emerald-100 p-8 text-center">
            <CheckCircle size={64} className="text-emerald-500 mx-auto mb-4" />
            <h3 className="text-3xl font-black text-slate-800 mb-8">Reading Complete!</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <p className="text-emerald-600 font-black text-3xl">{scoreData.accuracy}%</p>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1">Accuracy</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-blue-600 font-black text-3xl">{scoreData.correctCount}</p>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1">Correct Words</p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <p className="text-red-600 font-black text-3xl">{scoreData.missedCount}</p>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1">Missed</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <p className="text-purple-600 font-black text-3xl">{scoreData.timeTaken}s</p>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1">Time</p>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl mb-8 border border-slate-200">
              <p className="text-3xl leading-[1.8] font-medium" style={{ fontFamily: "Comic Sans MS, 'OpenDyslexic', sans-serif" }}>
                {scoreData.wordFeedback.map((fb, idx) => {
                  let colorClass = "text-emerald-500 font-bold";
                  if (fb.status === "mispronounced") colorClass = "text-red-500 font-bold underline decoration-red-300 decoration-2 underline-offset-4";
                  if (fb.status === "skipped") colorClass = "text-yellow-500 font-bold underline decoration-yellow-300 decoration-2 underline-offset-4";
                  return <span key={idx} className={`inline-block mx-1 ${colorClass}`}>{fb.word} </span>;
                })}
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={startPractice} className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 flex items-center gap-2">
                <RefreshCw size={20} /> Read Again
              </button>
              <button onClick={nextPage} className="px-8 py-4 bg-emerald-500 text-white font-black rounded-xl shadow-lg hover:bg-emerald-600 flex items-center gap-2">
                Continue <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
}
