const express = require('express');
const router = express.Router();

module.exports = (pool) => {
    // Place Order
    router.post('/', async (req, res) => {
        const { customer_name, items, total_amount } = req.body;
        try {
            const result = await pool.query(
                "INSERT INTO orders (customer_name, items, total_amount) VALUES ($1, $2, $3) RETURNING id",
                [customer_name, JSON.stringify(items), total_amount]
            );
            res.status(201).json({ id: result.rows[0].id, msg: "Order Placed" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Get Order Status
    router.get('/:id', async (req, res) => {
        try {
            const result = await pool.query("SELECT * FROM orders WHERE id = $1", [req.params.id]);
            if (result.rows.length === 0) return res.status(404).json({ msg: "Not Found" });
            res.json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Admin: Get All (Simplified for lab)
    router.get('/', async (req, res) => {
        try {
            const result = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
            res.json(result.rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Admin: Update Status
    router.put('/:id', async (req, res) => {
        const { status } = req.body;
        try {
            await pool.query("UPDATE orders SET status = $1 WHERE id = $2", [status, req.params.id]);
            res.json({ msg: "Updated" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
