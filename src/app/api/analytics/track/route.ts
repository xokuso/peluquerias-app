/**
 * API Route - Track Analytics Events
 * Endpoint principal para capturar todos los eventos de analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import analyticsService from '@/lib/analytics/analytics-service';
import { getClientIP, parseUserAgent, getLocationFromIP, isBot } from '@/lib/analytics/utils';

export async function POST(request: NextRequest) {
  try {
    const headers = request.headers;
    const userAgent = headers.get('user-agent') || '';

    // Filtrar bots
    if (isBot(userAgent)) {
      return NextResponse.json({ success: false, error: 'Bot detected' }, { status: 400 });
    }

    // Obtener IP y datos del cliente
    const ip = getClientIP(headers);
    const deviceInfo = parseUserAgent(userAgent);
    const location = await getLocationFromIP(ip);

    const body = await request.json();
    const { sessionId, type, data } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID required' }, { status: 400 });
    }

    let result;

    switch (type) {
      case 'session_start': {
        const sessionData = {
          sessionId,
          userId: data.userId,
          ipAddress: ip,
          userAgent,
          ...deviceInfo,
          ...location,
          referrer: data.referrer,
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          utmContent: data.utmContent,
          utmTerm: data.utmTerm,
        };

        result = await analyticsService.createOrUpdateSession(sessionData);
        break;
      }

      case 'page_view': {
        const pageViewData = {
          path: data.path,
          title: data.title,
          url: data.url,
          referrer: data.referrer,
          loadTime: data.loadTime,
        };

        result = await analyticsService.trackPageView(sessionId, pageViewData);
        break;
      }

      case 'event': {
        result = await analyticsService.trackEvent(sessionId, data);
        break;
      }

      case 'funnel_step': {
        result = await analyticsService.trackFunnelStep(sessionId, data);
        break;
      }

      case 'conversion': {
        result = await analyticsService.trackConversion(sessionId, data.type, data.value);
        break;
      }

      case 'click': {
        result = await analyticsService.trackClick(
          data.page,
          data.x,
          data.y,
          data.element,
          deviceInfo.device,
          data.screenWidth,
          data.screenHeight
        );
        break;
      }

      case 'facebook_pixel': {
        const pixelData = {
          eventName: data.eventName,
          eventId: data.eventId,
          value: data.value,
          currency: data.currency,
          contentName: data.contentName,
          contentCategory: data.contentCategory,
          contentIds: data.contentIds,
          contentType: data.contentType,
          numItems: data.numItems,
          customData: data.customData,
          hashedEmail: data.hashedEmail,
          hashedPhone: data.hashedPhone,
          sourceUrl: data.sourceUrl || headers.get('referer') || '',
        };

        result = await analyticsService.trackFacebookPixelEvent(sessionId, pixelData);
        break;
      }

      case 'session_end': {
        result = await analyticsService.endSession(sessionId);
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown event type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Método OPTIONS para CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}