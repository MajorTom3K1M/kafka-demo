const mongoose = require("mongoose");
const sharedMiddleware = require("../utils/kafka");

// Schema for MongoDB
const ClickLogSchema = mongoose.Schema({
  type: String,
  userId: String,
  timestamp: Date,
  location: String,
});

sharedMiddleware(ClickLogSchema, "click_events");

module.exports = mongoose.model("clicks", ClickLogSchema);
