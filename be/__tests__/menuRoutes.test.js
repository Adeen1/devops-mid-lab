const request = require('supertest');
const express = require('express');
const menuRoutes = require('../routes/menuRoutes');

// Mock the Menu model
jest.mock('../models/Menu');
const Menu = require('../models/Menu');

describe('Menu Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', menuRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/menu', () => {
    test('should return all menu categories', async () => {
      const mockMenu = [
        {
          _id: '507f1f77bcf86cd799439011',
          category: 'Appetizers',
          icon: 'appetizer-icon',
          items: [{ name: 'Nachos', price: '8.99' }],
        },
      ];

      Menu.find.mockResolvedValue(mockMenu);

      const response = await request(app).get('/api/menu').expect(200);

      expect(response.body).toEqual(mockMenu);
      expect(Menu.find).toHaveBeenCalledTimes(1);
    });

    test('should handle database errors', async () => {
      Menu.find.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app).get('/api/menu').expect(500);

      expect(response.body.message).toBe('Database connection failed');
    });
  });

  describe('GET /api/menu/:id', () => {
    test('should return a specific menu category by id', async () => {
      const mockCategory = {
        _id: '507f1f77bcf86cd799439011',
        category: 'Appetizers',
        icon: 'appetizer-icon',
        items: [{ name: 'Nachos', price: '8.99' }],
      };

      Menu.findById.mockResolvedValue(mockCategory);

      const response = await request(app)
        .get('/api/menu/507f1f77bcf86cd799439011')
        .expect(200);

      expect(response.body).toEqual(mockCategory);
      expect(Menu.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    test('should handle database errors for specific category', async () => {
      Menu.findById.mockRejectedValue(new Error('Category not found'));

      const response = await request(app)
        .get('/api/menu/invalidid')
        .expect(500);

      expect(response.body.message).toBe('Category not found');
    });
  });

  describe('POST /api/menu', () => {
    test('should create a new menu category', async () => {
      const newCategoryData = {
        category: 'Desserts',
        icon: 'dessert-icon',
        items: [{ name: 'Ice Cream', price: '4.99' }],
      };

      const savedCategory = {
        _id: '507f1f77bcf86cd799439012',
        ...newCategoryData,
      };

      // Mock the Menu constructor and save method
      const mockSave = jest.fn().mockResolvedValue(savedCategory);
      Menu.mockImplementation(() => ({
        save: mockSave,
      }));

      const response = await request(app)
        .post('/api/menu')
        .send(newCategoryData)
        .expect(201);

      expect(response.body).toEqual(savedCategory);
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    test('should handle validation errors when creating category', async () => {
      const invalidData = {
        category: '', // Invalid empty category
        icon: 'icon',
      };

      const mockSave = jest
        .fn()
        .mockRejectedValue(new Error('Validation failed'));
      Menu.mockImplementation(() => ({
        save: mockSave,
      }));

      const response = await request(app)
        .post('/api/menu')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('PUT /api/menu/:id', () => {
    test('should update a menu category', async () => {
      const updateData = {
        category: 'Updated Appetizers',
        icon: 'new-icon',
      };

      const updatedCategory = {
        _id: '507f1f77bcf86cd799439011',
        ...updateData,
        items: [{ name: 'Nachos', price: '8.99' }],
      };

      Menu.findByIdAndUpdate.mockResolvedValue(updatedCategory);

      const response = await request(app)
        .put('/api/menu/507f1f77bcf86cd799439011')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedCategory);
      expect(Menu.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateData,
        { new: true, runValidators: true }
      );
    });

    test('should return 404 when category not found for update', async () => {
      Menu.findByIdAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/menu/nonexistent')
        .send({ category: 'Test' })
        .expect(404);

      expect(response.body.message).toBe('Category not found');
    });

    test('should handle update validation errors', async () => {
      Menu.findByIdAndUpdate.mockRejectedValue(
        new Error('Update validation failed')
      );

      const response = await request(app)
        .put('/api/menu/507f1f77bcf86cd799439011')
        .send({ category: '' })
        .expect(400);

      expect(response.body.message).toBe('Update validation failed');
    });
  });

  describe('DELETE /api/menu/:id', () => {
    test('should delete a menu category', async () => {
      const deletedCategory = {
        _id: '507f1f77bcf86cd799439011',
        category: 'Appetizers',
      };

      Menu.findByIdAndDelete.mockResolvedValue(deletedCategory);

      const response = await request(app)
        .delete('/api/menu/507f1f77bcf86cd799439011')
        .expect(200);

      expect(response.body.message).toBe('Category deleted successfully');
      expect(Menu.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011'
      );
    });

    test('should return 404 when category not found for deletion', async () => {
      Menu.findByIdAndDelete.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/menu/nonexistent')
        .expect(404);

      expect(response.body.message).toBe('Category not found');
    });

    test('should handle deletion errors', async () => {
      Menu.findByIdAndDelete.mockRejectedValue(new Error('Deletion failed'));

      const response = await request(app)
        .delete('/api/menu/507f1f77bcf86cd799439011')
        .expect(500);

      expect(response.body.message).toBe('Deletion failed');
    });
  });
});
