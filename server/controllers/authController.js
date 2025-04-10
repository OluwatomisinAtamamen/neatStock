import bcrypt from 'bcrypt';
import * as db from '../dbConnection.js';
import { validateSignupInput, validateLoginInput } from '../validateInput.js';

// Controller for signup
export async function signup(req, res) {
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
    
    return res.status(200).json({ 
      success: true, 
      message: 'User created successfully',
      userId: result.userId,
      businessId: result.businessId 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Controller for login
export async function login(req, res) {
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
      return res.json({
        userId: user.user_id,
        firstName: user.firstName,
        lastName: user.lastName,
        businessName: user.businessName,
        message: 'Login successful'
      });
    } else {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Controller for logout
export function logout(req, res) {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed', error: err.message });
    }
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logged out successfully' });
  });
}

// Controller to check auth status
export function getAuthStatus(req, res) {
  if (req.session.userId) {
    return res.json({
      isAuthenticated: true,
      userId: req.session.userId,
      firstName: req.session.firstName,
      lastName: req.session.lastName
    });
  } else {
    return res.json({ isAuthenticated: false });
  }
}