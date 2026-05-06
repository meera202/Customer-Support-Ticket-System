const express = require("express");
const router = express.Router();
const Notification = require("../models/notification.model");

function getRole(req) {
  return (req.headers["x-user-role"] || "").toLowerCase();
}

function getUserId(req) {
  return req.headers["x-user-id"] || "";
}

router.post("/notify", async (req, res) => {
  try {
    const { ticketId, message, customerId, subject, fromAgent } = req.body;
    if (!message || !customerId) {
      return res.status(400).json({ error: "message and customerId are required" });
    }

    const doc = await Notification.create({
      ticketId: ticketId || null,
      message,
      customerId: String(customerId),
      subject: subject || "Support update",
      fromAgent: fromAgent || null,
    });

    return res.status(201).json({ message: "Notification saved", notification: doc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to save notification" });
  }
});

router.get("/notifications", async (req, res) => {
  try {
    const role = getRole(req);
    let filter = {};

    if (role === "customer") {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Missing user context" });
      }
      filter = { customerId: userId };
    } else if (req.query.customerId) {
      filter = { customerId: String(req.query.customerId) };
    }

    const items = await Notification.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
