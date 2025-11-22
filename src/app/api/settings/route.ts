import { NextRequest, NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

export async function GET(request: NextRequest) {
  try {
    const settings = await getSettings();

    // Return the settings object with all configuration
    return NextResponse.json({
      success: true,
      data: {
        templatePricing: settings.templatePricing,
        theme: settings.theme,
        domainPricing: settings.domainPricing,
        siteName: settings.siteName,
        siteDescription: settings.siteDescription
      }
    });
  } catch (error) {
    console.error('Error loading settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load settings'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}