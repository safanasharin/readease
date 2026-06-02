const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    textTitle: {
      type: String,
      default: "",
    },
    textContent: {
      type: String,
      required: true,
    },
    readingTime: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      default: "easy",
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("History", historySchema);
