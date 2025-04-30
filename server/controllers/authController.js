import Stripe from 'stripe';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import * as db from '../dbConnection.js';
import { validateSignupInput, validateLoginInput } from '../validateInput.js';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

// Controller for signup
export async function signup(req, res) {
  const validation = validateSignupInput({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    businessName: req.body.businessName,
    businessEmail: req.body.businessEmail,
    username: req.body.username,
  });

  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  try {
    const { firstName, lastName, businessName, businessEmail, username} = req.body;
    const existingUser = await db.getUser(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already in use' });
    }

    // Store signup info in session (not DB yet)
    req.session.pendingSignup = {
      firstName,
      lastName,
      businessName,
      businessEmail,
      username
    };

    // Create Stripe Checkout session with additional metadata to use in webhook
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/signup`,
      metadata: {
        firstName,
        lastName,
        businessName,
        businessEmail,
        username,
      }
    });

    // Respond with Stripe Checkout URL
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error starting signup payment:', error);
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

// Controller to handle Stripe webhook events
export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log(`Webhook received: ${event.type}`);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.payment_status === 'paid') {
        console.log(`Payment completed for ${session.metadata.businessEmail}, awaiting password setup`);
      }
    }

    // Return success response
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
}

// Controller to handle payment success and redirect to login or signup
export async function handlePaymentSuccess(req, res) {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({ success: false, message: 'Missing session ID' });
    }
    
    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }
    
    // Get username to check if user already exists
    const { username } = session.metadata;
    const existingUser = await db.getUser(username);

    return res.json({
      success: true,
      userExists: !!existingUser,
      message: existingUser 
        ? 'User already exists, redirecting to login'
        : 'Payment verified, please complete signup',
      redirectTo: existingUser ? '/login' : null
    });
  } catch (error) {
    console.error('Error processing payment success:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing payment',
      error: error.message 
    });
  }
}

// Controller to verify payment without creating user
export async function verifyPayment(req, res) {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ success: false, message: 'Missing session ID' });
    }
    
    // Retrieve the Stripe session to verify payment
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }
    
    // Return user info from metadata
    const { username, businessEmail } = session.metadata;
    
    // Success response with username
    return res.json({
      success: true,
      username,
      email: businessEmail
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error verifying payment'
    });
  }
}

// Controller to complete signup with password
export async function completeSignup(req, res) {
  try {
    const { session_id, password } = req.body;
    
    if (!session_id || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required information'
      });
    }
    
    // Verify payment again for security
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or unpaid session'
      });
    }
    
    // Get user data from metadata
    const { 
      firstName, 
      lastName, 
      businessName, 
      businessEmail, 
      username 
    } = session.metadata;
    
    // Check if user already exists
    const existingUser = await db.getUser(username);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists'
      });
    }
    
    // Create user with provided password
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.createUser(
      businessEmail, 
      username, 
      hashedPassword, 
      firstName, 
      lastName, 
      businessName
    );
    
    return res.json({
      success: true,
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Error completing signup:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error completing signup'
    });
  }
}