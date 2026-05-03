const { getUserRepos, getRepoCommits } = require("./githubService");

// ✅ Productivity calculation
const calculateProductivity = (commitMap) => {
  const days = Object.keys(commitMap).length;
  const totalCommits = Object.values(commitMap).reduce((a, b) => a + b, 0);

  const avgPerDay = days === 0 ? 0 : totalCommits / days;

  let score = 0;

  // consistency
  if (days >= 5) score += 30;
  else if (days >= 3) score += 20;
  else score += 10;

  // volume
  if (totalCommits > 50) score += 30;
  else if (totalCommits > 20) score += 20;
  else score += 10;

  // activity
  if (avgPerDay > 5) score += 40;
  else if (avgPerDay > 2) score += 25;
  else score += 10;

  return {
    score,
    days,
    totalCommits,
    avgPerDay: avgPerDay.toFixed(2),
  };
};

// ✅ Insights
const generateInsights = (stats) => {
  const insights = [];

  if (stats.days < 3) {
    insights.push("You are not coding consistently");
  } else if (stats.days > 5) {
    insights.push("Great consistency! You're coding regularly");
  }

  if (stats.avgPerDay < 2) {
    insights.push("Your coding sessions are quite short");
  } else if (stats.avgPerDay > 5) {
    insights.push("Strong coding sessions with high output");
  }

  if (stats.totalCommits > 50) {
    insights.push("High productivity detected 🚀");
  }

  return insights;
};

// ✅ Main function (UPDATED)
const getCommitAnalytics = async (username) => {
  const repos = await getUserRepos(username);

  let commitMap = {};

 for (let repo of repos) {
  const commits = await getRepoCommits(username, repo.name);

  if (!commits || commits.length === 0) continue;

  commits.forEach((commit) => {
    if (!commit.commit || !commit.commit.author) return;

    const date = commit.commit.author.date.split("T")[0];

    if (!commitMap[date]) commitMap[date] = 0;

    commitMap[date]++;
  });
}

  const stats = calculateProductivity(commitMap);
  const insights = generateInsights(stats);

  return {
    commitMap,
    stats,
    insights,
  };
};

module.exports = { getCommitAnalytics };