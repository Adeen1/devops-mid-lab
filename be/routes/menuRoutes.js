const express = require('express');
const Menu = require('../models/Menu');
const router = express.Router();

// GET all menu categories
router.get('/menu', async (req, res) => {
  try {
    const menu = await Menu.find();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/menu/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Menu.findById(id);
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
});

// POST a new menu category
router.post('/menu', async (req, res) => {
  const menuCategory = new Menu({
    category: req.body.category,
    icon: req.body.icon,
    items: req.body.items,
  });

  try {
    const newCategory = await menuCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// PUT (Update) a category by id without modifying the items array
router.put('/menu/:id', async (req, res) => {
  try {
    const updatedCategory = await Menu.findByIdAndUpdate(
      req.params.id,  // Find the category by id
      {
        category: req.body.category, // Update only category field
        icon: req.body.icon          // Update only icon field
        // Note: Items are not included in the update to keep them unchanged
      },
      { new: true, runValidators: true } // Return the updated document, and run validation
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// DELETE a category by id
router.delete('/menu/:id', async (req, res) => {
  try {
    const deletedCategory = await Menu.findByIdAndDelete(req.params.id); // Find category by id and delete it

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
