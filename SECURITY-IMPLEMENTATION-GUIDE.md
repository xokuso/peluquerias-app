# 🔐 SECURITY IMPLEMENTATION GUIDE

## Quick Start Security Fixes

### 1. Install Required Security Dependencies

```bash
# Core security packages
npm install --save \
  @upstash/ratelimit \
  @upstash/redis \
  isomorphic-dompurify \
  jsonwebtoken \
  bcryptjs \
  helmet \
  express-rate-limit \
  express-mongo-sanitize \
  xss \
  hpp

# Development security tools
npm install --save-dev \
  @types/jsonwebtoken \
  @types/bcryptjs \
  eslint-plugin-security \
  npm-audit-html
```

### 2. Environment Variables Security

Create `.env.production.example`:

```env
# Production Environment Variables Template
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database (use connection string from cloud provider)
DATABASE_URL=${SECRET_DATABASE_URL}

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=${SECRET_NEXTAUTH_KEY}

# Stripe (use restricted keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=${SECRET_STRIPE_KEY}
STRIPE_WEBHOOK_SECRET=${SECRET_STRIPE_WEBHOOK}

# Email Service
RESEND_API_KEY=${SECRET_RESEND_KEY}
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Analytics (public keys are safe)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=XXXXXXXXXX

# Security
JWT_SECRET=${SECRET_JWT_KEY}
ENCRYPTION_KEY=${SECRET_ENCRYPTION_KEY}
CSRF_SECRET=${SECRET_CSRF_KEY}

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=${SECRET_REDIS_URL}
UPSTASH_REDIS_REST_TOKEN=${SECRET_REDIS_TOKEN}

# Monitoring
SENTRY_DSN=${SECRET_SENTRY_DSN}
```

### 3. Update API Endpoints with Security

#### Example: Secure Payment Intent Endpoint

```typescript
// src/app/api/create-payment-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { rateLimits, checkRateLimit } from "@/lib/security/rate-limit";
import { validateRequestBody } from "@/lib/security/validation";
import { verifyCSRFToken } from "@/lib/security/csrf";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover"
});

const paymentSchema = z.object({
  amount: z.number().min(1).max(999999),
  csrf: z.string(),
  // ... other fields
});

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const rateLimitResult = await checkRateLimit(request, rateLimits.payment);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.reset)
          }
        }
      );
    }

    // 2. Parse and validate body
    const body = await request.json();
    const validation = await validateRequestBody(body, paymentSchema);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.errors },
        { status: 400 }
      );
    }

    // 3. CSRF protection
    if (!verifyCSRFToken(validation.data.csrf)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 403 }
      );
    }

    // 4. Create payment intent with validated data
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(validation.data.amount * 100),
      currency: "eur",
      metadata: {
        source: "secure-checkout",
        timestamp: new Date().toISOString()
      }
    });

    // 5. Return sanitized response
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id
    });

  } catch (error) {
    // 6. Secure error handling
    console.error("Payment intent error:", error);

    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    );
  }
}
```

### 4. Implement CSRF Protection

```typescript
// src/lib/security/csrf.ts
import crypto from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'dev-secret';

export function generateCSRFToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(token)
    .digest('hex');

  return `${token}.${hash}`;
}

export function verifyCSRFToken(token: string): boolean {
  if (!token) return false;

  const [value, hash] = token.split('.');
  if (!value || !hash) return false;

  const expectedHash = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(value)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(expectedHash)
  );
}

// Hook for client-side
export function useCSRF() {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    fetch('/api/csrf')
      .then(res => res.json())
      .then(data => setToken(data.token));
  }, []);

  return token;
}
```

### 5. Secure Stripe Webhook

