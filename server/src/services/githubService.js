const axios = require("axios");
require("dotenv").config();
console.log("TOKEN:", process.env.GITHUB_TOKEN); 
const BASE_URL = "https://api.github.com";

const headers = {
  headers: {
    Authorization: `token ${process.env.GITHUB_TOKEN}`, // 🔥 fix
    "User-Agent": "devtrack-app",
    Accept: "application/vnd.github+json",
  },
};

const getUserRepos = async (username) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/users/${username}/repos?per_page=10`,
      headers
    );
    return res.data;
  } catch (err) {
    console.log("FULL ERROR:", err.response?.data || err.message); // 🔥 THIS
    return [];
  }
};

const getRepoCommits = async (username, repo) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/repos/${username}/${repo}/commits?per_page=5`,
      headers
    );
    return res.data;
  } catch (err) {
    console.log("Skipping repo:", repo);
    return [];
  }
};

module.exports = { getUserRepos, getRepoCommits };