
/**
 * Handles auto-login after successful Stripe payment
 * This is called from the checkout success page
 */
export async function handleAutoLogin(sessionId: string): Promise<{
  success: boolean;
  redirectUrl?: string;
  error?: string;
}> {
  try {
    // 1. Retrieve the auto-login token for this Stripe session
    const tokenResponse = await fetch(`/api/auth/auto-login?session_id=${sessionId}`);

    if (!tokenResponse.ok) {
      return {
        success: false,
        error: 'No auto-login token available'
      };
    }

    const { token } = await tokenResponse.json();

    // 2. Use the token to authenticate
    const loginResponse = await fetch('/api/auth/auto-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, sessionId }),
    });

    if (!loginResponse.ok) {
      return {
        success: false,
        error: 'Auto-login failed'
      };
    }

    const loginData = await loginResponse.json();

    if (loginData.success) {
      // Store session data in sessionStorage for the client layout to pick up
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('auto-login-session', JSON.stringify({
          user: loginData.user,
          token: loginData.token,
          expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
        }));
      }

      return {
        success: true,
        redirectUrl: loginData.redirectUrl || '/client/onboarding'
      };
    }

    return {
      success: false,
      error: 'Authentication failed'
    };

  } catch (error) {
    console.error('Auto-login error:', error);
    return {
      success: false,
      error: 'An error occurred during auto-login'
    };
  }
}

/**
 * Validates if there's an active auto-login session in sessionStorage
 */
export function hasAutoLoginSession(): boolean {
  if (typeof window === 'undefined') return false;

  const sessionData = sessionStorage.getItem('auto-login-session');
  if (!sessionData) return false;

  try {
    const session = JSON.parse(sessionData);
    return session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

/**
 * Retrieves the auto-login session data
 */
export function getAutoLoginSession(): any {
  if (typeof window === 'undefined') return null;

  const sessionData = sessionStorage.getItem('auto-login-session');
  if (!sessionData) return null;

  try {
    const session = JSON.parse(sessionData);
    if (session.expiresAt > Date.now()) {
      return session;
    }
    // Clean up expired session
    sessionStorage.removeItem('auto-login-session');
    return null;
  } catch {
    return null;
  }
}

/**
 * Clears the auto-login session
 */
export function clearAutoLoginSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('auto-login-session');
  }
}