/**
 * NextAuth.js Configuration
 * Complete authentication setup with JWT, session management, and role-based access
 */

import type { NextAuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { UserRole } from "@prisma/client";

// Custom user type extending NextAuth User
interface ExtendedUser extends User {
  role: UserRole;
  salonName: string | null;
  hasCompletedOnboarding: boolean;
  isActive: boolean;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET!,

  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
    newUser: "/auth/new-user",
  },

  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      allowDangerousEmailAccountLinking: true,
    }),

    // Credentials Provider for email/password
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "tu@email.com"
        },
        password: {
          label: "Contraseña",
          type: "password"
        },
      },

      async authorize(credentials): Promise<ExtendedUser | null> {
        try {
          // Validate input
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email y contraseña son requeridos");
          }

          // Find user
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              image: true,
              role: true,
              salonName: true,
              hasCompletedOnboarding: true,
              emailVerified: true,
              isActive: true,
              loginAttempts: true,
              lockUntil: true,
            },
          });

          if (!user) {
            // Log failed attempt without revealing user existence
            console.log(`Failed login attempt for: ${credentials.email}`);
            throw new Error("Credenciales inválidas");
          }

          // Check if account is locked
          if (user.lockUntil && user.lockUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / (1000 * 60));
            throw new Error(`Cuenta bloqueada. Intenta de nuevo en ${minutesLeft} minutos`);
          }

          // Check if account is active
          if (!user.isActive) {
            throw new Error("Tu cuenta ha sido desactivada. Contacta al administrador");
          }

          // Verify password
          if (!user.password) {
            throw new Error("Por favor, inicia sesión con Google o restablece tu contraseña");
          }

          const isValidPassword = await compare(credentials.password, user.password);

          if (!isValidPassword) {
            // Increment failed attempts
            const attempts = user.loginAttempts + 1;
            const maxAttempts = 5;

            if (attempts >= maxAttempts) {
              // Lock account for 30 minutes
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  loginAttempts: attempts,
                  lockUntil: new Date(Date.now() + 30 * 60 * 1000),
                },
              });
              throw new Error("Demasiados intentos fallidos. Cuenta bloqueada por 30 minutos");
            } else {
              await prisma.user.update({
                where: { id: user.id },
                data: { loginAttempts: attempts },
              });
              throw new Error(`Contraseña incorrecta. ${maxAttempts - attempts} intentos restantes`);
            }
          }

          // Check email verification
          if (!user.emailVerified) {
            throw new Error("Por favor verifica tu email antes de iniciar sesión");
          }

          // Reset login attempts and update last login
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: 0,
              lockUntil: null,
              lastLogin: new Date(),
            },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image || null,
            role: user.role,
            salonName: user.salonName,
            hasCompletedOnboarding: user.hasCompletedOnboarding,
            isActive: user.isActive,
          } as ExtendedUser;
        } catch (error) {
          console.error("Authentication error:", error);
          if (error instanceof Error) {
            throw error;
          }
          throw new Error("Error de autenticación");
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }): Promise<boolean> {
      try {
        // Handle OAuth sign in
        if (account?.provider === "google") {
          if (user.email && profile && 'email_verified' in profile && profile.email_verified) {
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email },
            });

            if (existingUser) {
              // Update user info from Google
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  emailVerified: existingUser.emailVerified || new Date(),
                  lastLogin: new Date(),
                  image: user.image || existingUser.image,
                  name: user.name || existingUser.name,
                },
              });
            } else {
              // Create new user with Google info
              await prisma.user.create({
                data: {
                  email: user.email,
                  name: user.name,
                  image: user.image || null,
                  emailVerified: new Date(),
                  role: "CLIENT",
                  isActive: true,
                  lastLogin: new Date(),
                },
              });
            }
          }
        }

        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },

    async jwt({ token, user, account, trigger, session }): Promise<JWT> {
      // Initial sign in
      if (account && user) {
        const extendedUser = user as ExtendedUser;
        return {
          ...token,
          id: extendedUser.id,
          email: extendedUser.email,
          name: extendedUser.name,
          image: extendedUser.image,
          role: extendedUser.role,
          salonName: extendedUser.salonName,
          hasCompletedOnboarding: extendedUser.hasCompletedOnboarding,
          isActive: extendedUser.isActive,
        };
      }

      // Update token from database on each request
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            role: true,
            salonName: true,
            hasCompletedOnboarding: true,
            isActive: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.salonName = dbUser.salonName;
          token.hasCompletedOnboarding = dbUser.hasCompletedOnboarding;
          token.isActive = dbUser.isActive;
        }
      }

      // Handle session updates
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      return token;
    },

    async session({ session, token }): Promise<Session> {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string | null,
          image: token.image as string | null,
          role: token.role as UserRole,
          salonName: token.salonName as string | null,
          hasCompletedOnboarding: token.hasCompletedOnboarding as boolean,
          isActive: token.isActive as boolean,
        },
      };
    },

    async redirect({ url, baseUrl }): Promise<string> {
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },

  events: {
    async signIn({ user, account }): Promise<void> {
      console.log(`User signed in: ${user.email} via ${account?.provider}`);
    },

    async signOut({ session: _session, token }): Promise<void> {
      console.log(`User signed out: ${token?.email}`);
    },

    async createUser({ user }): Promise<void> {
      console.log(`New user created: ${user.email}`);
      // Here you could send a welcome email
    },

    async linkAccount({ user, account }): Promise<void> {
      console.log(`Account linked: ${user.email} with ${account.provider}`);
    },

    async session({ session: _session, token: _token }): Promise<void> {
      // Could be used for analytics
    },
  },

  debug: process.env.NODE_ENV === "development",
};