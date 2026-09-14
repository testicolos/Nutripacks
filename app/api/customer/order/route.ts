import { NextRequest, NextResponse } from 'next/server';
import { backendClient, CUSTOMER_COOKIE, friendlyAuthError } from '../../../../lib/customer-session';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
  try {
    const body = await request.json();
    const supabase = backendClient();
    const { data, error } = await supabase.rpc('np_customer_create_order', {
      p_token: token,
      p_package_id: body.packageId,
      p_start_date: body.startDate,
      p_delivery_address: body.deliveryAddress,
      p_delivery_slot: body.deliverySlot
    });
    if (error || !data) return NextResponse.json({ error: friendlyAuthError(error?.message) }, { status: 400 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Unable to create order.' }, { status: 400 });
  }
}
