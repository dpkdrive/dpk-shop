import crypto from 'crypto';
import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

export function getRazorpayClient() {
  if (!keyId || !keySecret || keyId.includes('YourTestKeyId') || keySecret.includes('YourTestKeySecret')) {
    throw new Error('Razorpay is not configured.');
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export function getRazorpayKeyId() {
  if (!keyId || keyId.includes('YourTestKeyId')) throw new Error('Razorpay is not configured.');
  return keyId;
}

export async function createRazorpayOrder(amountInRupees, receiptId) {
  const amountInPaise = Math.round(Number(amountInRupees) * 100);
  if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) throw new Error('Invalid order amount.');
  const order = await getRazorpayClient().orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: String(receiptId).slice(0, 40),
    payment_capture: 1,
  });
  return { id: order.id, amount: order.amount, currency: order.currency, key: getRazorpayKeyId() };
}

export function verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !keySecret || keySecret.includes('YourTestKeySecret')) return false;
  const expected = crypto.createHmac('sha256', keySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest();
  let received;
  try { received = Buffer.from(razorpaySignature, 'hex'); } catch { return false; }
  return received.length === expected.length && crypto.timingSafeEqual(expected, received);
}

export function verifyWebhookSignature(bodyString, webhookSignature) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret || !webhookSignature) return false;
  const expected = crypto.createHmac('sha256', webhookSecret).update(bodyString).digest();
  const received = Buffer.from(webhookSignature, 'hex');
  return received.length === expected.length && crypto.timingSafeEqual(expected, received);
}
