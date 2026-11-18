export const secondAgeDashboardData = {
  studentName: "Alex",
  dyslexiaLevel: "Moderate",
  learningLevel: 3,
  xp: 1250,
  streak: 14,
  progress: {
    reading: 75,
    writing: 68,
    comprehension: 80,
    memory: 72,
  },
  skills: [
    { name: "Phonics Skills", percentage: 85 },
    { name: "Vocabulary Building", percentage: 70 },
    { name: "Sentence Formation", percentage: 65 },
    { name: "Reading Fluency", percentage: 80 },
    { name: "Word Recognition", percentage: 90 },
  ],
  recommendedActivities: [
    {
      id: "sa_activity_1",
      name: "Story Explorer",
      difficulty: "Medium",
      estimatedTime: "15 min",
      type: "reading"
    },
    {
      id: "sa_activity_2",
      name: "Word Builder Challenge",
      difficulty: "Hard",
      estimatedTime: "20 min",
      type: "writing"
    },
    {
      id: "sa_activity_3",
      name: "Reading Race",
      difficulty: "Medium",
      estimatedTime: "10 min",
      type: "fluency"
    },
    {
      id: "sa_activity_4",
      name: "Memory Match Advanced",
      difficulty: "Easy",
      estimatedTime: "5 min",
      type: "memory"
    },
    {
      id: "sa_activity_5",
      name: "Sentence Detective",
      difficulty: "Hard",
      estimatedTime: "15 min",
      type: "comprehension"
    }
  ],
  weeklyPerformance: {
    activitiesCompleted: 24,
    timeSpentLearning: "3h 45m",
    xpEarned: 850,
    accuracyPercentage: 88,
    days: [
      { day: "Mon", score: 80 },
      { day: "Tue", score: 90 },
      { day: "Wed", score: 85 },
      { day: "Thu", score: 95 },
      { day: "Fri", score: 100 },
      { day: "Sat", score: 70 },
      { day: "Sun", score: 0 }
    ]
  },
  achievements: [
    { id: "badge_1", name: "Reading Star", locked: false, icon: "⭐" },
    { id: "badge_2", name: "Vocabulary Master", locked: false, icon: "📚" },
    { id: "badge_3", name: "Story Explorer", locked: false, icon: "🗺️" },
    { id: "badge_4", name: "Consistency Champion", locked: false, icon: "🔥" },
    { id: "badge_5", name: "Memory Wizard", locked: true, icon: "🧠" }
  ],
  dailyChallenge: {
    title: "Read 3 short stories",
    progress: 1,
    target: 3,
    rewardXP: 100
  }
};
