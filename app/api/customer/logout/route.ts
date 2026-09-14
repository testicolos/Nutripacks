import { NextRequest, NextResponse } from 'next/server';
import { backendClient, CUSTOMER_COOKIE } from '../../../../lib/customer-session';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
  if (token) {
    const supabase = backendClient();
    await supabase.rpc('np_customer_logout', { p_token: token });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CUSTOMER_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
