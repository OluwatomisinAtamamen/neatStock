import { jest } from '@jest/globals';
import { 
  getBusinessProfile, 
  updateBusinessProfile, 
  getStaff, 
  addStaff,
  updateStaffAdmin,
  deleteStaff,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  cancelSubscription
} from '../../../server/controllers/settingsController.js';
import { mocks } from '../../setup.js';

describe('Settings Controller', () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      session: {
        businessId: 1,
        userId: 1,
        isAdmin: true,
        destroy: jest.fn(cb => cb())
      },
      body: {},
      params: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // Business Profile Tests
  describe('Business Profile', () => {
    test('should get business profile', async () => {
      // Arrange
      const mockBusinessData = {
        businessName: 'Test Business',
        businessEmail: 'test@example.com',
        add1: '123 Test St'
      };
      
      mocks.pool.query.mockResolvedValueOnce({
        rows: [mockBusinessData],
        rowCount: 1
      });
      
      // Act
      await getBusinessProfile(req, res);
      
      // Assert
      expect(mocks.pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'), 
        [1]
      );
      expect(res.json).toHaveBeenCalledWith(mockBusinessData);
    });
    
    test('should update business profile', async () => {
      // Arrange
      req.body = {
        businessName: 'Updated Business',
        businessEmail: 'updated@example.com',
        add1: '456 New St',
        add2: 'Suite 100',
        city: 'New City',
        postcode: '12345',
        country: 'USA',
        rsu_reference: 'REF123'
      };
      
      mocks.pool.query.mockResolvedValueOnce({
        rows: [req.body],
        rowCount: 1
      });
      
      // Act
      await updateBusinessProfile(req, res);
      
      // Assert
      expect(mocks.pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE business'), 
        expect.arrayContaining([req.body.businessName, req.body.businessEmail])
      );
      expect(res.json).toHaveBeenCalledWith(req.body);
    });
    
    test('should require authentication', async () => {
      // Arrange
      req.session.businessId = undefined;
      
      // Act
      await getBusinessProfile(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authenticated' });
    });
  });

  // Staff Management Tests
  describe('Staff Management', () => {
    test('should get staff list', async () => {
      // Arrange
      const mockStaffList = [
        { id: 1, name: 'John Doe', username: 'john', is_admin: true, is_owner: true },
        { id: 2, name: 'Jane Smith', username: 'jane', is_admin: false, is_owner: false }
      ];
      
      mocks.pool.query.mockResolvedValueOnce({
        rows: mockStaffList
      });
      
      // Act
      await getStaff(req, res);
      
      // Assert
      expect(mocks.pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
      expect(res.json).toHaveBeenCalledWith(mockStaffList);
    });
    
    test('should add new staff member', async () => {
      // Arrange
      req.body = {
        firstName: 'New',
        lastName: 'Staff',
        username: 'newstaff',
        password: 'password123',
        is_admin: false
      };
      
      // Mock username check
      mocks.pool.query.mockResolvedValueOnce({
        rows: []
      });
      
      // Mock insert result
      mocks.pool.query.mockResolvedValueOnce({
        rows: [{ id: 3, name: 'New Staff', username: 'newstaff', is_admin: false }]
      });
      
      // Act
      await addStaff(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          id: 3, 
          name: 'New Staff' 
        })
      );
    });
    
    test('should delete staff member', async () => {
      // Arrange
      req.params = { staffId: 2 };
      
      mocks.pool.query.mockResolvedValueOnce({
        rows: [{ user_id: 2 }]
      });
      
      // Act
      await deleteStaff(req, res);
      
      // Assert
      expect(mocks.pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM app_user'), 
        [2, 1]
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          message: 'Staff member deleted successfully',
          id: '2'
        })
      );
    });
  });

  // Categories Tests
  describe('Categories', () => {
    test('should get categories', async () => {
      // Arrange
      const mockCategories = [
        { category_id: 1, category_name: 'Electronics', description: 'Electronic items' },
        { category_id: 2, category_name: 'Furniture', description: 'Furniture items' }
      ];
      
      mocks.pool.query.mockResolvedValueOnce({
        rows: mockCategories
      });
      
      // Act
      await getCategories(req, res);
      
      // Assert
      expect(mocks.pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'), 
        [1]
      );
      expect(res.json).toHaveBeenCalledWith(mockCategories);
    });
    
    test('should create category', async () => {
      // Arrange
      req.body = {
        category_name: 'New Category',
        description: 'A new category'
      };
      
      // Mock name check
      mocks.pool.query.mockResolvedValueOnce({
        rows: []
      });
      
      // Mock insert
      mocks.pool.query.mockResolvedValueOnce({
        rows: [{ category_id: 3, ...req.body }]
      });
      
      // Act
      await createCategory(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          category_id: 3, 
          category_name: 'New Category' 
        })
      );
    });
    
    test('should prevent category deletion when in use', async () => {
      // Arrange
      req.params = { categoryId: 1 };
      
      // Mock category usage check
      mocks.pool.query.mockResolvedValueOnce({
        rows: [{ count: '5' }]
      });
      
      // Act
      await deleteCategory(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          message: expect.stringContaining('in use') 
        })
      );
    });
  });

  // Subscription Cancellation Test
  describe('cancelSubscription', () => {
    test('should anonymize business data on cancellation', async () => {
      // Arrange
      // Set up client query mock behaviors
      mocks.client.query.mockImplementation((query, params) => {
        if (query === 'BEGIN') return Promise.resolve();
        if (query === 'SELECT business_name FROM business WHERE business_id = $1') {
          return Promise.resolve({ rows: [{ business_name: 'Test Business' }] });
        }
        if (query === 'DELETE FROM app_user WHERE business_id = $1') return Promise.resolve();
        if (query.includes('UPDATE business')) return Promise.resolve();
        if (query === 'COMMIT') return Promise.resolve();
        return Promise.resolve();
      });
      
      // Act
      await cancelSubscription(req, res);
      
      // Assert
      expect(mocks.pool.connect).toHaveBeenCalled();
      expect(mocks.client.query).toHaveBeenCalledWith('BEGIN');
      expect(mocks.client.query).toHaveBeenCalledWith('DELETE FROM app_user WHERE business_id = $1', [1]);
      expect(mocks.client.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE business'), 
        [1]
      );
      expect(mocks.client.query).toHaveBeenCalledWith('COMMIT');
      expect(req.session.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          message: expect.stringContaining('cancelled') 
        })
      );
    });
    
    test('should rollback on error', async () => {
      // Arrange
      mocks.client.query.mockImplementationOnce(() => Promise.resolve()) // BEGIN
        .mockImplementationOnce(() => Promise.resolve({ rows: [{ business_name: 'Test Business' }] })) // SELECT
        .mockImplementationOnce(() => Promise.reject(new Error('Database error'))); // DELETE
      
      // Act
      await cancelSubscription(req, res);
      
      // Assert
      expect(mocks.client.query).toHaveBeenCalledWith('ROLLBACK');
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});