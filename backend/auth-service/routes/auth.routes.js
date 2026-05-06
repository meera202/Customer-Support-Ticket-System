const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "cst-dev-secret-change-me";
const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: "username, password, and role are required" });
    }
    if (!["customer", "agent"].includes(role)) {
      return res.status(400).json({ error: "role must be customer or agent" });
    }

    const existing = await User.findOne({ username: String(username).toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const hash = await bcrypt.hash(String(password), SALT_ROUNDS);
    const user = await User.create({
      username: String(username).toLowerCase(),
      password: hash,
      role,
    });

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: {
        id: String(user._id),
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    const user = await User.findOne({ username: String(username).toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: String(user._id),
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Login failed" });
  }
});

module.exports = router;
