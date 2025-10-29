const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
});

const menuCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  items: [itemSchema],
});

const Menu = mongoose.model('Menu', menuCategorySchema);
module.exports = Menu;
