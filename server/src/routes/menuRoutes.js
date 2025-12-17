const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');

// Get All
router.get('/', async (req, res) => {
    try {
        const items = await Menu.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Item (Admin)
router.post('/', async (req, res) => {
    try {
        const newItem = new Menu(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Seed Data
router.post('/seed', async (req, res) => {
    await Menu.deleteMany({});
    const items = [
        // Starters
        { name: "Garlic Bread", price: 5.99, description: "Toasted french baguette with garlic butter.", category: "Starter", imageUrl: "https://images.unsplash.com/photo-1573140247632-f84660f67126?auto=format&fit=crop&w=500&q=60" },
        { name: "Mozzarella Sticks", price: 7.99, description: "Golden fried cheese with marinara.", category: "Starter", imageUrl: "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?auto=format&fit=crop&w=500&q=60" },

        // Burgers
        { name: "Double Cheeseburger", price: 12.99, description: "Two beef patties, cheddar, pickles.", category: "Burger", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60" },
        { name: "Chicken Royale", price: 11.99, description: "Crispy chicken breast, mayo, lettuce.", category: "Burger", imageUrl: "https://images.unsplash.com/photo-1615297348041-9a5499cfad13?auto=format&fit=crop&w=500&q=60" },

        // Pizzas
        { name: "Pepperoni Pizza", price: 15.99, description: "Classic spicy pepperoni, mozzarella.", category: "Pizza", imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=60" },
        { name: "BBQ Chicken Pizza", price: 16.99, description: "Grilled chicken, BBQ drizzle, onions.", category: "Pizza", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=60" },


        // Drinks
        { name: "Cola", price: 2.99, description: "Cold fizzy drink over ice.", category: "Drink", imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=60" },
        { name: "Lemonade", price: 3.49, description: "Freshly squeezed lemon with mint.", category: "Drink", imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=60" },
        { name: "Iced Coffee", price: 4.99, description: "Classic cold brew with milk.", category: "Drink", imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b5dd7359?auto=format&fit=crop&w=500&q=60" },

        // Desserts
        { name: "Lava Cake", price: 6.99, description: "Warm chocolate cake with molten center.", category: "Dessert", imageUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=500&q=60" },
        { name: "Cheesecake", price: 7.99, description: "New York style cheesecake with strawberry.", category: "Dessert", imageUrl: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=500&q=60" },
        { name: "Ice Cream Sundae", price: 5.99, description: "Vanilla bean ice cream with fudge.", category: "Dessert", imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=500&q=60" }
    ];
    await Menu.insertMany(items);
    res.json({ msg: "Seeded" });
});

module.exports = router;
