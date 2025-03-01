// 📌 models/Venue.js
const VenueSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  department: String,
  bookedSlots: [{ day: String, time: String }]
});
export const Venue = mongoose.model('Venue', VenueSchema);