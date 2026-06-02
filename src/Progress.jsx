import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import WeeklyProgressChart from "./components/WeeklyProgressChart";
import { 
  ArrowLeft, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  Brain,
  Target,
  Award,
  Activity,
  CalendarDays
} from "lucide-react";

export default function Progress() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/");
      return;
    }

    setUser(storedUser);

    const userId = storedUser._id;

    if (!userId) {
      setError("User ID not found");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // 🔹 SUMMARY
        const summaryRes = await fetch(
          `http://localhost:5000/api/progress/summary/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const summaryData = await summaryRes.json();

        if (!summaryRes.ok) {
          throw new Error(summaryData.message || "Failed to fetch summary");
        }

        setSummary(summaryData);

        // 🔹 WEEKLY
        const weeklyRes = await fetch(
          `http://localhost:5000/api/progress/weekly/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const weeklyData = await weeklyRes.json();

        if (!weeklyRes.ok) {
          throw new Error(
            weeklyData.message || "Failed to fetch weekly progress"
          );
        }

        const parsedWeekly = Array.isArray(weeklyData) ? weeklyData : [];
        setWeekly(parsedWeekly);
        setInsights(generateInsights(parsedWeekly));

      } catch (err) {
        console.error("Progress fetch error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const generateInsights = (weeklyData) => {
    if (!weeklyData || weeklyData.length < 2) {
      return [
        "Keep reading! We need at least 2 weeks of data to generate progress insights.",
        "Try to complete a few more stories to build up your statistics.",
      ];
    }
    const currentWeek = weeklyData[0];
    const lastWeek = weeklyData[1];
    const generatedInsights = [];

    // Reading Time Insight
    if (currentWeek.totalReadingTime > lastWeek.totalReadingTime) {
      generatedInsights.push(`Great job! Your reading time increased by ${currentWeek.totalReadingTime - lastWeek.totalReadingTime} seconds this week. 📈`);
    } else {
      generatedInsights.push("Consistency is key! Try to match or beat your reading time from last week. ⏳");
    }

    // Pronunciation Score Insight
    if (currentWeek.averageScore > lastWeek.averageScore) {
      const improvement = currentWeek.averageScore - lastWeek.averageScore;
      generatedInsights.push(`Awesome! Your pronunciation improved by ${improvement}% this week. 🎤`);
    }

    // Completed Stories Insight
    if (currentWeek.completedStoriesCount < 2) {
      generatedInsights.push("Try to complete more stories for better progress and higher scores! 📚");
    } else {
      generatedInsights.push(`You've completed ${currentWeek.completedStoriesCount} stories this week. Keep up the great momentum! 🚀`);
    }

    return generatedInsights;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // 🔹 LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-teal-700 font-medium text-lg animate-pulse">Loading your learning journey...</p>
        </div>
      </div>
    );
  }

  // 🔹 ERROR
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/assessment")}
            className="w-full bg-teal-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-teal-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-white flex flex-col">
      {/* NAVBAR */}
      <Navbar />

      {/* MAIN */}
      <div className="flex flex-col lg:flex-row mt-20 flex-1">
        {/* LEFT SIDE (Main Content) */}
        <div className="flex-1 p-10">
          <p className="text-sm uppercase tracking-wide text-teal-600 font-semibold mb-2">
            Performance Analytics
          </p>

          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Your Progress 📈
          </h1>

          <p className="text-gray-600 text-lg mb-8 max-w-xl">
            Track your reading habits, view pronunciation improvements, and monitor your overall progress over time.
          </p>

          <div className="space-y-8">
            {/* 🔹 INTELLIGENT INSIGHTS (AI FEEDBACK) */}
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain size={24} className="text-teal-600" />
                <h2 className="text-xl font-bold text-teal-700">AI Learning Insights</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.map((insight, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm">
                    <p className="text-gray-700 text-sm leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 🔹 WEEKLY GRAPHS */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp size={24} className="text-teal-600" />
                Weekly Performance Trends
              </h2>
              {weekly.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-200">
                  <CalendarDays size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No weekly data available yet.</p>
                </div>
              ) : (
                <WeeklyProgressChart weekly={weekly} />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (Sidebar) */}
        <div className="w-full lg:w-[40%] flex flex-col p-8 bg-gray-50 border-l border-gray-200">
          
          {/* 🔹 SUMMARY CARDS */}
          {summary && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Target size={24} className="text-teal-600" />
                All-Time Summary
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <StatCard 
                  icon={<BookOpen size={24} />} 
                  title="Total Sessions" 
                  value={summary.totalSessions || 0} 
                  color="blue"
                />
                <StatCard 
                  icon={<Clock size={24} />} 
                  title="Reading Time" 
                  value={`${Math.floor((summary.totalReadingTime || 0) / 60)}m ${(summary.totalReadingTime || 0) % 60}s`} 
                  color="emerald"
                />
                <StatCard 
                  icon={<Award size={24} />} 
                  title="Average Score" 
                  value={`${summary.averageScore || 0}%`} 
                  color="purple"
                />
                <StatCard 
                  icon={<CheckCircle size={24} />} 
                  title="Stories Finished" 
                  value={summary.completedStoriesCount || 0} 
                  color="orange"
                />
              </div>
            </div>
          )}

          {/* 🔹 RECENT ACTIVITY */}
          <div className="space-y-4 flex-1">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Activity size={24} className="text-teal-600" />
              Recent Activity
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 h-full">
              {(!summary?.recentActivity || summary.recentActivity.length === 0) ? (
                <p className="text-gray-500 text-center py-6">No recent activity found.</p>
              ) : (
                <div className="space-y-4">
                  {summary.recentActivity
  .filter((activity) => activity.contentSource !== "custom" && activity.completed && activity.storyId)
  .map((activity, index) => (
                    <div key={index} className="flex flex-col gap-2 p-4 hover:bg-gray-50 rounded-xl transition border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-gray-800 text-sm truncate pr-2">
                         {activity.storyTitle}
                        </span>
                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                          {formatDate(activity.date)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm mt-2">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          activity.activityType === 'voice-practice' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {activity.activityType === 'voice-practice' ? 'Voice' : 'Reader'}
                        </span>
                        
                        <div className="flex gap-3">
                          {activity.completed ? (
                            <span className="flex items-center gap-1 text-emerald-600 font-medium text-xs">
                              <CheckCircle size={14} /> Done
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-orange-500 font-medium text-xs">
                              <Clock size={14} /> In Progress
                            </span>
                          )}
                          
                          {activity.activityType === 'voice-practice' && (
                            <span className="font-bold text-teal-700 text-xs flex items-center gap-1">
                              {activity.score}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🔹 REUSABLE STAT CARD COMPONENT
function StatCard({ icon, title, value, color }) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 transition-transform hover:-translate-y-1 hover:shadow-md">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorStyles[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );
}