import express from 'express';
import { createSession, getSession, endSession, getAIRecommendation, getPrediction } from '../controllers/sessionController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createSession);
router.get('/:id', auth, getSession);
router.patch('/:id/end', auth, endSession);
router.get('/:id/ai-recommendation', auth, getAIRecommendation);
router.get('/:id/predict', auth, getPrediction);

export default router;