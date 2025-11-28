import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Hash password
    const hashedPassword = await hash('admin123', 12);

    // Try to create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@salon.com' },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        hasCompletedOnboarding: true,
        loginAttempts: 0,
        lockUntil: null,
      },
      create: {
        email: 'admin@salon.com',
        name: 'Administrador Sistema',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        hasCompletedOnboarding: true,
        loginAttempts: 0,
        emailVerified: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created/updated successfully',
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      credentials: {
        email: 'admin@salon.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create admin user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to create admin user with email: admin@salon.com and password: admin123'
  });
}