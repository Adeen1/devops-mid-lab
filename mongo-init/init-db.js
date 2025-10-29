// Initialize the database
db = db.getSiblingDB("rouse_restaurant");

// Create collections
db.createCollection("menus");
db.createCollection("orders");

// Insert sample menu data
db.menus.insertMany([
  {
    category: "Appetizers",
    icon: "🥗",
    items: [
      { name: "Caesar Salad", price: "12.99" },
      { name: "Garlic Bread", price: "8.99" },
      { name: "Mozzarella Sticks", price: "10.99" },
    ],
  },
  {
    category: "Main Courses",
    icon: "🍝",
    items: [
      { name: "Spaghetti Carbonara", price: "18.99" },
      { name: "Grilled Chicken", price: "22.99" },
      { name: "Beef Steak", price: "28.99" },
    ],
  },
  {
    category: "Desserts",
    icon: "🍰",
    items: [
      { name: "Tiramisu", price: "8.99" },
      { name: "Chocolate Cake", price: "7.99" },
      { name: "Ice Cream", price: "5.99" },
    ],
  },
]);

print("Database initialized successfully with sample data!");
