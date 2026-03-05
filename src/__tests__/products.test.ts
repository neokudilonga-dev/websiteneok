import { describe, it, expect } from '@jest/globals';
import { productSchema, productCreateSchema } from '../lib/validation/products';

describe('Product Validation', () => {
  it('should validate a valid book', () => {
    const validBook = {
      type: 'book',
      name: 'Test Book',
      price: 5000,
      stock: 10,
      stockStatus: 'in_stock',
      category: 'fiction'
    };

    const result = productSchema.safeParse(validBook);
    expect(result.success).toBe(true);
  });

  it('should validate a product with multilingual name', () => {
    const validProduct = {
      type: 'game',
      name: {
        pt: 'Jogo Teste',
        en: 'Test Game'
      },
      price: 3000,
      stock: 5,
      stockStatus: 'in_stock',
      category: 'educational'
    };

    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('should reject product with negative price', () => {
    const invalidProduct = {
      type: 'book',
      name: 'Test Book',
      price: -100,
      stock: 10,
      stockStatus: 'in_stock',
      category: 'fiction'
    };

    const result = productSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Price must be positive');
    }
  });

  it('should reject product creation without image', () => {
    const invalidProduct = {
      type: 'book',
      name: 'Test Book',
      price: 5000,
      stock: 10,
      stockStatus: 'in_stock',
      category: 'fiction'
      // Missing required image for creation
    };

    const result = productCreateSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
    if (!result.success) {
      // The error might be "Invalid input" or a more specific message
      expect(result.error.errors.length).toBeGreaterThan(0);
    }
  });

  it('should accept product creation with single image', () => {
    const validProduct = {
      type: 'book',
      name: 'Test Book',
      price: 5000,
      stock: 10,
      stockStatus: 'in_stock',
      category: 'fiction',
      image: 'https://example.com/image.jpg'
    };

    const result = productCreateSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('should accept product creation with multiple images', () => {
    const validProduct = {
      type: 'game',
      name: 'Test Game',
      price: 3000,
      stock: 5,
      stockStatus: 'in_stock',
      category: 'educational',
      image: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
    };

    const result = productCreateSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('should reject product creation with too many images', () => {
    const invalidProduct = {
      type: 'book',
      name: 'Test Book',
      price: 5000,
      stock: 10,
      stockStatus: 'in_stock',
      category: 'fiction',
      image: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg'] // 4 images, max is 3
    };

    const result = productCreateSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Maximum 3 images allowed');
    }
  });

  it('should validate storage place format', () => {
    const validProduct = {
      type: 'book',
      name: 'Test Book',
      price: 5000,
      stock: 10,
      stockStatus: 'in_stock',
      category: 'fiction',
      storagePlace: 'A01'
    };

    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('should reject invalid storage place format', () => {
    const invalidProduct = {
      type: 'book',
      name: 'Test Book',
      price: 5000,
      stock: 10,
      stockStatus: 'in_stock',
      category: 'fiction',
      storagePlace: 'INVALID'
    };

    const result = productSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
  });
});
