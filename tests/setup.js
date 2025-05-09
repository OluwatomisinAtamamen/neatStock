import { jest } from '@jest/globals';

// Create proper Jest mock functions for the pool
const mockQuery = jest.fn();
const mockRelease = jest.fn();
const mockClientQuery = jest.fn();

const mockClient = {
  query: mockClientQuery,
  release: mockRelease
};

const mockConnect = jest.fn().mockResolvedValue(mockClient);

// Mock the database connection
jest.mock('../server/dbConnection.js', () => ({
  pool: {
    query: mockQuery,
    connect: mockConnect
  }
}));