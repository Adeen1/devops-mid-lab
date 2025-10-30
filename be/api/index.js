const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const menuRoutes = require('../routes/menuRoutes');
const itemRoutes = require('../routes/itemRoutes'); // Import the new item routes
const orderRoutes = require('../routes/orderRoutes');
dotenv.config();

const app = express();
app.use(express.json()); // For parsing JSON bodies

// CORS configuration: allow configurable origins, default to permissive for hosted envs

const allowedOrigins = [
  'http://localhost:3000', // Frontend in Docker
  'http://localhost:5173', // Frontend in development
  'http://127.0.0.1:3000', // Alternative localhost
  'http://127.0.0.1:5173', // Alternative localhost
  'http://frontend:80', // Docker service name
  'http://rouse-frontend:80', // Docker container name
  process.env.FRONTEND_URL, // Railway or other hosted frontend
  process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null,
].filter(Boolean); // Remove null/undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        callback(null, true);
      } else {
        callback(null, true); // In production, you might want to restrict this
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  })
);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

// Use the routes
app.use('/api', menuRoutes);
app.use('/api', itemRoutes); // Use item routes
app.use('/api', orderRoutes); // Use item routes

app.get('/', async (req, res) => {
  try {
    res.json('meow'); // Return the items in that category
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
