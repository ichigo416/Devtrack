const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  username: String,
  avatarUrl: String,
  joinedAt: { type: Date, default: Date.now },
});

const squadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  inviteCode: { type: String, required: true, unique: true },
  createdBy: { type: String, required: true },
  members: [memberSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Squad", squadSchema);