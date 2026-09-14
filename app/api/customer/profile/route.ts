import { NextRequest, NextResponse } from 'next/server';
import { backendClient, CUSTOMER_COOKIE, friendlyAuthError } from '../../../../lib/customer-session';

export async function PUT(request: NextRequest) {
  const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const body = await request.json();
    const supabase = backendClient();
    const toList = (value: unknown) => Array.isArray(value) ? value.map(String).map((v) => v.trim()).filter(Boolean) : null;
    const calories = body.caloriePreference === '' || body.caloriePreference == null ? null : Number(body.caloriePreference);

    const { data, error } = await supabase.rpc('np_customer_update_profile', {
      p_token: token,
      p_full_name: body.fullName ?? null,
      p_phone: body.phone ?? null,
      p_goal: body.goal ?? null,
      p_calorie_preference: Number.isFinite(calories) ? calories : null,
      p_dietary_preferences: toList(body.dietaryPreferences),
      p_allergies: toList(body.allergies),
      p_delivery_address: body.deliveryAddress ?? null,
      p_delivery_zone: body.deliveryZone ?? null,
      p_delivery_slot: body.deliverySlot ?? null
    });

    if (error || !data) {
      return NextResponse.json({ error: friendlyAuthError(error?.message) }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Unable to save your profile.' }, { status: 500 });
  }
}
