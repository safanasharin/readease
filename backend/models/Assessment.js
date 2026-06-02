const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      unique: true,
    },

    score: {
      type: Number,
      default: 0,
    },

    dyslexiaLevel: {
      type: String,
      enum: ["Typical", "Mild", "Moderate", "Severe"],
      default: "Mild",
      index: true,
    },

    completedSections: {
      type: [String],
      default: [],
    },

    recommendations: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  }
);

module.exports = mongoose.model("Assessment", assessmentSchema);

