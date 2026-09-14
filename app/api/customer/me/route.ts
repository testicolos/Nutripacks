import { NextRequest, NextResponse } from 'next/server';
import { backendClient, CUSTOMER_COOKIE, friendlyAuthError } from '../../../../lib/customer-session';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const supabase = backendClient();
  const { data, error } = await supabase.rpc('np_customer_me', { p_token: token });
  if (error || !data) {
    const response = NextResponse.json({ error: friendlyAuthError(error?.message) }, { status: 401 });
    response.cookies.set(CUSTOMER_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
    return response;
  }
  return NextResponse.json(data);
}
