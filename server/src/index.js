const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { connectDBs } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve Static Frontend
app.use(express.static(path.join(__dirname, '../../client/dist')));

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});



const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { createOrderTable } = require('./models/Order');

// ... (middleware)

// Start Server
const startServer = async () => {
    const { connectDBs, getPgPool } = require('./config/db'); // Need to export pool
    await connectDBs();

    const pool = getPgPool();
    await createOrderTable(pool);

    // Routes
    app.use('/api/menu', menuRoutes);
    app.use('/api/orders', orderRoutes(pool)); // Pass pool to routes

    // Catch-all for React (must be last)
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
    });

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
