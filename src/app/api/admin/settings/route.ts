import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSettings, saveSettings, SystemSettings } from '@/lib/settings';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getSettings();

    // Don't send sensitive data to frontend
    const sanitizedSettings = {
      ...settings,
      stripeSecretKey: settings.stripeSecretKey ? '••••••••' : ''
    };

    return NextResponse.json(sanitizedSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['siteName', 'siteUrl', 'contactEmail', 'supportEmail'];
    for (const field of requiredFields) {
      if (!body[field] || typeof body[field] !== 'string' || body[field].trim() === '') {
        return NextResponse.json(
          { error: `Field ${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email formats
    const emailFields = ['contactEmail', 'supportEmail'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const field of emailFields) {
      if (!emailRegex.test(body[field])) {
        return NextResponse.json(
          { error: `Invalid email format for ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate URL format
    try {
      new URL(body.siteUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format for siteUrl' },
        { status: 400 }
      );
    }

    // Get current settings to preserve stripe secret if not being updated
    const currentSettings = await getSettings();

    // If stripeSecretKey is masked, use the current value
    if (body.stripeSecretKey === '••••••••') {
      body.stripeSecretKey = currentSettings.stripeSecretKey;
    }

    // Validate template pricing
    if (body.templatePricing) {
      const { offerPrice, originalPrice } = body.templatePricing;
      if (typeof offerPrice !== 'number' || typeof originalPrice !== 'number') {
        return NextResponse.json(
          { error: 'Template pricing must be numbers' },
          { status: 400 }
        );
      }
      if (offerPrice < 0 || originalPrice < 0) {
        return NextResponse.json(
          { error: 'Template pricing cannot be negative' },
          { status: 400 }
        );
      }
      if (offerPrice > originalPrice) {
        return NextResponse.json(
          { error: 'Offer price cannot be higher than original price' },
          { status: 400 }
        );
      }
    }

    // Validate domain pricing
    if (body.domainPricing && Array.isArray(body.domainPricing)) {
      for (const domain of body.domainPricing) {
        if (!domain.extension || typeof domain.extension !== 'string') {
          return NextResponse.json(
            { error: 'Domain extension is required' },
            { status: 400 }
          );
        }
        if (typeof domain.price !== 'number' || domain.price < 0) {
          return NextResponse.json(
            { error: 'Domain price must be a positive number' },
            { status: 400 }
          );
        }
        if (typeof domain.discount !== 'number' || domain.discount < 0 || domain.discount > 100) {
          return NextResponse.json(
            { error: 'Domain discount must be between 0 and 100' },
            { status: 400 }
          );
        }
      }
    }

    const settings: SystemSettings = {
      ...currentSettings,
      ...body,
      // Ensure boolean fields are actually booleans
      maintenanceMode: !!body.maintenanceMode,
      allowRegistrations: !!body.allowRegistrations,
      emailNotifications: !!body.emailNotifications,
      smsNotifications: !!body.smsNotifications
    };

    await saveSettings(settings);

    // Return sanitized settings
    const sanitizedSettings = {
      ...settings,
      stripeSecretKey: settings.stripeSecretKey ? '••••••••' : ''
    };

    return NextResponse.json({
      message: 'Settings saved successfully',
      settings: sanitizedSettings
    });

  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}