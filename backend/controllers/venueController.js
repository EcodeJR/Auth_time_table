import Venue from "../models/Venue.js";

export const addVenue = async (req, res) => {
  const { name, department, capacity } = req.body;
  try {
    if (!name || !department || !capacity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if venue already exists
    const existingVenue = await Venue.findOne({ name, department });
    if (existingVenue) {
      return res.status(400).json({ message: "Venue already exists in this department" });
    }

    // Save new venue
    const venue = new Venue({ name, department, capacity });
    await venue.save();
    res.status(201).json({ message: "Venue added successfully", venue });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

export const getVenues = async (req, res) => {
  try {
    const venues = await Venue.find();
    res.json(venues);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};
