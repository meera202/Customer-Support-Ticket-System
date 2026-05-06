const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  ticketId: { type: String },
  message: { type: String, required: true },
  subject: { type: String, default: "Support update" },
  fromAgent: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
