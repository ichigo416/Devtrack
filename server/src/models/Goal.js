const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
  username: { type: String, required: true },
  type: { type: String, enum: ["weekly_commits", "streak"], required: true },
  target: { type: Number, required: true },
  deadline: { type: String },
  createdAt: { type: String },
});

module.exports = mongoose.model("Goal", goalSchema); 