import express from 'express';
import { verifyAdmin, getUnverifiedAdmins } from '../controllers/adminController.js';
const router = express.Router();

router.get('/unverified', getUnverifiedAdmins);
router.post('/verify/:id', verifyAdmin);

export default router;
