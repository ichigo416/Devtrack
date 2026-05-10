const axios = require("axios");
const Cache = require("../models/Cache");

const CACHE_TTL_MINUTES = 30;

const getHeaders = (token) => ({
  headers: {
    Authorization: `token ${token}`,
    "User-Agent": "devtrack-app",
    Accept: "application/vnd.github+json",
  },
});

const getUserRepos = async (username, token) => {
  try {
    const res = await axios.get(
      `https://api.github.com/users/${username}/repos?per_page=100`,
      getHeaders(token)
    );
    return res.data;
  } catch (err) {
    console.log("Repos error:", err.message);
    return [];
  }
};

const getRepoCommits = async (username, repo, token) => {
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${username}/${repo}/commits?per_page=100`,
      getHeaders(token)
    );
    return res.data;
  } catch (err) {
    return [];
  }
};

const calculateProductivity = (commitMap) => {
  const days = Object.keys(commitMap).length;
  const totalCommits = Object.values(commitMap).reduce((a, b) => a + b, 0);
  const avgPerDay = days === 0 ? 0 : totalCommits / days;

  let score = 0;
  if (days >= 5) score += 30; else if (days >= 3) score += 20; else score += 10;
  if (totalCommits > 50) score += 30; else if (totalCommits > 20) score += 20; else score += 10;
  if (avgPerDay > 5) score += 40; else if (avgPerDay > 2) score += 25; else score += 10;

  let streak = 0;
  const cursor = new Date();
  while (true) {
    const d = cursor.toISOString().split("T")[0];
    if (commitMap[d]) { streak++; cursor.setDate(cursor.getDate() - 1); }
    else break;
  }

  return { score, days, totalCommits, avgPerDay: avgPerDay.toFixed(2), streak };
};

const generateInsights = (stats) => {
  const insights = [];
  if (stats.days < 3) insights.push("Try to push something every day to build consistency");
  else if (stats.days > 5) insights.push("Great consistency! You're coding regularly");
  if (stats.avgPerDay < 2) insights.push("Try deeper focus blocks — your sessions are short");
  else if (stats.avgPerDay > 5) insights.push("Strong coding sessions with high output 💪");
  if (stats.totalCommits > 50) insights.push("High productivity detected 🚀");
  if (stats.streak >= 7) insights.push(`🔥 ${stats.streak}-day streak! Keep it going!`);
  return insights;
};

const detectBurnout = (commitMap) => {
  const alerts = [];
  const entries = Object.entries(commitMap).sort(([a], [b]) => a.localeCompare(b));
  let heavyDays = 0;
  entries.forEach(([, count]) => {
    if (count >= 8) heavyDays++; else heavyDays = 0;
    if (heavyDays >= 3) alerts.push("You've been pushing very hard for several days — consider a break");
  });
  const today = new Date();
  const twoWeeksAgo = new Date(); twoWeeksAgo.setDate(today.getDate() - 14);
  const recentDays = entries.filter(([d]) => new Date(d) >= twoWeeksAgo);
  if (recentDays.length === 0 && entries.length > 0)
    alerts.push("No commits in 14 days — getting back on track?");
  const last7 = entries.filter(([d]) => {
    const w = new Date(); w.setDate(today.getDate() - 7); return new Date(d) >= w;
  });
  const last7Avg = last7.length === 0 ? 0 : last7.reduce((s, [, c]) => s + c, 0) / 7;
  const allAvg = entries.length === 0 ? 0 : entries.reduce((s, [, c]) => s + c, 0) / entries.length;
  if (allAvg > 2 && last7Avg < allAvg * 0.4)
    alerts.push("Your commit activity dropped significantly this week");
  return [...new Set(alerts)];
};

const estimatePercentile = (score) => {
  if (score >= 90) return 5;
  if (score >= 75) return 20;
  if (score >= 60) return 40;
  if (score >= 45) return 60;
  return 80;
};

const getBestDayAndHour = (allCommits) => {
  const dayCounts = {}; const hourCounts = {};
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  allCommits.forEach((commit) => {
    if (!commit.commit?.author?.date) return;
    const d = new Date(commit.commit.author.date);
    const day = dayNames[d.getDay()];
    const hour = d.getHours();
    dayCounts[day] = (dayCounts[day] || 0) + 1;
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const bestDay = Object.entries(dayCounts).sort(([,a],[,b]) => b - a)[0]?.[0] || null;
  const bestHourRaw = Object.entries(hourCounts).sort(([,a],[,b]) => b - a)[0]?.[0];
  const bestHour = bestHourRaw !== undefined
    ? `${parseInt(bestHourRaw) % 12 || 12}${parseInt(bestHourRaw) >= 12 ? "pm" : "am"}`
    : null;
  return { bestDay, bestHour };
};

const getMonthOverMonth = (commitMap) => {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];
  let thisMonth = 0; let lastMonth = 0;
  Object.entries(commitMap).forEach(([date, count]) => {
    if (date >= thisMonthStart) thisMonth += count;
    else if (date >= lastMonthStart && date <= lastMonthEnd) lastMonth += count;
  });
  const diff = lastMonth === 0 ? 100 : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  return { thisMonth, lastMonth, diff };
};

const getAchievements = (stats, repos, allCommits) => {
  const achievements = [];
  if (stats.streak >= 7) achievements.push({ id: "on_fire", emoji: "🔥", title: "On Fire", desc: `${stats.streak}-day commit streak` });
  const lateNight = allCommits.filter(c => {
    const h = new Date(c.commit?.author?.date).getHours(); return h >= 22 || h <= 4;
  });
  if (lateNight.length >= 10) achievements.push({ id: "night_owl", emoji: "🌙", title: "Night Owl", desc: "10+ commits after midnight" });
  if (stats.totalCommits >= 100) achievements.push({ id: "prolific", emoji: "🚀", title: "Prolific", desc: "100+ total commits" });
  const langs = new Set(repos.map(r => r.language).filter(Boolean));
  if (langs.size >= 4) achievements.push({ id: "polyglot", emoji: "💪", title: "Polyglot", desc: `${langs.size} languages used` });
  if (stats.streak >= 30) achievements.push({ id: "unstoppable", emoji: "⚡", title: "Unstoppable", desc: "30-day streak!" });
  if (stats.totalCommits >= 500) achievements.push({ id: "legend", emoji: "👑", title: "Legend", desc: "500+ commits" });
  return achievements;
};

const fetchAndComputeAnalytics = async (username, token) => {
  const repos = await getUserRepos(username, token);
  let commitMap = {};
  let allCommits = [];

  for (let repo of repos) {
    const commits = await getRepoCommits(username, repo.name, token);
    if (!commits || commits.length === 0) continue;
    commits.forEach((commit) => {
      if (!commit.commit?.author) return;
      const date = commit.commit.author.date.split("T")[0];
      commitMap[date] = (commitMap[date] || 0) + 1;
      allCommits.push(commit);
    });
  }

  const stats = calculateProductivity(commitMap);
  const insights = generateInsights(stats);
  const burnout = detectBurnout(commitMap);
  const percentile = estimatePercentile(stats.score);
  const { bestDay, bestHour } = getBestDayAndHour(allCommits);
  const monthOverMonth = getMonthOverMonth(commitMap);
  const achievements = getAchievements(stats, repos, allCommits);
  const langMap = {};
  repos.forEach(r => {
    if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
  });

  return { commitMap, stats, insights, burnout, percentile, bestDay, bestHour, monthOverMonth, achievements, langMap };
};

// ✅ Main export with caching
const getCommitAnalytics = async (username, token) => {
  try {
    // Check cache
    const cached = await Cache.findOne({ username });
    if (cached) {
      const ageMinutes = (Date.now() - new Date(cached.cachedAt).getTime()) / 60000;
      if (ageMinutes < CACHE_TTL_MINUTES) {
        console.log(`✅ Cache hit for ${username} (${Math.round(ageMinutes)}m old)`);
        return cached.data;
      }
      console.log(`♻️ Cache expired for ${username}, refreshing...`);
    }

    // Fetch fresh data
    console.log(`🔄 Fetching fresh data for ${username}`);
    const data = await fetchAndComputeAnalytics(username, token);

    // Save to cache (upsert)
    await Cache.findOneAndUpdate(
      { username },
      { data, cachedAt: new Date() },
      { upsert: true, new: true }
    );

    return data;
  } catch (err) {
    console.error("Cache error, falling back to fresh fetch:", err.message);
    return fetchAndComputeAnalytics(username, token);
  }
};

// Used by squad leaderboard — gets cached stats for any user
const getPublicStats = async (username) => {
  try {
    const cached = await Cache.findOne({ username });
    if (cached) return cached.data.stats || null;
    return null;
  } catch {
    return null;
  }
};

module.exports = { getCommitAnalytics, getPublicStats };