const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const engineRoutes = require('./routes/engineRoutes');
const storyRoutes = require("./routes/storyRoutes");
const progressRoutes = require("./routes/progressRoutes");
const activityRoutes = require("./routes/activityRoutes");
const authRoutes = require("./routes/authRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
require("dotenv").config();


const app = express();

console.log("Backend file is running");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/stories", storyRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/engine", engineRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("DB connection error:", err);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});