```typescript
// src/app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Stripe webhook IPs for additional validation
const STRIPE_IPS = [
  '3.18.12.63', '3.130.192.231', '13.235.14.237',
  '13.235.122.149', '18.211.135.69', '35.154.171.200',
  '52.15.183.38', '54.88.130.119', '54.88.130.237',
  '54.187.174.169', '54.187.205.235', '54.187.216.72'
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = headers().get('stripe-signature');

    // Verify signature
    if (!sig) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Optional: Verify source IP
    const forwardedFor = headers().get('x-forwarded-for');
    if (process.env.NODE_ENV === 'production') {
      const sourceIp = forwardedFor?.split(',')[0].trim();
      if (!sourceIp || !STRIPE_IPS.includes(sourceIp)) {
        console.warn(`Webhook from unknown IP: ${sourceIp}`);
        // Log but don't block (Stripe IPs can change)
      }
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Idempotency check
    const eventId = event.id;
    const processed = await checkIfEventProcessed(eventId);
    if (processed) {
      return NextResponse.json({ received: true });
    }

    // Process event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      // ... other events
    }

    // Mark as processed
    await markEventAsProcessed(eventId);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook failed' },
      { status: 500 }
    );
  }
}
```

### 6. Add Security Monitoring

```typescript
// src/lib/monitoring/security.ts
import * as Sentry from '@sentry/nextjs';

export function initSecurityMonitoring() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    beforeSend(event, hint) {
      // Filter sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers?.authorization;
      }

      // Don't send events in development
      if (process.env.NODE_ENV === 'development') {
        return null;
      }

      return event;
    },
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
    ],
    tracesSampleRate: 0.1,
  });
}

// Log security events
export function logSecurityEvent(event: {
  type: 'auth_failure' | 'rate_limit' | 'suspicious_activity' | 'payment_error';
  details: any;
  userId?: string;
  ip?: string;
}) {
  console.log('[SECURITY]', event);

  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(`Security Event: ${event.type}`, {
      level: 'warning',
      extra: event
    });
  }
}
```

### 7. Implement Authentication

```typescript
// src/lib/auth/config.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        // Get user from database
        const user = await getUserByEmail(credentials.email);
        if (!user || !user.hashedPassword) {
          throw new Error('User not found');
        }

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  }
};
```

### 8. Package.json Security Scripts

Add these scripts to your package.json:

```json
{
  "scripts": {
    "security:check": "npm audit --audit-level=high",
    "security:fix": "npm audit fix --force",
    "security:report": "npm audit --json | npm-audit-html -o security-report.html",
    "security:headers": "securityheaders https://yourdomain.com",
    "security:scan": "snyk test",
    "precommit": "npm run security:check && npm run lint && npm run type-check"
  }
}
```

## Deployment Security Checklist

### Before Going Live:

- [ ] All environment variables moved to secret manager
- [ ] Database using SSL connections
- [ ] HTTPS enforced everywhere
- [ ] Rate limiting active on all endpoints
- [ ] Authentication required on admin routes
- [ ] CSRF protection implemented
- [ ] Input validation on all forms
- [ ] Security headers configured
- [ ] Error messages sanitized
- [ ] Monitoring and alerting active
- [ ] Backup strategy implemented
- [ ] Incident response plan ready
- [ ] Security testing completed
- [ ] Penetration test scheduled
- [ ] GDPR compliance verified

## Testing Security

### 1. Test Rate Limiting
```bash
# Test rate limiting
for i in {1..20}; do
  curl -X POST https://localhost:3000/api/create-payment-intent \
    -H "Content-Type: application/json" \
    -d '{"amount": 100}'
done
```

### 2. Test Input Validation
```bash
# Test XSS
curl -X POST https://localhost:3000/api/send-confirmation-email \
  -H "Content-Type: application/json" \
  -d '{"email": "<script>alert(1)</script>@test.com"}'

# Test SQL Injection
curl -X POST https://localhost:3000/api/check-domain \
  -H "Content-Type: application/json" \
  -d '{"domain": "test; DROP TABLE users;--"}'
```

### 3. Security Headers Check
```bash
# Check security headers
curl -I https://localhost:3000
```

## Support & Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Next.js Security: https://nextjs.org/docs/advanced-features/security-headers
- Stripe Security: https://stripe.com/docs/security
- Security Headers: https://securityheaders.com/
- Mozilla Observatory: https://observatory.mozilla.org/

---

**Remember:** Security is an ongoing process. Regular updates, monitoring, and testing are essential for maintaining a secure application.