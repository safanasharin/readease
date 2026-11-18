import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Target, BookOpen, Brain, CalendarDays, CheckCircle, Clock, Activity, TrendingUp, Sun, Moon, Zap, Star, BarChart2
} from "lucide-react";
import AdvancedNavbar from "./AdvancedNavbar";
import "./AdvancedDashboard.css";

const getSupportLevelLabel = (supportLevel, dyslexiaLevel) => {
  const sl = (supportLevel || "").toLowerCase();
  const dl = (dyslexiaLevel || "").toLowerCase();
  if (sl === "intensive_support" || dl === "severe" || dl === "level3") return "Severe Support";
  if (sl === "guided_support"    || dl === "moderate" || dl === "level2") return "Moderate Support";
  return "Mild Support";
};

const getActivitySupportLabel = (level) => {
  if (level === 1 || level === "Easy" || level === "1") return "Mild";
  if (level === 2 || level === "Medium" || level === "2") return "Moderate";
  if (level === 3 || level === "Hard" || level === "3") return "Severe";
  return "Not Assessed";
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default function AdvancedProgressView({ user, summary }) {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("dashboard-theme") === "dark"
  );

  useEffect(() => {
    localStorage.setItem("dashboard-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  const dyslexiaLevel = user?.dyslexiaLevel ? user.dyslexiaLevel.toLowerCase() : "mild";

  const FeatureCard = ({ icon, title, colorClass, children, hasData }) => (
    <div className={`adv-panel`} style={{ padding: "1.5rem" }}>
      <h3 className="adv-panel-title" style={{ marginBottom: "1rem" }}>
        <span className={`adv-panel-title-icon adv-icon-${colorClass}`} style={{ background: 'transparent', boxShadow: 'none' }}>
          {icon}
        </span>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {hasData ? children : (
          <p className="adv-empty-state">No data available.</p>
        )}
      </div>
    </div>
  );

  const StatRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--adv-border)', paddingBottom: '0.5rem', paddingTop: '0.5rem' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--adv-text-muted)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '0.85rem', color: 'var(--adv-text)', fontWeight: 700 }}>{value}</span>
    </div>
  );

  return (
    <div className={`adv-root${isDarkMode ? "" : " adv-light"}`}>
      <h1 style={{ background: "black", color: "cyan", padding: "10px", textAlign: "center", position: "relative", zIndex: 9999 }}>ADVANCED VIEW LOADED</h1>
      <AdvancedNavbar />
      
      <div className="adv-content">
        
        {/* Top Bar */}
        <div className="adv-topbar">
          <button 
            onClick={() => navigate("/dashboard")}
            className="adv-theme-toggle"
            style={{ width: 'auto', padding: '0 1rem', display: 'flex', gap: '0.5rem' }}
            aria-label="Back"
          >
            <ArrowLeft size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>BACK TO DASHBOARD</span>
          </button>
          
          <span className="adv-workspace-title">Performance Analytics</span>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="adv-theme-toggle"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Profile Header */}
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
                {user?.name || "Student"} <span style={{ color: 'var(--adv-text-muted)', fontSize: '1.2rem', fontWeight: 500 }}>/ Progress Report</span>
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
                <span className="adv-badge" style={{ color: 'var(--adv-emerald)', borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.1)' }}>
                  <TrendingUp size={10} />
                  Support: {getSupportLevelLabel(user?.supportLevel, user?.dyslexiaLevel)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="adv-profile-stats">
            <div className="adv-stat-item">
              <p className="adv-stat-label">Completion</p>
              <p className="adv-stat-value">{summary?.storyCompletionPercentage || summary?.averageScore || 0}%</p>
            </div>
            <div className="adv-stat-item">
              <p className="adv-stat-label">Activities</p>
              <p className="adv-stat-value">{summary?.completedSessions || 0}</p>
            </div>
            <div className="adv-stat-item">
              <p className="adv-stat-label">Time</p>
              <p className="adv-stat-value">{Math.floor((summary?.totalTimeSpent || 0) / 60)}m</p>
            </div>
            <div className="adv-stat-item">
              <p className="adv-stat-label">XP</p>
              <p className="adv-stat-value">{summary?.totalXP || 0}</p>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="adv-main-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
          
          {/* Main Area: Feature Analytics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h2 className="adv-section-title">Module Performance Metrics</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              
              <FeatureCard 
                icon={<BookOpen size={18} />} 
                title="Reading Practice" 
                colorClass="indigo"
                hasData={!!summary}
              >
                <StatRow label="Accuracy" value={`${summary?.averageScore || 0}%`} />
                <StatRow label="Words Read" value={summary?.wordsRead || 0} />
                <StatRow label="Sessions" value={summary?.completedSessions || 0} />
                <StatRow label="Level" value={getActivitySupportLabel(summary?.currentReadingLevel || 1)} />
              </FeatureCard>

              <FeatureCard 
                icon={<Target size={18} />} 
                title="Vocabulary Builder" 
                colorClass="emerald"
                hasData={!!summary?.vocabularyData}
              >
                <StatRow label="Words Learned" value={summary?.vocabularyData?.wordsLearned || 0} />
                <StatRow label="Mastered" value={summary?.vocabularyData?.masteredWords || 0} />
                <StatRow label="Accuracy" value={`${summary?.vocabularyData?.accuracy || 0}%`} />
                <StatRow label="Level" value={getActivitySupportLabel(summary?.vocabularyData?.currentLevel || 1)} />
              </FeatureCard>

              <FeatureCard 
                icon={<Brain size={18} />} 
                title="Word Detective" 
                colorClass="cyan"
                hasData={!!summary?.wordDetectiveData}
              >
                <StatRow label="Attempted" value={summary?.wordDetectiveData?.attempted || 0} />
                <StatRow label="Correct" value={summary?.wordDetectiveData?.correct || 0} />
                <StatRow label="Accuracy" value={`${summary?.wordDetectiveData?.accuracy || 0}%`} />
                <StatRow label="Level" value={getActivitySupportLabel(summary?.wordDetectiveData?.currentLevel || 1)} />
              </FeatureCard>

              <FeatureCard 
                icon={<CalendarDays size={18} />} 
                title="Story Explorer" 
                colorClass="amber"
                hasData={!!summary}
              >
                <StatRow label="Stories Read" value={summary?.completedStoriesCount || 0} />
                <StatRow label="Reading Time" value={`${Math.floor((summary?.storyExplorerTotalTime || 0) / 60)}m`} />
                <StatRow label="Completion" value={`${summary?.storyCompletionPercentage || 0}%`} />
              </FeatureCard>

              <FeatureCard 
                icon={<CheckCircle size={18} />} 
                title="Sentence Adventure" 
                colorClass="pink"
                hasData={!!summary?.sentenceAdventureData}
              >
                <StatRow label="Completed" value={summary?.sentenceAdventureData?.completed || 0} />
                <StatRow label="Voice Acc" value={`${summary?.sentenceAdventureData?.voiceAccuracy || summary?.averageScore || 0}%`} />
                <StatRow label="XP Earned" value={summary?.sentenceAdventureData?.xp || 0} />
              </FeatureCard>

            </div>
          </div>

          {/* Sidebar */}
          <div className="adv-sidebar">
            
            {/* Learning Insights */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="adv-panel"
            >
              <h3 className="adv-panel-title">
                <span className="adv-panel-title-icon"><BarChart2 size={14} /></span>
                Learning Insights
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { title: 'Reading Support', desc: 'Focus on phonics and reading aloud.', color: 'var(--adv-indigo)' },
                  { title: 'Vocabulary', desc: 'Review power words mastery.', color: 'var(--adv-emerald)' },
                  { title: 'Word Recognition', desc: 'Decoding tricky letters.', color: 'var(--adv-cyan)' }
                ].map((aid, idx) => (
                  <div key={idx} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${aid.color}`, borderRadius: '0 8px 8px 0' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--adv-text)', marginBottom: '0.2rem' }}>{aid.title}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--adv-text-muted)', lineHeight: 1.4 }}>{aid.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.5, delay: 0.2 }}
              className="adv-panel"
            >
              <h3 className="adv-panel-title">
                <span className="adv-panel-title-icon"><Activity size={14} /></span>
                Activity Log
              </h3>
              <div className="adv-timeline">
                <div className="adv-timeline-track">
                  {summary?.recentActivities && summary.recentActivities.length > 0 ? (
                    summary.recentActivities
                      .filter((act) => ["reading_practice", "vocabulary_builder", "word_detective", "story_reading", "sentence_builder", "voice-practice", "reader"].includes(act.activityType))
                      .slice(0, 5)
                      .map((act, i) => (
                      <div key={i} className="adv-timeline-item">
                        <div className="adv-timeline-dot" />
                        <p className="adv-timeline-title" style={{ fontSize: '0.8rem' }}>
                          {act.storyTitle || act.activityType.replace("-", " ").replace("_", " ").toUpperCase()}
                        </p>
                        <p className="adv-timeline-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{formatDate(act.date)}</span>
                          <span className="adv-activity-tag" style={{ fontSize: '0.6rem' }}>
                            {act.score > 0 ? `${act.score}%` : (act.completed ? 'Done' : 'Prog')}
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

        </div>
      </div>
    </div>
  );
}
