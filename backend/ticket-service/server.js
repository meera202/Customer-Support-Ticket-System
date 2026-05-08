const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const ticketRoutes = require("./routes/ticket.routes");

const app = express();

// Middleware (allow auth headers from Angular dev server on :4200)
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-User-Id",
      "X-User-Role",
    ],
  })
);
app.use(express.json());

app.get("/health", (_req, res) => res.status(200).send("ok"));

// Routes
app.use("/api/tickets", ticketRoutes);

// MongoDB connection — listen only after DB is ready (avoid failed saves on cold start)
const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ticketDB";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected (ticketDB)");
    app.listen(PORT, () => {
      console.log(`Ticket Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });