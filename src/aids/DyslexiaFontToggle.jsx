import React, { useEffect, useState } from "react";

const DyslexiaFontToggle = ({ isActive, defaultOn = false }) => {
  const [enabled, setEnabled] = useState(defaultOn);

  useEffect(() => {
    if (!isActive) return;
    
    if (enabled) {
      document.body.classList.add("font-opendyslexic");
      // Fallback if the font isn't loaded: use comic sans or a highly readable sans-serif
      document.body.style.fontFamily = "'OpenDyslexic', 'Comic Sans MS', 'Arial', sans-serif";
    } else {
      document.body.classList.remove("font-opendyslexic");
      document.body.style.fontFamily = "";
    }

    return () => {
      document.body.classList.remove("font-opendyslexic");
      document.body.style.fontFamily = "";
    };
  }, [enabled, isActive]);

  if (!isActive) return null;

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="font-toggle" className="text-sm font-medium text-gray-700">
        Dyslexia Font
      </label>
      <button
        id="font-toggle"
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          enabled ? "bg-indigo-600" : "bg-gray-200"
        }`}
        aria-pressed={enabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};

export default DyslexiaFontToggle;
