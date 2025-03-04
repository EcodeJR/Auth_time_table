import Venue from '../models/Venue.js';

export const addVenue = async (req, res) => {
  const { name, department } = req.body;
  try {
    const venue = new Venue({ name, department, bookedSlots: [] });
    await venue.save();
    res.status(201).json(venue);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error)
  }
};

export const getVenues = async (req, res) => {
  try {
    const venues = await Venue.find();
    res.json(venues);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error)
  }
};
