import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import errorHandler from './middleware/errorHandler.js';
import notesRoutes from './routes/notes.js';

// Konfiguration laden
dotenv.config();

const app = express();

connectDB();

// Updated CORS configuration to allow multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://your-production-frontend.com',
  'http://localhost:5173',  // Local development frontend
  'http://localhost:3000'   // Alternative local development port
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/notes', notesRoutes);

// Test-Route
app.get('/', (req, res) => {
  res.json({ status: 'ok', appName: 'Notes App', version: '1.0.0', message: 'Server is running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
}); 

export default app;