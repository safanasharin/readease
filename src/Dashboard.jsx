import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { assessmentApi } from "./utils/assessment";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/");
      return;
    }

    setUser(storedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-white">
      <Navbar />

      <div className="pt-20">
        <div className="flex flex-col lg:flex-row">
          {/* LEFT SIDE */}
          <div className="flex-1 p-10">
            <p className="text-sm uppercase tracking-wide text-teal-600 font-semibold mb-2">
              Student dashboard
            </p>

            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Welcome back, <br /> {user?.name || "Student"} 👋
            </h1>

            <p className="text-gray-600 text-lg mb-8 max-w-xl">
              Continue your personalized reading journey with guided tools,
              accessibility support, and progress-focused learning activities.
            </p>

            <div className="flex gap-4 mb-8 flex-wrap">
              <button
                onClick={() =>
                  navigate("/reader", { state: { from: "dashboard" } })
                }
                className="bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition"
              >
                Go to Reader
              </button>

              <button
                onClick={handleLogout}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition"
              >
                Logout
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <div
                onClick={() => navigate("/progress")}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow cursor-pointer hover:shadow-md transition"
              >
                <div className="text-3xl mb-3">📘</div>
                <h3 className="font-semibold text-lg">Reading Progress</h3>
                <p className="text-sm text-gray-500 mt-1 leading-6">
                  Track your sessions, monitor improvement, and continue from where
                  you stopped.
                </p>
              </div>

              <div
                onClick={() =>
                  navigate("/reader", { state: { from: "dashboard" } })
                }
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow cursor-pointer hover:shadow-md transition"
              >
                <div className="text-3xl mb-3">🤖</div>
                <h3 className="font-semibold text-lg">AI Support</h3>
                <p className="text-sm text-gray-500 mt-1 leading-6">
                  Use AI-powered reading help, guided support, and learner-friendly
                  tools to improve fluency and confidence.
                </p>
              </div>

              <div className="bg-yellow-100 p-5 rounded-2xl border border-yellow-200 shadow hover:shadow-md transition">
                <div className="text-3xl mb-3">💡</div>
                <h3 className="font-semibold text-lg">Daily Tip</h3>
                <p className="text-sm mt-1 leading-6">
                  Practice for a few minutes every day. Small, consistent reading
                  sessions build long-term confidence.
                </p>
              </div>
            </div>

            <div className="mt-8 bg-teal-50 border border-teal-100 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-teal-700 mb-2">
                Today’s Focus
              </h3>
              <p className="text-sm text-gray-700 leading-6">
                Continue your guided reading practice and use the AI tools whenever
                you need help with words, pronunciation, or understanding.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="w-full lg:w-[40%] flex justify-center items-center p-4 bg-gray-50">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
              <div className="mb-6 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-teal-100 flex items-center justify-center text-3xl font-bold text-teal-700 mb-3">
                  {user?.name?.charAt(0)?.toUpperCase() || "S"}
                </div>

                <h2 className="text-2xl font-bold text-[#1f2a44] mb-1">
                  {user?.name || "Student"}
                </h2>

                <p className="text-sm text-gray-500">
                  {user?.email || "student@example.com"}
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-teal-50 border border-teal-100 p-4">
                  <p className="text-sm text-gray-500">Logged in as</p>
                  <h3 className="text-lg font-semibold text-teal-700">
                    {user?.name || "Student"}
                  </h3>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>

                

                
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() =>
                    navigate("/reader", { state: { from: "dashboard" } })
                  }
                  className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-teal-700 transition"
                >
                  Go to Reader
                </button>

                <button
                  onClick={() => navigate("/progress")}
                  className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  View Progress
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Logout
                </button>
              </div>

              <div className="mt-6 space-y-2 text-sm text-gray-500">
                <p>✓ Personalized support is active for your account.</p>
                <p>✓ Your reading tools are ready to use.</p>
                <p>✓ Progress tracking is available.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
