import * as db from './dbConnection.js';
import express from 'express';
import cors from 'cors';

const app = express();

// Configure CORS to only allow requests from our Vite dev server
const corsOptions = {
    origin: 'http://localhost:5173', // This is Vite's default port
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is connected!' });
});

// Start server
app.listen(8080);