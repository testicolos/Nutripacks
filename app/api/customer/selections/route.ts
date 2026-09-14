import { NextRequest, NextResponse } from 'next/server';
import { backendClient, CUSTOMER_COOKIE, friendlyAuthError } from '../../../../lib/customer-session';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
  const orderId = request.nextUrl.searchParams.get('orderId');
  if (!orderId) return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
  const supabase = backendClient();
  const { data, error } = await supabase.rpc('np_customer_order_selections', { p_token: token, p_order_id: orderId });
  if (error) return NextResponse.json({ error: friendlyAuthError(error.message) }, { status: 400 });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
  try {
    const body = await request.json();
    const supabase = backendClient();
    const { data, error } = await supabase.rpc('np_customer_save_selections', {
      p_token: token,
      p_order_id: body.orderId,
      p_selections: body.selections || []
    });
    if (error || !data) {
      const msg = (error?.message || '').toLowerCase();
      const friendly = msg.includes('package_quantity_exceeded') ? 'You selected more meals than this package allows.' :
        msg.includes('item_not_allowed_for_package') ? 'One of the selected meals is not allowed for this package.' :
        msg.includes('selection_date_outside_package') ? 'One of the selected dates is outside the package period.' : friendlyAuthError(error?.message);
      return NextResponse.json({ error: friendly }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Unable to save meal selections.' }, { status: 400 });
  }
}
