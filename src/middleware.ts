/**
 * Authentication & Security Middleware
 * Implements route protection, role-based access, and security headers
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { isMaintenanceMode } from "@/lib/settings-edge";

// Security headers configuration
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Define protected routes and their required roles
const protectedRoutes = {
  '/client': ['CLIENT', 'ADMIN'],
  '/client/*': ['CLIENT', 'ADMIN'],
  '/admin': ['ADMIN'],
  '/profile': ['CLIENT', 'ADMIN'],
  '/settings': ['CLIENT', 'ADMIN'],
  '/api/user': ['CLIENT', 'ADMIN'],
  '/api/admin': ['ADMIN'],
  '/api/orders': ['CLIENT', 'ADMIN'],
  '/api/client': ['CLIENT', 'ADMIN'],
};

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/templates',
  '/pricing',
  '/contact',
  '/oferta',
  '/mantenimiento',
  '/checkout/success',
  '/checkout/success/autologin',
  '/client/setup',
  '/api/auth',
  '/api/create-payment-intent',
  '/api/webhooks',
  '/api/stripe/webhooks',
  '/api/stripe/checkout',
  '/api/stripe/session/*',
  '/api/settings',
];

// Helper function to check if a path matches a pattern
function matchesPath(path: string, pattern: string): boolean {
  if (pattern.endsWith('*')) {
    return path.startsWith(pattern.slice(0, -1));
  }
  return path === pattern;
}

// Helper function to get required role for a path
function getRequiredRoles(path: string): string[] | null {
  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (matchesPath(path, route)) {
      return roles;
    }
  }
  return null;
}

// Helper function to check if path is public
function isPublicRoute(path: string): boolean {
  return publicRoutes.some(route => matchesPath(path, route));
}

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth.token;

    // Create response with security headers
    const response = NextResponse.next();

    // Apply security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Skip middleware for static assets
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      pathname.includes('.')
    ) {
      return response;
    }

    // Check maintenance mode
    try {
      const maintenanceActive = isMaintenanceMode();

      if (maintenanceActive && pathname !== '/mantenimiento') {
        // Allow admin users to access the site during maintenance
        if (token?.role === 'ADMIN') {
          // Allow admin access but show a warning banner
          response.headers.set('X-Maintenance-Mode', 'true');
          response.headers.set('X-User-Role', 'ADMIN');
        } else {
          // Redirect all other users to maintenance page
          return NextResponse.redirect(new URL('/mantenimiento', req.url));
        }
      } else if (!maintenanceActive && pathname === '/mantenimiento') {
        // If maintenance mode is disabled but user is on maintenance page, redirect to home
        return NextResponse.redirect(new URL('/', req.url));
      }
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
      // If there's an error checking maintenance mode, proceed normally
    }

    // Allow public routes
    if (isPublicRoute(pathname)) {
      // Redirect authenticated users away from auth pages
      if (token && (pathname === '/login' || pathname === '/signup')) {
        const redirectUrl = token.role === 'ADMIN' ? '/admin' : '/client';
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
      return response;
    }

    // Check authentication for protected routes
    const requiredRoles = getRequiredRoles(pathname);

    if (requiredRoles) {
      // User is not authenticated
      if (!token) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check if user is active
      if (token.isActive === false) {
        return NextResponse.redirect(new URL('/account-disabled', req.url));
      }

      // Check role-based access
      if (!requiredRoles.includes(token.role as string)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }

      // Check onboarding status for clients
      if (
        token.role === 'CLIENT' &&
        token.hasCompletedOnboarding === false &&
        pathname !== '/client/setup'
      ) {
        return NextResponse.redirect(new URL('/client/setup', req.url));
      }
    }

    // API route protection
    if (pathname.startsWith('/api')) {
      // Skip auth for webhooks and public API endpoints
      if (
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/api/webhooks') ||
        pathname.startsWith('/api/stripe/webhooks') ||
        pathname === '/api/create-payment-intent' ||
        pathname === '/api/check-domain' ||
        pathname === '/api/simplified-checkout' ||
        pathname.startsWith('/api/stripe/session') ||
        pathname === '/api/templates'
      ) {
        return response;
      }

      // Require authentication for all other API routes
      if (!token) {
        return new NextResponse(
          JSON.stringify({ error: 'Authentication required' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'WWW-Authenticate': 'Bearer',
            },
          }
        );
      }

      // Check role for admin API routes
      if (pathname.startsWith('/api/admin') && token.role !== 'ADMIN') {
        return new NextResponse(
          JSON.stringify({ error: 'Admin access required' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Add user info to request headers for API routes
      if (token.id) response.headers.set('X-User-Id', token.id as string);
      if (token.role) response.headers.set('X-User-Role', token.role as string);
      if (token.email) response.headers.set('X-User-Email', token.email as string);
    }

    // Add CSP header for enhanced security
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://accounts.google.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com https://accounts.google.com",
      "frame-ancestors 'none'",
    ];
    response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public routes without authentication
        if (isPublicRoute(req.nextUrl.pathname)) {
          return true;
        }
        // For protected routes, require authentication
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
      error: '/auth/error',
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt (static files)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
};