const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
  title: String,
  description: String,
  customerId: {
    type: String,
    default: null,
  },
  assignedAgent: {
    type: String,
    default: null,
  },
  priority: {
    type: String,
    default: "medium",
  },
  status: {
    type: String,
    default: "open",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Ticket", TicketSchema);
