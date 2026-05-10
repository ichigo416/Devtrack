const express = require("express");
const router = express.Router();
const { getUserRepos, getAnalytics, createGoal, getGoals } = require("../controllers/githubController");

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Login required" });
};

router.get("/analytics/:username", requireAuth, getAnalytics);
router.get("/goals/:username", requireAuth, getGoals);
router.post("/goals/:username", requireAuth, createGoal);
router.get("/:username", requireAuth, getUserRepos);

module.exports = router;