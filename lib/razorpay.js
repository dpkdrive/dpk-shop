import crypto from 'crypto';
import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

let razorpayInstance = null;

if (keyId && keySecret && !keyId.includes('YourTestKeyId')) {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  } catch (err) {
    console.warn('Razorpay initialization notice:', err.message);
  }
}

/**
 * Create a Razorpay Order
 * @param {number} amountInInr - Amount in INR (will be converted to paise)
 * @param {string} receiptId - Unique order receipt ID
 */
export async function createRazorpayOrder(amountInInr, receiptId) {
  const amountInPaise = Math.round(amountInInr * 100);

  // If Razorpay credentials are fully configured, use real Razorpay API
  if (razorpayInstance) {
    try {
      const order = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId || `rcpt_${Date.now()}`,
        payment_capture: 1,
      });
      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: keyId,
        isTestSimulation: false,
      };
    } catch (error) {
      console.error('Razorpay Order Creation Error:', error);
      throw new Error(`Razorpay API Error: ${error.error?.description || error.message}`);
    }
  }

  // Development & Test Mode simulation when keys are test placeholders
  return {
    id: `order_test_${Date.now()}`,
    amount: amountInPaise,
    currency: 'INR',
    key: keyId || 'rzp_test_simulated_key',
    isTestSimulation: true,
  };
}

/**
 * Verify Razorpay payment signature
 * @param {string} razorpayOrderId
 * @param {string} razorpayPaymentId
 * @param {string} razorpaySignature
 */
export function verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  // If simulated development test order
  if (razorpayOrderId.startsWith('order_test_') || !keySecret || keySecret.includes('YourTestKeySecret')) {
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return generatedSignature === razorpaySignature;
}

/**
 * Verify Razorpay Webhook signature
 */
export function verifyWebhookSignature(bodyString, webhookSignature) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(bodyString)
    .digest('hex');

  return expectedSignature === webhookSignature;
}
