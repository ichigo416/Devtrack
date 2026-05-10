const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  displayName: { type: String },
  avatarUrl: { type: String },
  profileUrl: { type: String },
  accessToken: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);