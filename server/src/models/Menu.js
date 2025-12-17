const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: { type: String, default: 'Main' }, // Starter, Main, Dessert, Drink
    imageUrl: String,
    isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Menu', MenuSchema);
