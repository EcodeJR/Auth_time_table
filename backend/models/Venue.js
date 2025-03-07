import mongoose from "mongoose";

const VenueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  capacity: { type: Number, required: true },
  bookedSlots: { 
    type: [{ day: String, time: String }], 
    default: [] 
  } // Track bookings as an array of objects
});

export default mongoose.model("Venue", VenueSchema);
