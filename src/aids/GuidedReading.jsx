import React, { useState } from "react";

/**
 * GuidedReading displays text one chunk/sentence at a time,
 * to prevent overwhelming users with severe dyslexia.
 */
const GuidedReading = ({ text, isActive, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Simple chunking by sentences for demonstration
  const chunks = text.match(/[^.!?]+[.!?]+/g) || [text];

  const handleNext = () => {
    if (currentIndex < chunks.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!isActive) {
    return <div>{text}</div>;
  }

  return (
    <div className="guided-reading-container bg-white p-6 rounded-2xl shadow-lg border-2 border-indigo-100 flex flex-col items-center">
      <div className="text-2xl font-semibold text-gray-800 text-center mb-8 min-h-[100px] flex items-center justify-center">
        {chunks[currentIndex]?.trim()}
      </div>
      
      <div className="flex space-x-4">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold disabled:opacity-50 hover:bg-gray-300 transition-colors"
        >
          Previous
        </button>
        <button 
          onClick={handleNext}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-colors transform hover:scale-105"
        >
          {currentIndex < chunks.length - 1 ? "Next" : "Finish"}
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-400 font-medium">
        Part {currentIndex + 1} of {chunks.length}
      </div>
    </div>
  );
};

export default GuidedReading;
