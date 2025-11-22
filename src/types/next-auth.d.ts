import { UserRole, BusinessType } from "@prisma/client";

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      salonName: string | null;
      phone: string | null;
      city: string | null;
      address: string | null;
      website: string | null;
      businessType: BusinessType | string | null;
      role: UserRole;
      hasCompletedOnboarding: boolean;
      isActive: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    salonName: string | null;
    phone?: string | null;
    city?: string | null;
    address?: string | null;
    website?: string | null;
    businessType?: BusinessType | string | null;
    role: UserRole;
    hasCompletedOnboarding: boolean;
    isActive: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    salonName: string | null;
    phone?: string | null;
    city?: string | null;
    address?: string | null;
    website?: string | null;
    businessType?: BusinessType | string | null;
    role: UserRole;
    hasCompletedOnboarding: boolean;
    isActive: boolean;
  }
}