const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");
const auth = require("../middleware/auth");
const Story = require("../models/Story");
const mongoose = require("mongoose");

// @route   POST api/activities
// @desc    Save user activity (reader/voice session)
router.post("/", auth, async (req, res) => {
  try {
    const { storyId, type, readingTime, score, status } = req.body;
    const userId = req.user.id;

    // Validate story
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    const activityData = {
      userId,
      storyId,
      type,
      readingTime: Number(readingTime || 0),
      score: Number(score || 0),
      status: status || "completed",
      category: story.category,
      level: story.level,
      wordCount: story.wordCount,
    };

    const activity = new Activity(activityData);
    await activity.save();

    res.status(201).json({
      message: "Activity saved successfully",
      activity,
    });
  } catch (error) {
    console.error("Save activity error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET api/activities/:userId
// @desc    Get user activities history
router.get("/:userId", auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const activities = await Activity.find({ userId: req.params.userId })
      .populate("storyId", "title category level")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(activities);
  } catch (error) {
    console.error("Fetch activities error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET api/activities/:userId/weekly
// @desc    Get weekly summary
router.get("/:userId/weekly", auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyStats = await Activity.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.params.userId),
          createdAt: { $gte: oneWeekAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" },
          },
          totalSessions: { $sum: 1 },
          totalTime: { $sum: "$readingTime" },
          avgScore: { $avg: "$score" },
          categories: { $addToSet: "$category" },
        },
      },
    ]);

    res.json(weeklyStats);
  } catch (error) {
    console.error("Weekly stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

