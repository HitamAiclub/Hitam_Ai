import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('HITAM AI API is running');
});

// API routes can be added here

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});