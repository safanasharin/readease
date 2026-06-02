const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: Number, required: true },
  selectedOption: { type: String, default: "" },  // empty string = skipped or timed out
  responseTimeMs: { type: Number, default: 0 },
});

const assessmentSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ageGroup: { type: String, enum: ['explorer', 'beginner', 'intermediate', 'advanced', 'Beginner', 'Intermediate', 'Advanced'], required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  answers: [answerSchema],
  weightedScore: { type: Number },
  completed: { type: Boolean, default: false },
});

module.exports = mongoose.model('AssessmentSession', assessmentSessionSchema);
