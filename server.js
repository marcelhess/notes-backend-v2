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

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/notes', notesRoutes);

// Test-Route
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
}); 

export default app;