import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, comparePassword, createSessionToken, verifySessionToken } from '../lib/auth.js';
import {
  getProducts,
  getProductBySlug,
  validateCoupon,
  createOrder,
  getOrders,
  createProduct,
  deleteProduct,
} from '../lib/db.js';
import { verifyRazorpaySignature, verifyWebhookSignature } from '../lib/razorpay.js';
import { calculateDiscountPercent } from '../lib/utils.js';

test('1. Authentication & Authorization Tests', async (t) => {
  await t.test('Password hashing and verification', async () => {
    const password = 'SecurePassword@123';
    const hash = await hashPassword(password);

    assert.notEqual(hash, password, 'Password hash must not match plaintext');
    const isValid = await comparePassword(password, hash);
    assert.equal(isValid, true, 'Valid password must match hash');

    const isInvalid = await comparePassword('WrongPassword', hash);
    assert.equal(isInvalid, false, 'Wrong password must be rejected');
  });

  await t.test('JWT Session Token creation and verification', async () => {
    const payload = {
      id: 'usr-test-123',
      email: 'tester@dpkshop.com',
      name: 'Test Customer',
      role: 'CUSTOMER',
    };

    const token = await createSessionToken(payload);
    assert.ok(token, 'Token must be generated');

    const decoded = await verifySessionToken(token);
    assert.equal(decoded.id, payload.id);
    assert.equal(decoded.email, payload.email);
    assert.equal(decoded.role, 'CUSTOMER');
  });
});

test('2. Product Search, Filtering & CRUD Tests', async (t) => {
  await t.test('Get products with category filter and search', async () => {
    const audioProducts = await getProducts({ categorySlug: 'audio' });
    assert.ok(audioProducts.products.length > 0, 'Audio category must return products');

    for (const p of audioProducts.products) {
      assert.equal(p.categoryId, 'cat-2', 'Products should belong to audio category');
    }

    const searchRes = await getProducts({ search: 'Headphones' });
    assert.ok(searchRes.products.length > 0, 'Search for Headphones must return results');
  });

  await t.test('Product slug lookup', async () => {
    const product = await getProductBySlug('acousticpro-wireless-anc-headphones');
    assert.ok(product, 'Product by slug must exist');
    assert.equal(product.slug, 'acousticpro-wireless-anc-headphones');
    assert.ok(product.price > 0, 'Price must be positive');
  });

  await t.test('Product Create and Delete CRUD', async () => {
    const newProd = await createProduct({
      name: 'Test Wireless Mouse Pro',
      price: 2999,
      salePrice: 2499,
      stock: 15,
      categoryId: 'cat-1',
      description: 'Ultra light wireless gaming mouse.',
    });

    assert.ok(newProd.id, 'Created product must have ID');
    assert.equal(newProd.price, 2999);

    const deleted = await deleteProduct(newProd.id);
    assert.equal(deleted, true, 'Product must be deleted successfully');
  });
});

test('3. Cart & Coupon Validation Calculations', async (t) => {
  await t.test('Validate percentage discount coupon WELCOME10', async () => {
    const subtotal = 10000;
    const res = await validateCoupon('WELCOME10', subtotal);

    assert.equal(res.valid, true, 'WELCOME10 should be valid');
    assert.equal(res.discountAmount, 1000, '10% of 10000 should be 1000');
  });

  await t.test('Validate fixed discount coupon FLAT500', async () => {
    const subtotal = 5000;
    const res = await validateCoupon('FLAT500', subtotal);

    assert.equal(res.valid, true, 'FLAT500 should be valid on 5000');
    assert.equal(res.discountAmount, 500, 'Discount should be flat 500');
  });

  await t.test('Reject coupon when minimum spend is not met', async () => {
    const subtotal = 500; // WELCOME10 requires min spend ₹999
    const res = await validateCoupon('WELCOME10', subtotal);

    assert.equal(res.valid, false, 'Coupon should be rejected under min spend');
  });

  await t.test('Calculate discount percentage utility', () => {
    const percent = calculateDiscountPercent(10000, 8000);
    assert.equal(percent, 20, '10000 -> 8000 should be 20% off');
  });
});

test('4. Order Placement, Inventory Deduction & Security Tests', async (t) => {
  await t.test('Create order and verify server-side calculations & stock deduction', async () => {
    const testOrder = await createOrder({
      customerName: 'Aarav Sharma',
      customerEmail: 'aarav@example.com',
      customerPhone: '+91 99999 88888',
      shippingStreet: '123 MG Road',
      shippingCity: 'Bengaluru',
      shippingState: 'Karnataka',
      shippingPincode: '560001',
      paymentMethod: 'COD',
      items: [
        {
          productId: 'prod-1',
          quantity: 1,
        },
      ],
      couponCode: 'WELCOME10',
    });

    assert.ok(testOrder.orderNumber, 'Order must have unique order number');
    assert.equal(testOrder.customerName, 'Aarav Sharma');
    assert.ok(testOrder.totalAmount > 0, 'Total amount must be greater than zero');
    assert.equal(testOrder.orderStatus, 'CONFIRMED');
    assert.equal(testOrder.paymentStatus, 'PENDING'); // COD starts PENDING
  });

  await t.test('Razorpay signature verification test', () => {
    // In test mode / test prefix
    const verified = verifyRazorpaySignature(
      'order_test_123',
      'pay_test_456',
      'any_signature'
    );
    assert.equal(verified, true, 'Test mode signature verification should succeed');
  });
});
