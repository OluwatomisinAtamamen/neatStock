import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import * as db from './dbConnection.js';
import { pool } from './dbConnection.js';
import { validateSignupInput, validateLoginInput } from './validateInput.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const PostgreSqlStore = pgSession(session);
const sessionStore = new PostgreSqlStore({
  pool: pool,
  tableName: 'sessions'
});

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV
  }
}));

// Signup Route with validation
app.post('/data/users/signup', async (req, res) => {
  const validation = validateSignupInput({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    businessName: req.body.businessName,
    businessEmail: req.body.businessEmail,
    username: req.body.username,
    password: req.body.password,
  });

  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  try {
    const { firstName, lastName, businessName, businessEmail, username, password } = req.body;
    
    const existingUser = await db.getUser(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.createUser(businessEmail, username, hashedPassword, firstName, lastName, businessName);
    
    res.status(200).json({ 
      success: true, 
      message: 'User created successfully',
      userId: result.userId,
      businessId: result.businessId 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Login Route with validation
app.post('/data/users/login', async (req, res) => {
  const validation = validateLoginInput({
    username: req.body.username,
    password: req.body.password
  });

  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  try {
    const { username, password } = req.body;
    const user = await db.getUser(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    if (passwordMatch) {
      req.session.userId = user.user_id;
      req.session.businessId = user.businessId;
      req.session.firstName = user.firstName;
      req.session.lastName = user.lastName;
      res.json({
        userId: user.user_id,
        firstName: user.firstName,
        lastName: user.lastName,
        businessName: user.businessName,
        message: 'Login successful'
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.post('/data/users/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed', error: err.message });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/data/users/auth-status', (req, res) => {
  if (req.session.userId) {
    res.json({
      isAuthenticated: true,
      userId: req.session.userId,
      firstName: req.session.firstName,
      lastName: req.session.lastName
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

app.get('/data/protected', (req, res) => {
  if (req.session.userId) {
    res.json({ message: 'This is protected data', userId: req.session.userId });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.listen(8080);