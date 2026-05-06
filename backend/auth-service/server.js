const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cstAuth";
const PORT = Number(process.env.PORT) || 5001;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Auth service MongoDB connected"))
  .catch((err) => console.error("Auth MongoDB error:", err));

app.listen(PORT, () => {
  console.log(`Auth service listening on ${PORT}`);
});
