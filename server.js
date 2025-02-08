import * as db from './dbConnection.js';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app = express();

// Configure CORS to only allow requests from our Vite dev server
const corsOptions = {
    origin: 'http://localhost:5173', // This is Vite's default port
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is connected!' });
});

/**
 * Create a new user account in the database.
 * @async
 * @function postUser
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
async function postNewUser(req, res) {
    try {
      const existingUser = await db.getUser(req.body.workEmail);
      if (existingUser) {
        res.status(400).json({ message: 'Email already in use' });
        return;
      }
  
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const result = await db.createUser(req.body.workEmail, hashedPassword, req.body.firstName, req.body.lastName, req.body.businessName);
      res.json({ ACCOUNT_ID: result.lastID });
    } catch (error) {
      console.log('Internal Server Error', error);
    }
  }
  
  /**
   * Authenticate a user by checking the provided email and password against the database.
   * @async
   * @function authenticateUser
   * @param {Object} req - The Express request object.
   * @param {Object} res - The Express response object.
   */
  async function authenticateUser(req, res) {
    try {
      const user = await db.getUser(req.body.email);
      if (user && await bcrypt.compare(req.body.password, user.hashedPassword)) {

        // Create a JWT token
        const token = jwt.sign({ ACCOUNT_ID: user.id }, "jwt-secret-key", { expiresIn: '1h' });
        res.cookie('token', token);

        res.json(user);
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      console.log('Internal Server Error', error);
    }
  }

// Route handlers
app.post('/data/users/signup', express.json(), postNewUser);
app.post('/data/users/login', express.json(), authenticateUser);

// Start server
app.listen(8080);