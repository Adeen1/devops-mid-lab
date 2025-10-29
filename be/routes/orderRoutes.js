const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// GET all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single order by id
router.get('/orders/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all orders by email
// GET all orders by email
router.get('/ordersByEmail', async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res
        .status(400)
        .json({ message: 'Email query parameter is required' });
    }

    // Find orders by customer email
    const orders = await Order.find({ customerEmail: email });

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: 'No orders found for this email' });
    }

    res.json(orders);
  } catch (error) {
    console.error(error); // Log the error to server console
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

// POST a new order
router.post('/orders', async (req, res) => {
  const order = new Order({
    customerName: req.body.customerName,
    customerEmail: req.body.customerEmail,
    customerNote: req.body.customerNote, // Default to empty string if not provided
    orderDate: req.body.orderDate || Date.now(), // Default to current date if not provided
    orderItems: req.body.orderItems,
    totalAmount: req.body.totalAmount,
    status: req.body.status || 'Pending',
    statusInfo:
      req.body.statusInfo || 'Eg like your order will take 10-15 minutes',
  });

  try {
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT (Update) an order's status, status info, and customer note by id
router.put('/orders/:id', async (req, res) => {
  try {
    // Create an update object with status, statusInfo, and customerNote
    const updateData = {
      status: req.body.status,
      statusInfo: req.body.statusInfo,
      customerNote: req.body.customerNote,
    };

    // Find the order by id and update only the specified fields
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true } // Return the updated document and validate
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an order by id
router.delete('/orders/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE all orders
router.delete('/orders', async (req, res) => {
  try {
    const result = await Order.deleteMany({}); // Delete all documents in the collection

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No orders found to delete' });
    }

    res
      .status(200)
      .json({ message: `${result.deletedCount} orders deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
