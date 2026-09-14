import { NextRequest, NextResponse } from 'next/server';
import { STAFF_COOKIE, backendClient, friendlyStaffError } from '../../../../lib/staff-session';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(STAFF_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const supabase = backendClient();
  const { data, error } = await supabase.rpc('np_admin_orders', { p_token: token });
  if (error) return NextResponse.json({ error: friendlyStaffError(error.message) }, { status: 403 });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(STAFF_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  try {
    const body = await request.json();
    if (!body.orderId || !body.action) return NextResponse.json({ error: 'Order and action are required.' }, { status: 400 });
    const supabase = backendClient();
    const { data, error } = await supabase.rpc('np_admin_transition_order', {
      p_token: token,
      p_order_id: body.orderId,
      p_action: body.action,
      p_reference: body.reference || null,
      p_note: body.note || null
    });
    if (error) return NextResponse.json({ error: friendlyStaffError(error.message) }, { status: 400 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Unable to update order.' }, { status: 400 });
  }
}
