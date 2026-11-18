const mongoose = require("mongoose");

const childProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  activityType: {
    type: String,
    enum: [
      "letter_tracing",
      "sound_matching",
      "memory_game",
      "shape_sorting",
      "story_reading",
      "letter_detection",
      "sequencing",
      "visual_detective",
      "reading_practice",
      "vocabulary_builder",
      "word_detective",
      "sentence_builder"
    ],
    required: true,
  },
  letter: {
    type: String, // Specifically for letter_tracing
  },
  targetLetter: {
    type: String, // Specifically for letter_detection
  },
  score: {
    type: Number,
    default: 0,
  },
  attempts: {
    type: Number,
    default: 1,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  level: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
  },
  matchesFound: {
    type: Number,
  },
  totalPairs: {
    type: Number,
  },
  shapesSorted: {
    type: Number,
  },
  totalShapes: {
    type: Number,
  },
  correctSelections: {
    type: Number,
  },
  incorrectSelections: {
    type: Number,
  },
  accuracy: {
    type: Number,
  },
  completionTime: {
    type: Number, // In seconds
  },
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Story",
  },
  storyTitle: {
    type: String,
  },
  storyCategory: {
    type: String,
  },
  readingTime: {
    type: Number, // In seconds
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
  xpEarned: {
    type: Number,
    default: 0,
  },
  wordsLearned: {
    type: Number,
    default: 0,
  },
  wordsRead: {
    type: Number,
    default: 0,
  },
  masteredWords: [{
    type: String
  }],
  bestScore: {
    type: Number,
    default: 0,
  },
  currentLevel: {
    type: Number,
    default: 1,
  },
  completedLevels: [{
    type: Number
  }],
  lastPlayedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("ChildProgress", childProgressSchema);
