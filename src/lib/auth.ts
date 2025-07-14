import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = (process.env.JWT_SECRET || 'fallback-secret-key') as string;
const JWT_EXPIRE_TIME = (process.env.JWT_EXPIRE_TIME || '7d') as string;

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface AdminJWTPayload {
  adminId: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Generate JWT token
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRE_TIME as string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload as any, JWT_SECRET, options);
}

// Generate Admin JWT token
export function generateAdminToken(payload: Omit<AdminJWTPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRE_TIME as string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload as any, JWT_SECRET, options);
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Verify Admin JWT token
export function verifyAdminToken(token: string): AdminJWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminJWTPayload;
  } catch {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Extract token from request
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check for token in cookies
  const tokenCookie = request.cookies.get('auth-token');
  return tokenCookie?.value || null;
}

// Extract admin token from request
export function getAdminTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check for admin token in cookies
  const tokenCookie = request.cookies.get('admin-token');
  return tokenCookie?.value || null;
}

// Middleware function to verify authentication
export function verifyAuthToken(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  
  return verifyToken(token);
}

// Middleware function to verify admin authentication
export function verifyAdminAuthToken(request: NextRequest): AdminJWTPayload | null {
  const token = getAdminTokenFromRequest(request);
  if (!token) return null;
  
  return verifyAdminToken(token);
} 