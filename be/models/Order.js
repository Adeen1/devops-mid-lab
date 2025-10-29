const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerNote: {
    type: String,
    default: '',
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  orderItems: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: 'Pending',
  },
  statusInfo: {
    type: String,
    default: 'Eg like your order will take 10-15 minutes',
  },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
