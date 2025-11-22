import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '@/types/admin';

// Get JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

// Validate JWT secret is properly configured
if (!JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET or NEXTAUTH_SECRET environment variable must be configured');
}
const COOKIE_NAME = 'admin_token';

export interface AdminSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  exp: number;
}

// Mock user database - In production, replace with actual database
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@salon.com',
    password: '$2a$10$YourHashedPasswordHere', // bcrypt hash of 'admin123'
    name: 'Admin User',
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'manager@salon.com',
    password: '$2a$10$YourHashedPasswordHere',
    name: 'Manager User',
    role: UserRole.MANAGER,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  try {
    // In production, fetch from database
    const user = mockUsers.find((u) => u.email === email);

    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Account is disabled' };
    }

    // In production, properly verify password
    const isValid = await bcrypt.compare(password, user.password || '');

    // For demo purposes, accept specific passwords
    const isDemoValid =
      (email === 'admin@salon.com' && password === 'admin123') ||
      (email === 'manager@salon.com' && password === 'manager123');

    if (!isValid && !isDemoValid) {
      return { success: false, error: 'Invalid credentials' };
    }

    const token = generateToken(user);

    // Update last login
    user.lastLogin = new Date();

    // Remove password from the user object for security
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return {
      success: true,
      user: userWithoutPassword as User,
      token
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

export function generateToken(user: User): string {
  if (!JWT_SECRET) {
    throw new Error('JWT secret is not configured. Cannot generate tokens.');
  }

  const payload: AdminSession = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
  };

  return jwt.sign(payload, JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AdminSession | null> {
  try {
    if (!JWT_SECRET) {
      console.error('JWT secret is not configured. Cannot verify tokens.');
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AdminSession;

    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function getSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME);

    if (!token?.value) {
      return null;
    }

    return await verifyToken(token.value);
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

export async function setSession(token: string): Promise<void> {
  const cookieStore = cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function hasPermission(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    [UserRole.SUPER_ADMIN]: 5,
    [UserRole.ADMIN]: 4,
    [UserRole.MANAGER]: 3,
    [UserRole.EMPLOYEE]: 2,
    [UserRole.CLIENT]: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export async function requireAuth(
  request: NextRequest,
  requiredRole: UserRole = UserRole.EMPLOYEE
): Promise<AdminSession | NextResponse> {
  const token = request.cookies.get(COOKIE_NAME);

  if (!token?.value) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const session = await verifyToken(token.value);

  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (!hasPermission(session.role, requiredRole)) {
    return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
  }

  return session;
}