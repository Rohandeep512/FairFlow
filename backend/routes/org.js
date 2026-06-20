import express from 'express';
import { createOrg, getMyOrgs, deleteOrg, getOrgAiRecommendation } from '../controllers/orgController.js';
import auth from '../middleware/auth.js';
const router = express.Router();
router.post('/', auth, createOrg);
router.get('/', auth, getMyOrgs);
router.delete('/:id', auth, deleteOrg);
router.post('/ai-advise', auth, getOrgAiRecommendation);
export default router;