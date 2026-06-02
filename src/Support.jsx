import { Link, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";

export default function Support() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f6cf] text-gray-800 font-sans">
      {/* NAVBAR */}
      <Navbar />

      {/* MAIN */}
      <div className="pt-28 px-8 lg:px-12 pb-10">
        <h1 className="text-5xl font-bold text-teal-600 mb-6">Support Page</h1>

        <p className="text-2xl text-gray-700 mb-10 max-w-3xl">
          This page gives accessibility help and support options for students.
        </p>

        {/* SUPPORT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">
              Accessibility Help
            </h2>
            <p className="text-gray-600 leading-7">
              Use learner-friendly reading support, simple layout, and guided tools
              for better understanding.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">
              Reading Guidance
            </h2>
            <p className="text-gray-600 leading-7">
              Practice reading in short sessions and get help with pronunciation,
              confidence, and focus.
            </p>
          </div>
        </div>

        {/* VOICE PRACTICE OPTION */}
        <div className="mt-10 bg-white rounded-2xl shadow p-8 border border-gray-200 max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Voice Practice
          </h2>
          <p className="text-gray-600 mb-6 leading-7">
            Practice reading aloud, highlight spoken words, and view your reading
            score after speaking.
          </p>

          
        </div>
      </div>
    </div>
  );
}