const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const notificationRoutes = require("./routes/notification.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", notificationRoutes);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cstNotifications";
const PORT = Number(process.env.PORT) || 5003;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Notification service MongoDB connected"))
  .catch((err) => console.error("Notification MongoDB error:", err));

app.listen(PORT, () => console.log(`Notification Service running on ${PORT}`));
