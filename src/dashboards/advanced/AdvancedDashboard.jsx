import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdvancedNavbar from "./AdvancedNavbar";
import { motion } from "framer-motion";
import { 
  Moon, Sun, BookOpen, Mic, Bookmark, TrendingUp, 
  Activity, Trophy, Star, Clock, CheckCircle, BarChart2, Target,
  ArrowRight, Zap
} from "lucide-react";
import "./AdvancedDashboard.css";

export default function AdvancedDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("dashboard-theme") === "dark"
  );
  
  const [progressStats, setProgressStats] = useState({
    lessonsCompleted: user?.exerciseHistory?.length || 0,
    storiesRead: 0,
    readingTime: Math.floor((user?.dailySession?.totalMinutes || 0)),
    streak: user?.gamification?.streak || user?.currentStreak || 0,
    recentActivity: []
  });

  useEffect(() => {
    localStorage.setItem("dashboard-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    if (!user || !user._id) return;
    const token = localStorage.getItem("token");
    
    async function fetchProgress() {
      try {
        const res = await fetch(`http://localhost:5000/api/progress/summary/${user._id}`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProgressStats(prev => ({
            ...prev,
            lessonsCompleted: data.totalSessions || prev.lessonsCompleted,
            storiesRead: data.completedStoriesCount || prev.storiesRead,
            readingTime: data.totalReadingTime ? Math.floor(data.totalReadingTime / 60) : prev.readingTime,
            recentActivity: data.recentActivity || []
          }));
        }
      } catch (err) {
        console.error("Failed to fetch progress", err);
      }
    }
    fetchProgress();
  }, [user]);

  // Derived Values
  const dyslexiaLevel = user?.dyslexiaLevel ? user.dyslexiaLevel.toLowerCase() : "mild";
  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  const modules = [
    {
      title: "AI Reading Assistant",
      desc: "Practice reading aloud and improve pronunciation.",
      icon: <Mic size={20} />,
      path: "/voice-practice",
      btnText: "Start Session",
      color: "indigo"
    },
    {
      title: "Reader Module",
      desc: "Read passages and improve comprehension skills.",
      icon: <BookOpen size={20} />,
      path: "/reader",
      btnText: "Open Reader",
      color: "emerald"
    },
    {
      title: "Story Module",
      desc: "Explore interactive stories and reading adventures.",
      icon: <Bookmark size={20} />,
      path: "/stories",
      btnText: "Read Stories",
      color: "cyan"
    },
    {
      title: "Achievements & Rewards",
      desc: "View badges and milestones earned.",
      icon: <Trophy size={20} />,
      path: "/rewards",
      btnText: "View Achievements",
      color: "amber"
    },
    {
      title: "Daily Tasks",
      desc: "Complete daily activities to maintain consistency.",
      icon: <Target size={20} />,
      path: "/challenges",
      btnText: "View Tasks",
      color: "pink"
    }
  ];

  // Goals logic for Progress Bars
  const goalLessons = 50;
  const goalStories = 20;
  const goalMinutes = 300;

  const goals = [
    {
      name: "Lessons",
      current: progressStats.lessonsCompleted,
      goal: goalLessons,
      progressClass: "adv-progress-indigo"
    },
    {
      name: "Stories Read",
      current: progressStats.storiesRead,
      goal: goalStories,
      progressClass: "adv-progress-cyan"
    },
    {
      name: "Reading Time",
      current: progressStats.readingTime,
      goal: goalMinutes,
      unit: "m",
      progressClass: "adv-progress-amber"
    }
  ];

  return (
    <div className={`adv-root${isDarkMode ? "" : " adv-light"}`}>
      <AdvancedNavbar />
      
      <div className="adv-content">
        
        {/* ── Top Bar ─────────────────────────────────── */}
        <div className="adv-topbar">
          <span className="adv-workspace-title">Workspace</span>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="adv-theme-toggle"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* ── Profile Header ───────────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: -12 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="adv-profile-card"
        >
          <div className="adv-profile-left">
            <div className="adv-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div>
              <h2 className="adv-user-name">
                {user?.name || "Student"}
              </h2>
              <div className="adv-user-meta">
                <span className="adv-badge adv-badge-group">
                  <Zap size={10} />
                  Group: {capitalize(user?.ageGroup)}
                </span>
                <span className="adv-badge adv-badge-level">
                  <Star size={10} />
                  Level: {capitalize(dyslexiaLevel)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="adv-profile-stats">
            <div className="adv-stat-item">
              <p className="adv-stat-label">Streak</p>
              <p className="adv-stat-value">{progressStats.streak}</p>
            </div>
            <div className="adv-stat-item">
              <p className="adv-stat-label">Score</p>
              <p className="adv-stat-value">
                {(progressStats.lessonsCompleted * 10) + (progressStats.storiesRead * 20)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Main Content Grid ────────────────────────── */}
        <div className="adv-main-grid">
          
          {/* SIDEBAR */}
          <div className="adv-sidebar">
            
            {/* Goal Tracking */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="adv-panel"
            >
              <h3 className="adv-panel-title">
                <span className="adv-panel-title-icon"><Target size={14} /></span>
                Goal Tracking
              </h3>
              
              <div className="adv-goals">
                {goals.map((goal, i) => (
                  <div key={i} className="adv-goal-item">
                    <div className="adv-goal-header">
                      <span className="adv-goal-name">{goal.name}</span>
                      <span className="adv-goal-count">
                        {goal.current}{goal.unit || ""} / {goal.goal}{goal.unit || ""}
                      </span>
                    </div>
                    <div className="adv-progress-track">
                      <div 
                        className={`adv-progress-fill ${goal.progressClass}`} 
                        style={{ width: `${Math.min((goal.current / goal.goal) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.5, delay: 0.2 }}
              className="adv-panel"
            >
              <h3 className="adv-panel-title">
                <span className="adv-panel-title-icon"><Activity size={14} /></span>
                Recent Activity
              </h3>
              <div className="adv-timeline">
                <div className="adv-timeline-track">
                  {progressStats.recentActivity && progressStats.recentActivity.length > 0 ? (
                    progressStats.recentActivity.slice(0, 3).map((act, i) => (
                      <div key={i} className="adv-timeline-item">
                        <div className="adv-timeline-dot" />
                        <p className="adv-timeline-title">
                          {act.storyTitle || "Reading Practice"}
                        </p>
                        <p className="adv-timeline-meta">
                          {new Date(act.date).toLocaleDateString()}
                          <span className="adv-activity-tag">
                            {act.activityType === 'voice-practice' ? 'Voice' : 'Reading'}
                          </span>
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="adv-empty-state">No recent activity logged.</p>
                  )}
                </div>
              </div>
            </motion.div>

          </div>

          {/* MAIN MODULES AREA */}
          <div className="adv-modules-section">
            <h2 className="adv-section-title">Advanced Module Workspace</h2>
            
            <div className="adv-modules-grid">
              {modules.map((mod, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * idx }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate(mod.path)}
                  className="adv-module-card"
                  data-color={mod.color}
                >
                  <div className="adv-module-header">
                    <div className={`adv-module-icon adv-icon-${mod.color}`}>
                      {mod.icon}
                    </div>
                    <h3 className="adv-module-title">{mod.title}</h3>
                  </div>
                  
                  <p className="adv-module-desc">{mod.desc}</p>
                  
                  <button className="adv-module-btn">
                    {mod.btnText}
                    <ArrowRight size={12} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
