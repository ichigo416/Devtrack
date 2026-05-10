const mongoose = require("mongoose");

const cacheSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  data: { type: Object, required: true },
  cachedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Cache", cacheSchema); 