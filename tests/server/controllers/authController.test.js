import { jest } from '@jest/globals';
import { 
  signup, 
  login, 
  logout, 
  getAuthStatus,
  handleStripeWebhook,
  handlePaymentSuccess,
  verifyPayment,
  completeSignup
} from '../../../server/controllers/authController.js';
import { getUser, createUser, getBusinessByEmail } from '../../../server/dbConnection.js';
import { mocks } from '../../setup.js';
import Stripe from 'stripe';

describe('Auth Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        firstName: 'John',
        lastName: 'Doe',
        businessName: 'Acme Corp',
        businessEmail: 'john@acme.com',
        username: 'johndoe',
        password: 'securePassword123'
      },
      session: {},
      query: {},
      headers: {
        'stripe-signature': 'test_signature'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      clearCookie: jest.fn()
    };
  });

  describe('signup', () => {
    test('should return checkout URL when signup data is valid', async () => {
      // Arrange
      getUser.mockResolvedValueOnce(null);
      getBusinessByEmail.mockResolvedValueOnce(null);
      const stripeInstance = new Stripe();
      
      // Act
      await signup(req, res);
      
      // Assert
      expect(stripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          metadata: expect.objectContaining({
            firstName: 'John',
            businessName: 'Acme Corp'
          })
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ url: expect.any(String) })
      );
    });
    
    test('should return 400 when user/business already exists', async () => {
      // Arrange
      getUser.mockResolvedValueOnce({ user_id: 123 });
      
      // Act
      await signup(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('already in use') })
      );
    });
  });

  describe('login', () => {
    test('should login successfully with correct credentials', async () => {
      // Arrange
      const user = {
        user_id: 1,
        hashedPassword: 'hashed_password',
        firstName: 'John',
        lastName: 'Doe',
        businessId: 1,
        businessName: 'Test Business',
        is_admin: true
      };
      getUser.mockResolvedValueOnce(user);
      req.body = { username: 'johndoe', password: 'password123' };
      
      // Act
      await login(req, res);
      
      // Assert
      expect(req.session.userId).toBe(1);
      expect(req.session.businessId).toBe(1);
      expect(req.session.isAdmin).toBe(true);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          firstName: 'John',
          message: 'Login successful'
        })
      );
    });
    
    test('should return 401 for invalid credentials', async () => {
      // Arrange
      getUser.mockResolvedValueOnce(null);
      req.body = { username: 'nonexistent', password: 'wrong' };
      
      // Act
      await login(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid username or password' });
    });
  });

  describe('completeSignup', () => {
    test('should complete signup with password', async () => {
      // Arrange
      req.body = {
        session_id: 'cs_test_123',
        password: 'newpassword123'
      };
      getUser.mockResolvedValueOnce(null);
      
      // Act
      await completeSignup(req, res);
      
      // Assert
      expect(createUser).toHaveBeenCalledWith(
        'test@business.com',
        'testuser',
        'hashed_password',
        'Test',
        'User',
        'Test Business'
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Account created successfully'
      });
    });
    
    test('should return 400 if user already exists', async () => {
      // Arrange
      req.body = {
        session_id: 'cs_test_123',
        password: 'newpassword123'
      };
      getUser.mockResolvedValueOnce({ user_id: 123 });
      
      // Act
      await completeSignup(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User already exists'
      });
    });
  });
  
  describe('logout', () => {
    test('should destroy session and clear cookie', async () => {
      // Arrange
      req.session.destroy = jest.fn(callback => callback(null));
      
      // Act
      logout(req, res);
      
      // Assert
      expect(req.session.destroy).toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith('connect.sid');
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });
  });
});