import express from 'express';
import { submitJob, getSessionJobs, startNextJob, completeJob, getMyJob, requestEmergency, resolveEmergency, compareAlgorithms, exitQueue } from '../controllers/jobController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/submit', auth, submitJob);
router.get('/session/:id', auth, getSessionJobs);
router.patch('/session/:id/start-next', auth, startNextJob);
router.patch('/:jobId/complete', auth, completeJob);
router.get('/my', auth, getMyJob);
router.delete('/my', auth, exitQueue);
router.post('/emergency', auth, requestEmergency);
router.patch('/emergency/:emergencyId/resolve', auth, resolveEmergency);
router.get('/session/:id/compare', auth, compareAlgorithms);

export default router;