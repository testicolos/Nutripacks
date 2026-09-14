import { NextRequest, NextResponse } from 'next/server';
import { backendClient, CUSTOMER_COOKIE, friendlyAuthError } from '../../../../lib/customer-session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const rawPhone = String(body.phone || '').trim();
    const password = String(body.password || '');
    const digits = rawPhone.replace(/\D/g, '');
    const phone = rawPhone ? (rawPhone.startsWith('+') ? rawPhone : `+974 ${rawPhone}`) : '';

    if (fullName.length < 2 || !email || password.length < 8) {
      return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 });
    }
    if (rawPhone && digits.length !== 8) {
      return NextResponse.json({ error: 'Enter an 8-digit Qatar mobile number.' }, { status: 400 });
    }

    const supabase = backendClient();
    const { data, error } = await supabase.rpc('np_customer_register', {
      p_email: email,
      p_password: password,
      p_full_name: fullName,
      p_phone: phone || null
    });

    if (error || !data?.token) {
      return NextResponse.json({ error: friendlyAuthError(error?.message) }, { status: 400 });
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
    return NextResponse.json({ error: 'Unable to create your account right now.' }, { status: 500 });
  }
}
