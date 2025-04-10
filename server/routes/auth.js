import { Router } from 'express';
import {
  signup,
  login,
  logout,
  getAuthStatus
} from '../controllers/authController.js';

const router = Router();

// Signup route
router.post('/signup', signup);

// Login route
router.post('/login', login);

// Logout route
router.post('/logout', logout);

// Auth status route
router.get('/auth-status', getAuthStatus);

export default router;