const { Pool } = require('pg');

const createOrderTable = async (pool) => {
    const query = `
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            customer_name VARCHAR(100) NOT NULL,
            items JSONB NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL,
            status VARCHAR(50) DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(query);
        console.log("PostgreSQL: 'orders' table verified.");
    } catch (err) {
        console.error("Error creating orders table:", err);
    }
};

module.exports = { createOrderTable };
