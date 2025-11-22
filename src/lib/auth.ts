/**
 * Main authentication export file
 * Re-exports the auth configuration for use throughout the app
 */

export { authOptions } from "./auth/auth-options";
export { getServerSession } from "next-auth";

import { getServerSession as originalGetServerSession } from "next-auth";
import { authOptions } from "./auth/auth-options";
import type { Session } from "next-auth";

/**
 * Wrapper for getServerSession with our auth options pre-configured
 */
export async function getCurrentSession(): Promise<Session | null> {
  return originalGetServerSession(authOptions);
}

/**
 * Get current user from session
 */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: string): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("ADMIN");
}

/**
 * Check if user is client
 */
export async function isClient(): Promise<boolean> {
  return hasRole("CLIENT");
}