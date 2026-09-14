import { NextRequest, NextResponse } from 'next/server';
import { backendClient, CUSTOMER_COOKIE, friendlyAuthError } from '../../../../lib/customer-session';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const orderId = request.nextUrl.searchParams.get('orderId');
  if (!orderId) return NextResponse.json({ error: 'Order is required.' }, { status: 400 });
  const supabase = backendClient();
  const { data, error } = await supabase.rpc('np_customer_delivery_calendar', { p_token: token, p_order_id: orderId });
  if (error) return NextResponse.json({ error: friendlyAuthError(error.message) }, { status: 400 });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  try {
    const body = await request.json();
    const supabase = backendClient();
    if (body.action === 'pause' || body.action === 'resume') {
      const { data, error } = await supabase.rpc('np_customer_pause_order', {
        p_token: token,
        p_order_id: body.orderId,
        p_pause: body.action === 'pause'
      });
      if (error) return NextResponse.json({ error: friendlyAuthError(error.message) }, { status: 400 });
      return NextResponse.json(data);
    }
    if (body.action === 'skip' || body.action === 'restore') {
      const { data, error } = await supabase.rpc('np_customer_set_delivery_skip', {
        p_token: token,
        p_order_id: body.orderId,
        p_delivery_date: body.deliveryDate,
        p_skip: body.action === 'skip',
        p_reason: body.reason || null
      });
      if (error) return NextResponse.json({ error: friendlyAuthError(error.message) }, { status: 400 });
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: 'Unknown order action.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Unable to update order.' }, { status: 400 });
  }
}
