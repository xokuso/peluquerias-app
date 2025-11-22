'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

interface AutoLoginContextType {
  isAutoLoginActive: boolean;
  autoLoginUser: any;
}

const AutoLoginContext = createContext<AutoLoginContextType>({
  isAutoLoginActive: false,
  autoLoginUser: null
});

export function useAutoLogin() {
  return useContext(AutoLoginContext);
}

export function AutoLoginProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [autoLoginData, setAutoLoginData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check for auto-login session in cookies or sessionStorage
    const checkAutoLogin = async () => {
      try {
        // Check if we have a valid session cookie from auto-login
        const response = await fetch('/api/auth/session');

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setAutoLoginData(data.user);
          }
        }
      } catch (error) {
        console.error('Error checking auto-login:', error);
      } finally {
        setIsChecking(false);
      }
    };

    // Only check if no regular session and we're on a protected route
    if (status !== 'loading' && !session && pathname?.startsWith('/client')) {
      checkAutoLogin();
    } else {
      setIsChecking(false);
    }
  }, [session, status, pathname]);

  // Allow access if we have either a regular session or auto-login data
  const hasAccess = session || autoLoginData;

  // Show loading while checking authentication
  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if no access and on protected route
  if (!hasAccess && pathname?.startsWith('/client') && !pathname?.includes('autologin')) {
    router.push('/login');
    return null;
  }

  return (
    <AutoLoginContext.Provider
      value={{
        isAutoLoginActive: !!autoLoginData,
        autoLoginUser: autoLoginData || session?.user
      }}
    >
      {children}
    </AutoLoginContext.Provider>
  );
}