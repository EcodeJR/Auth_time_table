import mongoose from "mongoose";

const Venue = new mongoose.Schema({
  name: String,
  capacity: Number,
  booked: { type: Boolean, default: false }, // Track booking status
});

export default mongoose.model("Venue", Venue);
