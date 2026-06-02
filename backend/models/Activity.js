const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      required: true,
    },
    type: {
      type: String,
      enum: ["reader", "voice"],
      required: true,
    },
    readingTime: {
      type: Number,
      default: 0, // in minutes
    },
    score: {
      type: Number,
      default: 0, // percentage for voice
    },
    status: {
      type: String,
      enum: ["started", "completed", "abandoned"],
      default: "started",
    },
    category: {
      type: String,
    },
    level: {
      type: String,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for queries
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model("Activity", activitySchema);

