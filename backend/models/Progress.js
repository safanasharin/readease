const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      default: null,
    },

    storyTitle: {
      type: String,
      default: "Custom Reading",
    },

    readingTime: {
      type: Number,
      default: 0,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    score: {
      type: Number,
      default: 0,
    },

    letter: {
      type: String,
      default: null,
    },

    activityType: {
      type: String,
      enum: ["reader", "voice-practice", "letter_tracing"],
      required: true,
    },

    contentSource: {
      type: String,
      enum: ["story", "custom"],
      default: "custom",
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", progressSchema);