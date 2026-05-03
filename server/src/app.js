const express = require("express");
const connectDB = require("./config/db");
const githubRoutes = require("./routes/githubRoutes");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ CORS FIX (IMPORTANT)
app.use(cors());

connectDB();

app.use(express.json());

app.use("/api/github", githubRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});