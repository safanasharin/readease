import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import AgeGroup3Overview from '../../components/agegroup3/AgeGroup3Overview';
import AgeGroup3StatsCards from '../../components/agegroup3/AgeGroup3StatsCards';
import AgeGroup3WeeklyChart from '../../components/agegroup3/AgeGroup3WeeklyChart';
import AgeGroup3ReadingAnalytics from '../../components/agegroup3/AgeGroup3ReadingAnalytics';
import AgeGroup3Achievements from '../../components/agegroup3/AgeGroup3Achievements';
import AgeGroup3ActivityTimeline from '../../components/agegroup3/AgeGroup3ActivityTimeline';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function AgeGroup3ParentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // STRICT AGE GROUP 3 FILTER
  // Only users with ageGroup "intermediate" or 3 are allowed
  const isAgeGroup3 = user && (user.ageGroup === 3 || user?.ageGroup?.toLowerCase() === "intermediate");

  useEffect(() => {
    if (!user || !isAgeGroup3) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Fetch existing Progress Data used by Intermediate (Teen) dashboards
        const [summaryRes, weeklyRes] = await Promise.all([
          fetch(`http://localhost:5000/api/progress/summary/${user._id}`, {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          }),
          fetch(`http://localhost:5000/api/progress/weekly/${user._id}`, {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          })
        ]);

        if (!summaryRes.ok || !weeklyRes.ok) throw new Error("Failed to fetch progress data");

        const summaryData = await summaryRes.json();
        const weeklyData = await weeklyRes.json();

        setSummary(summaryData);
        setWeekly(weeklyData);
      } catch (err) {
        console.error(err);
        setError("Unable to load progress. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAgeGroup3]);

  if (!isAgeGroup3) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-red-100 max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Restricted</h2>
          <p className="text-slate-600 mb-6">This dashboard is strictly reserved for Age Group 3 learners.</p>
          <button onClick={() => navigate(-1)} className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold">Go Back</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-blue-600">
          <Loader2 size={40} className="animate-spin" />
          <p className="font-bold">Loading Age Group 3 Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-white rounded-full transition shadow-sm border border-slate-200 bg-slate-50"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800">Age Group 3 Parent Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1">Intermediate Learning Analytics & Tracking</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium mb-8 border border-red-100 flex items-center gap-2">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* 1. Student Overview */}
        <AgeGroup3Overview user={user} summary={summary} />

        {/* 2. Stats Cards */}
        <AgeGroup3StatsCards data={{...summary, streak: user?.gamification?.streak || user?.currentStreak || 0}} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* 3. Weekly Progress Chart */}
          <div className="lg:col-span-2 h-[450px]">
            <AgeGroup3WeeklyChart weekly={weekly} />
          </div>
          
          {/* 4 & 5. Reading Performance & Analytics */}
          <div className="lg:col-span-1 h-[450px]">
            <AgeGroup3ReadingAnalytics summary={summary} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 6. Achievements */}
          <div>
            <AgeGroup3Achievements user={user} summary={summary} />
          </div>

          {/* 7. Activity Timeline */}
          <div>
            <AgeGroup3ActivityTimeline recentActivity={summary?.recentActivity} />
          </div>
        </div>

      </div>
    </div>
  );
}
