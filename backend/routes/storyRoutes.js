const express = require("express");
const router = express.Router();
const Story = require("../models/Story");

// GET all stories with optional filters
router.get("/", async (req, res) => {
  try {
    const { category, level, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (category) filter.category = category;
    if (level) filter.level = level;

    const stories = await Story.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Story.countDocuments(filter);

    res.json({
      stories,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.log("Fetch stories error:", error);
    res.status(500).json({ message: "Failed to fetch stories" });
  }
});

// GET single story
router.get("/:id", async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    res.json(story);
  } catch (error) {
    console.log("Fetch single story error:", error);
    res.status(500).json({ message: "Failed to fetch story" });
  }
});

// POST new story
router.post("/", async (req, res) => {
  try {
    const { title, level, category, content, summary, tags } = req.body;

    if (!title || !level || !category || !content) {
      return res.status(400).json({
        message: "Title, level, category, and content are required",
      });
    }

    const wordCount = content.trim().split(/\s+/).length;
    const estimatedReadingTime = Math.ceil(wordCount / 150);

    const newStory = new Story({
      title,
      level,
      category,
      content,
      summary,
      tags,
      wordCount,
      estimatedReadingTime,
    });

    const savedStory = await newStory.save();
    res.status(201).json(savedStory);
  } catch (error) {
    console.log("Create story error:", error);
    res.status(500).json({ message: "Failed to create story" });
  }
});

module.exports = router;