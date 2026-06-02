import React, { useState } from "react";
import { useIntervention } from "../context/InterventionContext";
import { Settings, X } from "lucide-react";

export default function AidToolbar() {
  const { availableAids, aids } = useIntervention();
  const [isOpen, setIsOpen] = useState(false);
  const [localAids, setLocalAids] = useState(aids); // For demo purposes, keep local state

  const toggleAid = (aidKey) => {
    setLocalAids(prev => ({
      ...prev,
      [aidKey]: !prev[aidKey]
    }));
  };

  if (!availableAids || availableAids.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white shadow-2xl rounded-2xl p-4 border border-indigo-100 w-72 transition-all">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-sm">Learning Aids</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            {availableAids.map((aidKey) => (
              <div key={aidKey} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {aidKey.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <button
                  onClick={() => toggleAid(aidKey)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                    localAids[aidKey] ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      localAids[aidKey] ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 cursor-pointer"
        >
          <Settings size={24} />
        </button>
      )}
    </div>
  );
}
