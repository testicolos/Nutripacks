import { NextRequest, NextResponse } from 'next/server';
import { backendClient, CUSTOMER_COOKIE, friendlyAuthError } from '../../../../lib/customer-session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const supabase = backendClient();
    const { data, error } = await supabase.rpc('np_customer_login', {
      p_email: email,
      p_password: password
    });

    if (error || !data?.token) {
      return NextResponse.json({ error: friendlyAuthError(error?.message) }, { status: 401 });
    }

    const response = NextResponse.json({ customer: data.customer });
    response.cookies.set(CUSTOMER_COOKIE, data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Unable to sign in right now.' }, { status: 500 });
  }
}
