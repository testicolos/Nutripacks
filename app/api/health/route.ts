import { NextResponse } from 'next/server';
import { backendClient } from '../../../lib/customer-session';

export async function GET() {
  try {
    const supabase = backendClient();
    const { data, error } = await supabase.rpc('np_public_catalog');
    if (error || !data) {
      return NextResponse.json({ service: 'nutripacks', ok: false, database: 'unavailable', mode: 'testing', paymentRequired: false }, { status: 503 });
    }
    return NextResponse.json({
      service: 'nutripacks',
      ok: true,
      database: 'connected',
      mode: 'testing',
      paymentRequired: false,
      packages: Array.isArray(data.packages) ? data.packages.length : 0,
      menuItems: Array.isArray(data.menu) ? data.menu.length : 0
    });
  } catch {
    return NextResponse.json({ service: 'nutripacks', ok: false, database: 'unavailable', mode: 'testing', paymentRequired: false }, { status: 503 });
  }
}
