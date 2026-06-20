import express from 'express';
import { adminRegister, adminLogin, customerJoin, getMe } from '../controllers/authController.js';
import auth from '../middleware/auth.js';
const router = express.Router();
router.post('/admin/register', adminRegister);
router.post('/admin/login', adminLogin);
router.post('/customer/join', customerJoin);
router.get('/me', auth, getMe);
export default router;