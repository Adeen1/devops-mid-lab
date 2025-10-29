const request = require('supertest');
const express = require('express');
const orderRoutes = require('../routes/orderRoutes');

// Mock the Order model
jest.mock('../models/Order');
const Order = require('../models/Order');

describe('Order Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', orderRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/orders', () => {
    test('should return all orders', async () => {
      const mockOrders = [
        {
          _id: '507f1f77bcf86cd799439011',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          orderItems: [{ itemName: 'Pizza', quantity: 1, price: 12.99 }],
          totalAmount: 12.99,
          status: 'Pending',
        },
      ];

      Order.find.mockResolvedValue(mockOrders);

      const response = await request(app).get('/api/orders').expect(200);

      expect(response.body).toEqual(mockOrders);
      expect(Order.find).toHaveBeenCalledTimes(1);
    });

    test('should handle database errors', async () => {
      Order.find.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app).get('/api/orders').expect(500);

      expect(response.body.message).toBe('Database connection failed');
    });
  });

  describe('GET /api/orders/:id', () => {
    test('should return a specific order by id', async () => {
      const mockOrder = {
        _id: '507f1f77bcf86cd799439011',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        orderItems: [{ itemName: 'Pizza', quantity: 1, price: 12.99 }],
        totalAmount: 12.99,
        status: 'Pending',
      };

      Order.findById.mockResolvedValue(mockOrder);

      const response = await request(app)
        .get('/api/orders/507f1f77bcf86cd799439011')
        .expect(200);

      expect(response.body).toEqual(mockOrder);
      expect(Order.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    test('should return 404 when order not found', async () => {
      Order.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/orders/nonexistent')
        .expect(404);

      expect(response.body.message).toBe('Order not found');
    });

    test('should handle database errors for specific order', async () => {
      Order.findById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/orders/invalidid')
        .expect(500);

      expect(response.body.message).toBe('Database error');
    });
  });

  describe('GET /api/ordersByEmail', () => {
    test('should return orders by email', async () => {
      const mockOrders = [
        {
          _id: '507f1f77bcf86cd799439011',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          orderItems: [{ itemName: 'Pizza', quantity: 1, price: 12.99 }],
          totalAmount: 12.99,
          status: 'Pending',
        },
      ];

      Order.find.mockResolvedValue(mockOrders);

      const response = await request(app)
        .get('/api/ordersByEmail?email=john@example.com')
        .expect(200);

      expect(response.body).toEqual(mockOrders);
      expect(Order.find).toHaveBeenCalledWith({
        customerEmail: 'john@example.com',
      });
    });

    test('should return 400 when email parameter is missing', async () => {
      const response = await request(app).get('/api/ordersByEmail').expect(400);

      expect(response.body.message).toBe('Email query parameter is required');
    });

    test('should return 404 when no orders found for email', async () => {
      Order.find.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/ordersByEmail?email=notfound@example.com')
        .expect(404);

      expect(response.body.message).toBe('No orders found for this email');
    });

    test('should handle database errors for email search', async () => {
      Order.find.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/ordersByEmail?email=john@example.com')
        .expect(500);

      expect(response.body.message).toBe('An internal server error occurred');
    });
  });

  describe('POST /api/orders', () => {
    test('should handle validation errors when creating order', async () => {
      const invalidData = {
        customerName: '', // Invalid empty name
        customerEmail: 'invalid-email',
      };

      const mockSave = jest
        .fn()
        .mockRejectedValue(new Error('Validation failed'));
      Order.mockImplementation(() => ({
        save: mockSave,
      }));

      const response = await request(app)
        .post('/api/orders')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('PUT /api/orders/:id', () => {
    test('should update an order', async () => {
      const updateData = {
        status: 'Completed',
        statusInfo: 'Order ready for pickup',
        customerNote: 'Updated note',
      };

      const updatedOrder = {
        _id: '507f1f77bcf86cd799439011',
        customerName: 'John Doe',
        ...updateData,
      };

      Order.findByIdAndUpdate.mockResolvedValue(updatedOrder);

      const response = await request(app)
        .put('/api/orders/507f1f77bcf86cd799439011')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedOrder);
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateData,
        { new: true, runValidators: true }
      );
    });

    test('should return 404 when order not found for update', async () => {
      Order.findByIdAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/orders/nonexistent')
        .send({ status: 'Completed' })
        .expect(404);

      expect(response.body.message).toBe('Order not found');
    });

    test('should handle update validation errors', async () => {
      Order.findByIdAndUpdate.mockRejectedValue(
        new Error('Update validation failed')
      );

      const response = await request(app)
        .put('/api/orders/507f1f77bcf86cd799439011')
        .send({ status: 'InvalidStatus' })
        .expect(400);

      expect(response.body.message).toBe('Update validation failed');
    });
  });

  describe('DELETE /api/orders/:id', () => {
    test('should delete a specific order', async () => {
      const deletedOrder = {
        _id: '507f1f77bcf86cd799439011',
        customerName: 'John Doe',
      };

      Order.findByIdAndDelete.mockResolvedValue(deletedOrder);

      const response = await request(app)
        .delete('/api/orders/507f1f77bcf86cd799439011')
        .expect(200);

      expect(response.body.message).toBe('Order deleted successfully');
      expect(Order.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011'
      );
    });

    test('should return 404 when order not found for deletion', async () => {
      Order.findByIdAndDelete.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/orders/nonexistent')
        .expect(404);

      expect(response.body.message).toBe('Order not found');
    });

    test('should handle deletion errors', async () => {
      Order.findByIdAndDelete.mockRejectedValue(new Error('Deletion failed'));

      const response = await request(app)
        .delete('/api/orders/507f1f77bcf86cd799439011')
        .expect(500);

      expect(response.body.message).toBe('Deletion failed');
    });
  });

  describe('DELETE /api/orders', () => {
    test('should delete all orders', async () => {
      const deleteResult = { deletedCount: 5 };
      Order.deleteMany.mockResolvedValue(deleteResult);

      const response = await request(app).delete('/api/orders').expect(200);

      expect(response.body.message).toBe('5 orders deleted successfully');
      expect(Order.deleteMany).toHaveBeenCalledWith({});
    });

    test('should return 404 when no orders found to delete', async () => {
      const deleteResult = { deletedCount: 0 };
      Order.deleteMany.mockResolvedValue(deleteResult);

      const response = await request(app).delete('/api/orders').expect(404);

      expect(response.body.message).toBe('No orders found to delete');
    });

    test('should handle deletion errors for all orders', async () => {
      Order.deleteMany.mockRejectedValue(new Error('Mass deletion failed'));

      const response = await request(app).delete('/api/orders').expect(500);

      expect(response.body.message).toBe('Mass deletion failed');
    });
  });
});
