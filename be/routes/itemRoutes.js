const express = require('express');
const Menu = require('../models/Menu');
const router = express.Router();

// GET all items for a specific menu category by category ID
router.get('/menu/:id/items', async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) {
      return res.status(404).json({ message: 'Menu category not found' });
    }
    res.json(menu.items); // Return the items in that category
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new item to a specific menu category by category ID
router.post('/menu/:id/items', async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) {
      return res.status(404).json({ message: 'Menu category not found' });
    }

    const newItem = {
      name: req.body.name,
      price: req.body.price,
    };

    menu.items.push(newItem); // Add the new item to the items array

    const updatedMenu = await menu.save(); // Save the updated menu category
    res.status(201).json(updatedMenu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route to delete an item by id from a specific category by id
router.delete('/menu/:categoryId/items/:itemId', async (req, res) => {
  const { categoryId, itemId } = req.params;

  try {
    // Use $pull to remove the item from the items array by itemId
    const result = await Menu.updateOne(
      { _id: categoryId },           // Find the category by categoryId
      { $pull: { items: { _id: itemId } } } // Remove the item with the specified itemId
    );

    if (result.modifiedCount > 0) {
      res.status(200).send({ message: 'Item deleted successfully' });
    } else {
      res.status(404).send({ message: 'Category or Item not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error deleting item', error });
  }
});


// Route to update an item by id in a specific category
router.put('/menu/:categoryId/items/:itemId', async (req, res) => {
  const { categoryId, itemId } = req.params;
  const { name, price } = req.body;  // Assuming the updated item data is sent in the request body

  try {
    // Update the specific item within the items array using $set and the positional operator $
    const result = await Menu.updateOne(
      { _id: categoryId, 'items._id': itemId }, // Find the category by categoryId and the item by itemId
      { 
        $set: {
          'items.$.name': name,   // Set the new name
          'items.$.price': price  // Set the new price
        }
      }
    );

    if (result.modifiedCount > 0) {
      res.status(200).send({ message: 'Item updated successfully' });
    } else {
      res.status(404).send({ message: 'Category or Item not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error updating item', error });
  }
});
module.exports = router;
