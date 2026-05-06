const express = require("express");
const router = express.Router();
const Ticket = require("../models/ticket.model");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "cst-dev-secret-change-me";

function readBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return "";
  }
  return authHeader.slice("Bearer ".length).trim();
}

function readUserFromToken(req) {
  const token = readBearerToken(req);
  if (!token) {
    return null;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || typeof payload !== "object") {
      return null;
    }
    return {
      id: typeof payload.sub === "string" ? payload.sub : "",
      role: typeof payload.role === "string" ? payload.role.toLowerCase() : "",
    };
  } catch (err) {
    return null;
  }
}

function getRole(req) {
  const headerRole = (req.headers["x-user-role"] || "").toLowerCase();
  if (headerRole) {
    return headerRole;
  }
  const fromToken = readUserFromToken(req);
  return fromToken?.role || "";
}

function getUserId(req) {
  const headerUserId = req.headers["x-user-id"] || "";
  if (headerUserId) {
    return headerUserId;
  }
  const fromToken = readUserFromToken(req);
  return fromToken?.id || "";
}

function canAccessTicket(req, ticket) {
  const role = getRole(req);
  const userId = getUserId(req);
  if (role === "agent") {
    return true;
  }
  if (role === "customer" && ticket.customerId && ticket.customerId === userId) {
    return true;
  }
  return false;
}

router.post("/", async (req, res) => {
  try {
    const role = getRole(req);
    const body = { ...req.body };

    if (role === "customer") {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Missing user context" });
      }
      body.customerId = userId;
    }

    const ticket = new Ticket(body);
    await ticket.save();
    return res.status(201).json(ticket);
  } catch (err) {
    console.error("Ticket creation error:", err);
    return res.status(500).json({
      error: err.message || "Unknown error",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const role = getRole(req);
    const customerId = req.query.customerId;

    if (role === "customer") {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Missing user context" });
      }
      const tickets = await Ticket.find({ customerId: userId });
      return res.json(tickets);
    }

    if (customerId) {
      const tickets = await Ticket.find({ customerId: String(customerId) });
      return res.json(tickets);
    }

    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    if (!canAccessTicket(req, ticket)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const role = getRole(req);
    const body = { ...req.body };
    if (role === "customer") {
      delete body.customerId;
      delete body.assignedAgent;
      delete body.status;
    }

    const updated = await Ticket.findByIdAndUpdate(req.params.id, body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    if (!canAccessTicket(req, ticket)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: "Ticket deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Agent assigns status / agent name (customer cannot use this route meaningfully without status in body - we blocked status in PUT for customer) */
router.patch("/:id/status", async (req, res) => {
  try {
    if (getRole(req) !== "agent") {
      return res.status(403).json({ error: "Agents only" });
    }
    const { status, assignedAgent } = req.body;
    const update = {};
    if (status) {
      update.status = status;
    }
    if (assignedAgent !== undefined) {
      update.assignedAgent = assignedAgent;
    }
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
