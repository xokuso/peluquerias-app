"use client";

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { pageview, GA_TRACKING_ID, FB_PIXEL_ID, initAnalytics } from '@/lib/analytics';

export function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (GA_TRACKING_ID) {
      pageview(pathname);
    }
  }, [pathname]);

  if (!GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            gtag('consent', 'default', {
              'analytics_storage': 'denied'
            });

            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              send_page_view: false
            });
          `,
        }}
      />
    </>
  );
}

export function FacebookPixel() {
  useEffect(() => {
    if (FB_PIXEL_ID) {
      initAnalytics();
    }
  }, []);

  if (!FB_PIXEL_ID) {
    return null;
  }

  return (
    <Script
      id="facebook-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');

          fbq('consent', 'revoke');
          fbq('init', '${FB_PIXEL_ID}');
          fbq('track', 'PageView');
        `,
      }}
    />
  );
}

export function CookieConsent() {
  useEffect(() => {
    // Auto-initialize analytics if consent was already given
    initAnalytics();
  }, []);

  const acceptCookies = () => {
    // Set consent in our analytics lib
    import('@/lib/analytics').then(({ setAnalyticsConsent }) => {
      setAnalyticsConsent(true);
    });

    // Update Facebook Pixel consent
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('consent', 'grant');
    }

    // Hide banner
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.style.display = 'none';
    }
  };

  const rejectCookies = () => {
    import('@/lib/analytics').then(({ setAnalyticsConsent }) => {
      setAnalyticsConsent(false);
    });

    // Hide banner
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.style.display = 'none';
    }
  };

  return (
    <div
      id="cookie-banner"
      className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 shadow-lg"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm">
          <p>
            Utilizamos cookies para mejorar tu experiencia y analizar el tráfico de nuestro sitio.
            <a href="/privacy" className="underline ml-1">Política de privacidad</a>
          </p>
        </div>

        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={rejectCookies}
            className="px-4 py-2 text-sm border border-gray-600 rounded hover:bg-gray-800 transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={acceptCookies}
            className="px-4 py-2 text-sm bg-salon-gold text-gray-900 rounded hover:bg-yellow-500 transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}