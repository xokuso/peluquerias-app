import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, getCurrentUser } from '@/lib/auth';

export async function GET(_req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const user = await getCurrentUser();

    return NextResponse.json({
      authenticated: !!session,
      session,
      user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}