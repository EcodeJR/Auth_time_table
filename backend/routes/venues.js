import express from 'express';
import { addVenue, getVenues } from '../controllers/venueController.js';
const router = express.Router();

router.post('/add', addVenue);
router.get('/', getVenues);

export default router;
