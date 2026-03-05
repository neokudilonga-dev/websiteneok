import { describe, it, expect } from '@jest/globals';
import { orderSchema, orderUpdateSchema } from '../lib/validation/orders';

describe('Order Validation', () => {
  it('should validate a valid order', () => {
    const validOrder = {
      reference: 'ORD-123',
      guardianName: 'John Doe',
      email: 'john@example.com',
      phone: '+244919948887',
      schoolName: 'Test School',
      schoolId: 'school-123',
      items: [
        {
          id: 'item-1',
          name: 'Test Book',
          price: 5000,
          quantity: 2,
          type: 'book'
        }
      ],
      total: 10000,
      paymentMethod: 'transferencia',
      deliveryOption: 'delivery',
      language: 'pt'
    };

    const result = orderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidOrder = {
      reference: 'ORD-123',
      guardianName: 'John Doe',
      email: 'invalid-email',
      phone: '+244919948887',
      schoolName: 'Test School',
      schoolId: 'school-123',
      items: [
        {
          id: 'item-1',
          name: 'Test Book',
          price: 5000,
          quantity: 2,
          type: 'book'
        }
      ],
      total: 10000,
      paymentMethod: 'transferencia',
      deliveryOption: 'delivery'
    };

    const result = orderSchema.safeParse(invalidOrder);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Valid email is required');
    }
  });

  it('should reject order with no items', () => {
    const invalidOrder = {
      reference: 'ORD-123',
      guardianName: 'John Doe',
      email: 'john@example.com',
      phone: '+244919948887',
      schoolName: 'Test School',
      schoolId: 'school-123',
      items: [],
      total: 0,
      paymentMethod: 'transferencia',
      deliveryOption: 'delivery'
    };

    const result = orderSchema.safeParse(invalidOrder);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('At least one item is required');
    }
  });

  it('should accept valid order update', () => {
    const validUpdate = {
      paymentStatus: 'paid',
      deliveryStatus: 'delivered',
      guardianName: 'Jane Doe'
    };

    const result = orderUpdateSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it('should reject invalid payment status', () => {
    const invalidUpdate = {
      paymentStatus: 'invalid-status'
    };

    const result = orderUpdateSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
  });
});
