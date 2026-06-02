import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Settings, Check, X, Type, Eye, Volume2, Sparkles } from "lucide-react";

export default function AccessibilityToolbar() {
  const { user, token, updateUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Local state initialized from user preferences
  const [fontEnabled, setFontEnabled] = useState(false);
  const [fontSize, setFontSize] = useState(20); // 18=Small, 24=Medium, 32=Large
  const [lineSpacing, setLineSpacing] = useState(1.5); // 1.5=Normal, 2.5=Double
  const [contrastMode, setContrastMode] = useState(false);
  const [lowDistraction, setLowDistraction] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Sync state when user object loads
  useEffect(() => {
    if (user?.accessibilityPreferences) {
      const prefs = user.accessibilityPreferences;
      if (prefs.dyslexicFontEnabled !== null && prefs.dyslexicFontEnabled !== undefined) {
        setFontEnabled(prefs.dyslexicFontEnabled);
      }
      if (prefs.fontSize !== null && prefs.fontSize !== undefined) {
        setFontSize(prefs.fontSize);
      }
      if (prefs.lineSpacing !== null && prefs.lineSpacing !== undefined) {
        setLineSpacing(prefs.lineSpacing);
      }
      if (prefs.overlayColor === "high-contrast") {
        setContrastMode(true);
      }
      if (prefs.overlayColor === "low-distraction") {
        setLowDistraction(true);
      }
      if (prefs.ttsEnabled !== null && prefs.ttsEnabled !== undefined) {
        setTtsEnabled(prefs.ttsEnabled);
      }
    }
  }, [user]);

  // Apply styles globally to document body/root
  useEffect(() => {
    // 1. OpenDyslexic font class
    if (fontEnabled) {
      document.body.classList.add("font-dyslexic");
    } else {
      document.body.classList.remove("font-dyslexic");
    }

    // 2. CSS variables for font size & line spacing
    document.documentElement.style.setProperty("--explorer-font-size", `${fontSize}px`);
    document.documentElement.style.setProperty("--explorer-line-spacing", `${lineSpacing}`);

    // 3. Contrast mode
    if (contrastMode) {
      document.body.classList.add("high-contrast-mode");
      document.body.style.filter = "contrast(1.2) saturate(1.1)";
    } else {
      document.body.classList.remove("high-contrast-mode");
      document.body.style.filter = "none";
    }

    // 4. Low distraction mode
    if (lowDistraction) {
      document.body.classList.add("low-distraction-mode");
    } else {
      document.body.classList.remove("low-distraction-mode");
    }
  }, [fontEnabled, fontSize, lineSpacing, contrastMode, lowDistraction]);

  const savePreferences = async (newPrefs) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/accessibility", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPrefs),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        updateUser(data.user);
      }
    } catch (err) {
      console.error("Failed to save accessibility preferences:", err);
    }
  };

  const handleToggleFont = () => {
    const nextVal = !fontEnabled;
    setFontEnabled(nextVal);
    savePreferences({ dyslexicFontEnabled: nextVal });
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    savePreferences({ fontSize: size });
  };

  const handleSpacingChange = (spacing) => {
    setLineSpacing(spacing);
    savePreferences({ lineSpacing: spacing });
  };

  const handleToggleContrast = () => {
    const nextVal = !contrastMode;
    setContrastMode(nextVal);
    savePreferences({ overlayColor: nextVal ? "high-contrast" : "normal" });
  };

  const handleToggleDistraction = () => {
    const nextVal = !lowDistraction;
    setLowDistraction(nextVal);
    savePreferences({ overlayColor: nextVal ? "low-distraction" : "normal" });
  };

  const handleToggleTts = () => {
    const nextVal = !ttsEnabled;
    setTtsEnabled(nextVal);
    savePreferences({ ttsEnabled: nextVal });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        {isOpen ? <X size={26} /> : <Settings size={26} className="animate-spin-slow" />}
      </button>

      {/* Preferences Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white/95 backdrop-blur-md rounded-3xl border-4 border-indigo-200 shadow-2xl p-6 flex flex-col gap-4 text-slate-800 animate-slide-up">
          <div className="border-b border-indigo-50 pb-2">
            <h3 className="font-black text-lg text-indigo-700 flex items-center gap-2">
              🧚‍♀️ Magic Room Controls
            </h3>
            <p className="text-xs font-semibold text-gray-500">
              Customize how letters and games look!
            </p>
          </div>

          {/* Dyslexic Font Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold flex items-center gap-2 text-gray-700">
              <Type size={16} /> OpenDyslexic Font
            </span>
            <button
              onClick={handleToggleFont}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                fontEnabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  fontEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Font Size Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-gray-700">Letter Size</span>
            <div className="flex gap-2">
              {[
                { label: "Aa", size: 18, desc: "Small" },
                { label: "Aa", size: 24, desc: "Medium" },
                { label: "Aa", size: 32, desc: "Big" },
              ].map((opt) => (
                <button
                  key={opt.size}
                  onClick={() => handleFontSizeChange(opt.size)}
                  className={`flex-1 py-1.5 rounded-xl border-2 font-black transition-all cursor-pointer ${
                    fontSize === opt.size
                      ? "border-pink-500 bg-pink-50 text-pink-600 scale-105"
                      : "border-gray-200 bg-white hover:border-pink-200 text-gray-500"
                  }`}
                  style={{ fontSize: `${opt.size * 0.7}px` }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Line Spacing Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-gray-700">Line Spacing</span>
            <div className="flex gap-2">
              {[
                { label: "Normal", spacing: 1.5 },
                { label: "Double", spacing: 2.5 },
              ].map((opt) => (
                <button
                  key={opt.spacing}
                  onClick={() => handleSpacingChange(opt.spacing)}
                  className={`flex-1 py-2 rounded-xl border-2 font-black text-xs transition-all cursor-pointer ${
                    lineSpacing === opt.spacing
                      ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                      : "border-gray-200 bg-white text-gray-500"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast Mode */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold flex items-center gap-2 text-gray-700">
              <Eye size={16} /> High Contrast
            </span>
            <button
              onClick={handleToggleContrast}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                contrastMode ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  contrastMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Low Distraction Mode */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold flex items-center gap-2 text-gray-700">
              <Sparkles size={16} /> Clean Room (Low Distraction)
            </span>
            <button
              onClick={handleToggleDistraction}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                lowDistraction ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  lowDistraction ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Text-to-speech Toggler */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold flex items-center gap-2 text-gray-700">
              <Volume2 size={16} /> Read to Me (TTS)
            </span>
            <button
              onClick={handleToggleTts}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                ttsEnabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  ttsEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Global CSS rules for custom styles */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        /* Custom spacing styles applied dynamically */
        body, p, span, h1, h2, h3, button, canvas {
          font-size: var(--explorer-font-size, inherit);
          line-height: var(--explorer-line-spacing, inherit);
        }
        /* Low distraction mode styling rules */
        body.low-distraction-mode .absolute:not(.sticky):not(.z-[999]):not(.pointer-events-auto) {
          display: none !important;
        }
        body.low-distraction-mode * {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `}</style>
    </div>
  );
}
