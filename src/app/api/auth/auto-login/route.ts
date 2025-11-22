import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { rateLimiters } from '@/lib/rate-limit';

/**
 * GET /api/auth/auto-login?session_id=xxx
 * Obtiene el token de auto-login para una sesión de checkout específica
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const headersList = await headers();
  const retryAttempt = headersList.get('x-retry-attempt') || '0';

  // Apply rate limiting for auto-login token requests
  const rateLimitResult = rateLimiters.autoLogin(req);
  if (!rateLimitResult.success) {
    console.log('🚫 Rate limit exceeded for auto-login token request:', {
      retryAfter: rateLimitResult.retryAfter,
      remaining: rateLimitResult.remaining
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please wait before trying again.',
        retryAfter: rateLimitResult.retryAfter
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
          'Retry-After': (rateLimitResult.retryAfter || 60).toString()
        }
      }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Searching for auto-login token [attempt ${retryAttempt}]:`, {
      sessionId,
      retryAttempt: parseInt(retryAttempt),
      timestamp: new Date().toISOString()
    });

    // 🚀 OPTIMIZED QUERY: Use indexed sessionId column for fast lookup
    const autoLoginToken = await prisma.autoLoginToken.findFirst({
      where: {
        sessionId: sessionId,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    });

    if (!autoLoginToken) {
      const searchTime = Date.now() - startTime;
      console.log(`❌ No valid auto-login token found for session [attempt ${retryAttempt}]:`, {
        sessionId,
        searchTimeMs: searchTime,
        retryAttempt: parseInt(retryAttempt)
      });

      // 🔍 Debug: Check all tokens for this session using optimized query
      const debugTokens = await prisma.autoLoginToken.findMany({
        where: {
          sessionId: sessionId
        },
        select: {
          id: true,
          used: true,
          expiresAt: true,
          createdAt: true,
          metadata: true
        }
      });

      console.log('🐛 Debug - Token analysis for session:', {
        sessionId,
        tokensForThisSession: debugTokens.length,
        tokensForThisSessionDetails: debugTokens.map(t => ({
          id: t.id,
          used: t.used,
          expired: t.expiresAt < new Date(),
          createdAt: t.createdAt,
          expiresAt: t.expiresAt
        }))
      });

      // Provide different error messages based on retry attempt
      let errorMessage = 'No valid auto-login token found';
      let shouldRetry = true;

      if (debugTokens.length === 0) {
        if (parseInt(retryAttempt) < 3) {
          errorMessage = 'Token not ready yet - webhook may still be processing';
        } else {
          errorMessage = 'No token created - webhook may have failed';
          shouldRetry = false;
        }
      } else {
        const hasExpiredTokens = debugTokens.some(t => t.expiresAt < new Date());
        const hasUsedTokens = debugTokens.some(t => t.used);

        if (hasUsedTokens) {
          errorMessage = 'Token already used';
          shouldRetry = false;
        } else if (hasExpiredTokens) {
          errorMessage = 'Token expired';
          shouldRetry = false;
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          shouldRetry,
          retryAttempt: parseInt(retryAttempt),
          searchTimeMs: searchTime,
          debug: process.env.NODE_ENV === 'development' ? {
            tokensFound: debugTokens.length,
            tokens: debugTokens
          } : undefined
        },
        { status: 404 }
      );
    }

    console.log('✅ Auto-login token found for user:', autoLoginToken.user.email);

    const response = NextResponse.json({
      success: true,
      token: autoLoginToken.token,
      user: autoLoginToken.user,
      expiresAt: autoLoginToken.expiresAt
    });

    // Add rate limit headers to successful response
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetTime / 1000).toString());

    return response;

  } catch (error) {
    console.error('❌ Error retrieving auto-login token:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/auto-login
 * Consume el token de auto-login y crea una sesión JWT
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const headersList = await headers();
  const retryAttempt = headersList.get('x-retry-attempt') || '0';

  // Apply rate limiting for auto-login consumption
  const rateLimitResult = rateLimiters.autoLogin(req);
  if (!rateLimitResult.success) {
    console.log('🚫 Rate limit exceeded for auto-login consumption:', {
      retryAfter: rateLimitResult.retryAfter,
      remaining: rateLimitResult.remaining
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please wait before trying again.',
        retryAfter: rateLimitResult.retryAfter
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
          'Retry-After': (rateLimitResult.retryAfter || 60).toString()
        }
      }
    );
  }

  try {
    const { token, sessionId } = await req.json();

    if (!token || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Token and sessionId required' },
        { status: 400 }
      );
    }

    console.log(`🔐 Attempting auto-login [attempt ${retryAttempt}]:`, {
      tokenPreview: token.substring(0, 8) + '...',
      sessionId,
      retryAttempt: parseInt(retryAttempt),
      timestamp: new Date().toISOString()
    });

    // 🚀 OPTIMIZED QUERY: Verify token with sessionId using indexed columns
    const autoLoginToken = await prisma.autoLoginToken.findFirst({
      where: {
        token: token,
        sessionId: sessionId,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            salonName: true,
            hasCompletedOnboarding: true
          }
        }
      }
    });

    if (!autoLoginToken) {
      console.log('❌ Invalid or expired auto-login token for session:', sessionId);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Marcar el token como usado
    await prisma.autoLoginToken.update({
      where: { id: autoLoginToken.id },
      data: {
        used: true,
        usedAt: new Date()
      }
    });

    console.log('✅ Token consumed successfully for user:', autoLoginToken.user.email);

    // Generar JWT para la sesión
    const jwtPayload = {
      userId: autoLoginToken.user.id,
      email: autoLoginToken.user.email,
      name: autoLoginToken.user.name,
      role: autoLoginToken.user.role,
      sessionId: sessionId,
      source: 'auto_login'
    };

    // Ensure JWT secret is properly configured
    const jwtSecret = process.env.NEXTAUTH_SECRET;

    if (!jwtSecret) {
      console.error('🔒 CRITICAL: NEXTAUTH_SECRET environment variable is not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication configuration error. Please contact support.'
        },
        { status: 500 }
      );
    }

    const jwtToken = jwt.sign(jwtPayload, jwtSecret, {
      expiresIn: '7d'
    });

    // Actualizar último login del usuario
    await prisma.user.update({
      where: { id: autoLoginToken.user.id },
      data: {
        lastLogin: new Date()
      }
    });

    // Determinar URL de redirección basada en si completó el onboarding
    let redirectUrl = '/client/onboarding';

    if (autoLoginToken.user.hasCompletedOnboarding) {
      redirectUrl = '/client/dashboard';
    }

    console.log('🎯 Redirecting to:', redirectUrl);

    const response = NextResponse.json({
      success: true,
      user: autoLoginToken.user,
      redirectUrl: redirectUrl,
      sessionToken: jwtToken
    });

    // Add rate limit headers to successful response
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetTime / 1000).toString());

    // Establecer cookie de sesión para NextAuth
    response.cookies.set('next-auth.session-token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });

    return response;

  } catch (error) {
    console.error('❌ Error processing auto-login:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
