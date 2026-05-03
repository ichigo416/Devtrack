const express = require("express");
const router = express.Router();
const { getUserRepos } = require("../controllers/githubController");
const { getAnalytics } = require("../controllers/githubController");

router.get("/analytics/:username", getAnalytics);
router.get("/:username", getUserRepos);

module.exports = router;