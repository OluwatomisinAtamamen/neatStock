import { Router } from 'express';
import {
  signup,
  login,
  logout,
  getAuthStatus,
  handlePaymentSuccess,
  verifyPayment,
  completeSignup
} from '../controllers/authController.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/auth-status', getAuthStatus);
router.get('/payment-success', handlePaymentSuccess);
router.get('/verify-payment', verifyPayment);
router.post('/complete-signup', completeSignup);

export default router;