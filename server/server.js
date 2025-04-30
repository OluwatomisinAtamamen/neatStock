import express from 'express';
import cors from 'cors';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import { pool } from './dbConnection.js';
import authRoutes from './routes/auth.js';
import { handleStripeWebhook } from './controllers/authController.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Raw body parser for Stripe webhooks
app.post(
  '/webhook',
  express.raw({ 
    type: (req) => req.headers['content-type']?.startsWith('application/json') 
  }),
  handleStripeWebhook
);

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

// Mount the auth routes under /data/users
app.use('/data/users', authRoutes);

// You can add additional route modules here, for example:
// import inventoryRoutes from './routes/inventory.js';
// app.use('/data/inventory', inventoryRoutes);

// Fallback protected route example
app.get('/data/protected', (req, res) => {
  if (req.session.userId) {
    res.json({ message: 'This is protected data', userId: req.session.userId });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.listen(8080);