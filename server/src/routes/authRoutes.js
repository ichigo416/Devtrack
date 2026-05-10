const express = require("express");
const router = express.Router();
const passport = require("passport");
require("dotenv").config();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

router.get("/github", passport.authenticate("github", { scope: ["user", "repo"] }));

router.get("/github/callback",
  passport.authenticate("github", { failureRedirect: `${CLIENT_URL}/login` }),
  (req, res) => res.redirect(`${CLIENT_URL}/dashboard`)
);

router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      username: req.user.username,
      displayName: req.user.displayName,
      avatarUrl: req.user.avatarUrl,
      profileUrl: req.user.profileUrl,
    });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

router.post("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy();
    res.json({ success: true });
  });
});

module.exports = router;