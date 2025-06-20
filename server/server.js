import express from 'express';
import cors from 'cors';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import { pool } from './dbConnection.js';
import authRoutes from './routes/auth.js';
import { handleStripeWebhook } from './controllers/authController.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import locationRoutes from './routes/locations.js';
import searchRoutes from './routes/search.js';
import inventoryRoutes from './routes/inventory.js';
import * as settingsController from './controllers/settingsController.js';
import { getDashboardData } from './controllers/dashboardController.js';
import reportsRoutes from './routes/reports.js';
import { initializeSnapshotJob } from './snapshotJob.js';

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
// Serve static files from uploads directory
app.use('/data/uploads', express.static(path.join(__dirname, 'uploads')));

const PostgreSqlStore = pgSession(session);
const sessionStore = new PostgreSqlStore({
  pool: pool,
  tableName: 'sessions'
});

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

app.use('/data/users', authRoutes);
app.use('/data/locations', locationRoutes);
app.use('/data/search', searchRoutes);
app.use('/data/inventory', inventoryRoutes);
app.use('/data/reports', reportsRoutes);

// Business profile routes
app.get('/data/settings/business', settingsController.getBusinessProfile);
app.put('/data/settings/business', settingsController.updateBusinessProfile);

// Staff management routes
app.get('/data/settings/staff', settingsController.getStaff);
app.post('/data/settings/staff', settingsController.addStaff);
app.patch('/data/settings/staff/:staffId', settingsController.updateStaffAdmin);
app.delete('/data/settings/staff/:staffId', settingsController.deleteStaff);
app.delete('/data/settings/subscription', settingsController.cancelSubscription);

// Category management routes
app.get('/data/settings/categories', settingsController.getCategories);
app.post('/data/settings/categories', settingsController.createCategory);
app.put('/data/settings/categories/:categoryId', settingsController.updateCategory);
app.delete('/data/settings/categories/:categoryId', settingsController.deleteCategory);

app.get('/data/dashboard', getDashboardData);

initializeSnapshotJob();

app.listen(8080);