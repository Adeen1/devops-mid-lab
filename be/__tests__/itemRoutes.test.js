const request = require('supertest');
const express = require('express');
const itemRoutes = require('../routes/itemRoutes');

// Mock the Menu model
jest.mock('../models/Menu');
const Menu = require('../models/Menu');

describe('Item Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', itemRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/menu/:id/items', () => {
    test('should return all items for a specific menu category', async () => {
      const mockMenu = {
        _id: '507f1f77bcf86cd799439011',
        category: 'Appetizers',
        items: [
          { _id: 'item1', name: 'Nachos', price: '8.99' },
          { _id: 'item2', name: 'Wings', price: '12.99' },
        ],
      };

      Menu.findById.mockResolvedValue(mockMenu);

      const response = await request(app)
        .get('/api/menu/507f1f77bcf86cd799439011/items')
        .expect(200);

      expect(response.body).toEqual(mockMenu.items);
      expect(Menu.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    test('should return 404 when menu category not found', async () => {
      Menu.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/menu/nonexistent/items')
        .expect(404);

      expect(response.body.message).toBe('Menu category not found');
    });

    test('should handle database errors', async () => {
      Menu.findById.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/menu/507f1f77bcf86cd799439011/items')
        .expect(500);

      expect(response.body.message).toBe('Database connection failed');
    });
  });

  describe('POST /api/menu/:id/items', () => {
    test('should return 404 when menu category not found for adding item', async () => {
      Menu.findById.mockResolvedValue(null);

      const newItem = {
        name: 'Test Item',
        price: '5.99',
      };

      const response = await request(app)
        .post('/api/menu/nonexistent/items')
        .send(newItem)
        .expect(404);

      expect(response.body.message).toBe('Menu category not found');
    });

    test('should handle validation errors when adding item', async () => {
      const mockMenu = {
        _id: '507f1f77bcf86cd799439011',
        items: [],
        save: jest.fn().mockRejectedValue(new Error('Validation failed')),
      };

      Menu.findById.mockResolvedValue(mockMenu);

      const invalidItem = {
        name: '', // Invalid empty name
        price: 'invalid',
      };

      const response = await request(app)
        .post('/api/menu/507f1f77bcf86cd799439011/items')
        .send(invalidItem)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('PUT /api/menu/:categoryId/items/:itemId', () => {
    test('should update an item in a menu category', async () => {
      const updateData = {
        name: 'Updated Nachos',
        price: '9.99',
      };

      const updateResult = { modifiedCount: 1 };
      Menu.updateOne.mockResolvedValue(updateResult);

      const response = await request(app)
        .put(
          '/api/menu/507f1f77bcf86cd799439011/items/507f1f77bcf86cd799439012'
        )
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Item updated successfully');
      expect(Menu.updateOne).toHaveBeenCalledWith(
        {
          _id: '507f1f77bcf86cd799439011',
          'items._id': '507f1f77bcf86cd799439012',
        },
        {
          $set: {
            'items.$.name': updateData.name,
            'items.$.price': updateData.price,
          },
        }
      );
    });

    test('should return 404 when category or item not found for update', async () => {
      const updateResult = { modifiedCount: 0 };
      Menu.updateOne.mockResolvedValue(updateResult);

      const updateData = {
        name: 'Updated Item',
        price: '10.99',
      };

      const response = await request(app)
        .put('/api/menu/nonexistent/items/nonexistent')
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Category or Item not found');
    });

    test('should handle update errors', async () => {
      Menu.updateOne.mockRejectedValue(new Error('Update failed'));

      const updateData = {
        name: 'Updated Item',
        price: '10.99',
      };

      const response = await request(app)
        .put(
          '/api/menu/507f1f77bcf86cd799439011/items/507f1f77bcf86cd799439012'
        )
        .send(updateData)
        .expect(500);

      expect(response.body.message).toBe('Error updating item');
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/menu/:categoryId/items/:itemId', () => {
    test('should delete an item from a menu category', async () => {
      const deleteResult = { modifiedCount: 1 };
      Menu.updateOne.mockResolvedValue(deleteResult);

      const response = await request(app)
        .delete(
          '/api/menu/507f1f77bcf86cd799439011/items/507f1f77bcf86cd799439012'
        )
        .expect(200);

      expect(response.body.message).toBe('Item deleted successfully');
      expect(Menu.updateOne).toHaveBeenCalledWith(
        { _id: '507f1f77bcf86cd799439011' },
        { $pull: { items: { _id: '507f1f77bcf86cd799439012' } } }
      );
    });

    test('should return 404 when category or item not found for deletion', async () => {
      const deleteResult = { modifiedCount: 0 };
      Menu.updateOne.mockResolvedValue(deleteResult);

      const response = await request(app)
        .delete('/api/menu/nonexistent/items/nonexistent')
        .expect(404);

      expect(response.body.message).toBe('Category or Item not found');
    });

    test('should handle deletion errors', async () => {
      Menu.updateOne.mockRejectedValue(new Error('Deletion failed'));

      const response = await request(app)
        .delete(
          '/api/menu/507f1f77bcf86cd799439011/items/507f1f77bcf86cd799439012'
        )
        .expect(500);

      expect(response.body.message).toBe('Error deleting item');
      expect(response.body.error).toBeDefined();
    });
  });
});
