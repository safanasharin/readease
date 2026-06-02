const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 4,
      max: 14,
    },
    ageGroup: {
      type: String,
      enum: ["explorer", "beginner", "intermediate", "advanced", "Beginner", "Intermediate", "Advanced"],
    },
    // Assessment flow flags
    assessmentCompleted: { type: Boolean, default: false },
    // Store each completed assessment for trend analysis
    assessmentHistory: [
      {
        date: { type: Date, default: Date.now },
        score: Number,
        dyslexiaLevel: { type: String, enum: ["Mild", "Moderate", "Severe"] },
        weakAreas: [String],
      },
    ],
    // Analytics from the most recent assessment (category breakdown, etc.)
    assessmentAnalytics: {
      type: Object,
    },
    // User‑customizable accessibility preferences – overrides severity defaults
    accessibilityPreferences: {
      fontSize: { type: Number, default: null },
      lineSpacing: { type: Number, default: null },
      overlayColor: { type: String, default: null },
      ttsEnabled: { type: Boolean, default: null },
      dyslexicFontEnabled: { type: Boolean, default: null },
    },
    hasCompletedAssessment: { type: Boolean, default: false }, // kept for backward compatibility
    screeningCompleted: {
      type: Boolean,
      default: false,
    },
    assessmentCompletedAt: { type: Date, default: null },
    dyslexiaLevel: {
      type: String,
      enum: ["severe", "moderate", "mild", "Severe", "Moderate", "Mild"], // Added lowercase for new system
      default: null,
    },
    assessmentScore: {
      type: Number,
      default: 0,
    },
    assessmentStatus: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
    riskLevel: {
      type: String,
      enum: ["level1", "level2", "level3"],
      default: "level1",
    },
    supportLevel: {
      type: String,
      enum: ["emerging_support", "guided_support", "intensive_support"],
      default: "emerging_support",
    },
    skillProgress: {
      phonologicalAwareness: { type: Number, default: 0 },
      visualProcessing: { type: Number, default: 0 },
      workingMemory: { type: Number, default: 0 },
      attentionControl: { type: Number, default: 0 },
      fineMotorSkills: { type: Number, default: 0 },
      languageComprehension: { type: Number, default: 0 }
    },
    dailySession: {
      totalMinutes: { type: Number, default: 0 },
      completedActivities: { type: Number, default: 0 },
      lastPlayed: { type: Date, default: null }
    },
    supportProfile: {
      supportLevel: { type: String, default: "emerging_support" },
      strengths: { type: [String], default: [] },
      weakSkills: { type: [String], default: [] },
      recommendedActivities: { type: [String], default: [] }
    },
    interventionProfile: {
      type: Object,
      default: {
        aids: {},
        uiSettings: {},
      },
    },
    completedActivities: {
      type: [String],
      default: [],
    },
    readingMetrics: {
      type: Object,
      default: { speed: 0, accuracy: 0, comprehension: 0 },
    },
    writingMetrics: {
      type: Object,
      default: { spellingAccuracy: 0, structuredWriting: 0 },
    },
    preferredAids: {
      type: [String],
      default: [],
    },
    learningPreferences: {
      type: Object,
      default: {},
    },
    dailyProgress: {
      type: Object,
      default: {},
    },
    exerciseHistory: {
      type: [{
        activityId: String,
        xpEarned: { type: Number, default: 0 },
        starsEarned: { type: Number, default: 0 },
        badge: { type: String, default: null },
        analytics: { type: Object, default: {} },
        completedAt: { type: Date, default: Date.now },
      }],
      default: [],
    },
    gamification: {
      totalXP: { type: Number, default: 0 },
      totalStars: { type: Number, default: 0 },
      badges: { type: [String], default: [] },
      level: { type: Number, default: 1 },
      streak: { type: Number, default: 0 },
      lastActivityDate: { type: Date, default: null },
    },
    improvementMetrics: {
      type: Object,
      default: {},
    },
    recommendedActivities: {
      type: [String],
      default: [],
    },
    // === Assessment detail scores ===
    readingScore: { type: Number, default: 0 },
    writingScore: { type: Number, default: 0 },
    phonicsScore: { type: Number, default: 0 },
    
    // === Strengths and weaknesses from assessment ===
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    
    // === Assessment date ===
    assessmentDate: { type: Date, default: null },
    
    // === Progress tracking ===
    progressPercentage: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    
    // === Login tracking ===
    lastLogin: { type: Date, default: null },
    
    // === Intervention plan ===
    interventionPlan: { type: Object, default: {} },
    accessibilitySettings: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

// Pre‑save hook that derives ageGroup from age
// Uses async style (no `next` param) — required for Mongoose 7+
userSchema.pre("save", async function () {
  if (this.isModified("age") || this.isNew) {
    if (this.age >= 4 && this.age <= 5) {
      this.ageGroup = "explorer";
    } else if (this.age >= 6 && this.age <= 8) {
      this.ageGroup = "beginner";
    } else if (this.age >= 9 && this.age <= 11) {
      this.ageGroup = "intermediate";
    } else if (this.age >= 12 && this.age <= 14) {
      this.ageGroup = "advanced";
    }
  }
});

module.exports = mongoose.model("User", userSchema);