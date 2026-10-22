import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'dpk-shop-ultra-secure-and-robust-jwt-session-secret-key-32chars';
const secretKey = new TextEncoder().encode(JWT_SECRET_STRING);

export const AUTH_COOKIE_NAME = 'dpk_shop_session';

/**
 * Hash a plain text password with salt
 */
export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compare plain text password with hashed password
 */
export async function comparePassword(plainPassword, hashedPassword) {
  if (!plainPassword || !hashedPassword) return false;
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Create a signed JWT session token
 */
export async function createSessionToken(payload) {
  return new SignJWT({
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role || 'CUSTOMER',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(request) {
  try {
    let token = null;
    if (request && typeof request.cookies?.get === 'function') {
      token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    }
    if (!token) {
      try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
      } catch {
        try {
          const { cookies } = await import('next/headers.js');
          const cookieStore = await cookies();
          token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
        } catch {
          // Ignore
        }
      }
    }
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Server-side guard to verify user is logged in
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

/**
 * Server-side guard to verify user has ADMIN role
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    throw new Error('FORBIDDEN_ADMIN_ONLY');
  }
  return user;
}
