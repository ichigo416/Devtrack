const Squad = require("../models/Squad");
const { getPublicStats } = require("../services/analyticsService");
const crypto = require("crypto");

// Generate a random 6-char invite code
const generateCode = () => crypto.randomBytes(3).toString("hex").toUpperCase();

// Create squad
const createSquad = async (req, res) => {
  try {
    const { name } = req.body;
    const user = req.user;
    if (!name) return res.status(400).json({ error: "Squad name required" });

    const inviteCode = generateCode();
    const squad = await Squad.create({
      name,
      inviteCode,
      createdBy: user.username,
      members: [{ username: user.username, avatarUrl: user.avatarUrl }],
    });
    res.json(squad);
  } catch (err) {
    console.error("CREATE SQUAD ERROR:", err.message);
    res.status(500).json({ error: "Failed to create squad" });
  }
};

// Join squad by invite code
const joinSquad = async (req, res) => {
  try {
    const { code } = req.body;
    const user = req.user;
    if (!code) return res.status(400).json({ error: "Invite code required" });

    const squad = await Squad.findOne({ inviteCode: code.toUpperCase() });
    if (!squad) return res.status(404).json({ error: "Squad not found" });

    const alreadyIn = squad.members.find(m => m.username === user.username);
    if (alreadyIn) return res.json(squad); // already a member, just return

    squad.members.push({ username: user.username, avatarUrl: user.avatarUrl });
    await squad.save();
    res.json(squad);
  } catch (err) {
    console.error("JOIN SQUAD ERROR:", err.message);
    res.status(500).json({ error: "Failed to join squad" });
  }
};

// Get my squads
const getMySquads = async (req, res) => {
  try {
    const username = req.user.username;
    const squads = await Squad.find({ "members.username": username });
    res.json(squads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch squads" });
  }
};

// Get squad leaderboard
const getSquadLeaderboard = async (req, res) => {
  try {
    const { squadId } = req.params;
    const squad = await Squad.findById(squadId);
    if (!squad) return res.status(404).json({ error: "Squad not found" });

    // Check if requester is a member
    const isMember = squad.members.find(m => m.username === req.user.username);
    if (!isMember) return res.status(403).json({ error: "Not a member of this squad" });

    // Get cached stats for each member
    const leaderboard = await Promise.all(
      squad.members.map(async (member) => {
        const stats = await getPublicStats(member.username);
        return {
          username: member.username,
          avatarUrl: member.avatarUrl,
          joinedAt: member.joinedAt,
          score: stats?.score || 0,
          totalCommits: stats?.totalCommits || 0,
          streak: stats?.streak || 0,
          days: stats?.days || 0,
          hasData: !!stats,
        };
      })
    );

    // Sort by score descending
    leaderboard.sort((a, b) => b.score - a.score);

    res.json({
      squad: { id: squad._id, name: squad.name, inviteCode: squad.inviteCode, createdBy: squad.createdBy },
      leaderboard,
    });
  } catch (err) {
    console.error("LEADERBOARD ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

module.exports = { createSquad, joinSquad, getMySquads, getSquadLeaderboard }; 