const express = require("express");
const router = express.Router();
const { createSquad, joinSquad, getMySquads, getSquadLeaderboard } = require("../controllers/squadController");

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Login required" });
};

router.post("/create", requireAuth, createSquad);
router.post("/join", requireAuth, joinSquad);
router.get("/mine", requireAuth, getMySquads);
router.get("/:squadId/leaderboard", requireAuth, getSquadLeaderboard);

module.exports = router;