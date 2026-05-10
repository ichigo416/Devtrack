const axios = require("axios");
const { getCommitAnalytics } = require("../services/analyticsService");
const Goal = require("../models/Goal");

const getUserRepos = async (req, res) => {
  try {
    const { username } = req.params;
    const token = req.user.accessToken;
    const response = await axios.get(
      `https://api.github.com/users/${username}/repos?per_page=100`,
      { headers: { Authorization: `token ${token}`, "User-Agent": "devtrack-app" } }
    );
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch repos" });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const { username } = req.params;
    const token = req.user.accessToken;
    const data = await getCommitAnalytics(username, token);
    res.json(data);
  } catch (err) {
    console.error("ANALYTICS ERROR:", err.message);
    res.json({ commitMap: {}, stats: null, insights: [], burnout: [], percentile: null });
  }
};

const createGoal = async (req, res) => {
  try {
    const { username } = req.params;
    const { type, target, deadline, createdAt } = req.body;
    const goal = new Goal({ username, type, target, deadline, createdAt });
    await goal.save();
    res.json(goal);
  } catch (err) {
    console.error("GOAL SAVE ERROR:", err.message);
    res.status(500).json({ error: "Failed to save goal" });
  }
};

const getGoals = async (req, res) => {
  try {
    const { username } = req.params;
    const goals = await Goal.find({ username }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    console.error("GOAL FETCH ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};

module.exports = { getUserRepos, getAnalytics, createGoal, getGoals };