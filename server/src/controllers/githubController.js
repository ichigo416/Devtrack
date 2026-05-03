const axios = require("axios");
const { getCommitAnalytics } = require("../services/analyticsService");

// ✅ Fetch GitHub repos
const getUserRepos = async (req, res) => {
  try {
    const { username } = req.params;

    const response = await axios.get(
      `https://api.github.com/users/${username}/repos`
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch repos" });
  }
};

// ✅ Analytics
const getAnalytics = async (req, res) => {
  try {
    const { username } = req.params;

    const data = await getCommitAnalytics(username);

    res.json(data);
  } catch (err) {
    console.error("ANALYTICS ERROR:", err.message);

    // 👇 RETURN SAFE FALLBACK
    res.json({
      commitMap: {},
      stats: null,
      insights: [],
    });
  }
};

// ✅ EXPORT CORRECT FUNCTIONS
module.exports = { getUserRepos, getAnalytics };