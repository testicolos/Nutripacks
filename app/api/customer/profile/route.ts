import { NextRequest, NextResponse } from 'next/server';
import { backendClient, CUSTOMER_COOKIE, friendlyAuthError } from '../../../../lib/customer-session';

export async function PUT(request: NextRequest) {
  const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const body = await request.json();
    const supabase = backendClient();
    const toList = (value: unknown) => Array.isArray(value) ? value.map(String).map((v) => v.trim()).filter(Boolean).slice(0, 20) : null;
    const calories = body.caloriePreference === '' || body.caloriePreference == null ? null : Number(body.caloriePreference);
    if (calories !== null && (!Number.isFinite(calories) || calories < 1000 || calories > 5000)) {
      return NextResponse.json({ error: 'Daily calories must be between 1,000 and 5,000.' }, { status: 400 });
    }

    let phone: string | null = body.phone == null ? null : String(body.phone).trim();
    if (phone) {
      let digits = phone.replace(/\D/g, '');
      if (digits.startsWith('974') && digits.length === 11) digits = digits.slice(3);
      if (digits.length !== 8) return NextResponse.json({ error: 'Enter an 8-digit Qatar mobile number.' }, { status: 400 });
      phone = `+974 ${digits.slice(0,4)} ${digits.slice(4)}`;
    }

    const allowedGoals = new Set(['balanced', 'fat_loss', 'performance', 'muscle_gain']);
    const goal = body.goal == null ? null : String(body.goal);
    if (goal && !allowedGoals.has(goal)) return NextResponse.json({ error: 'Choose a valid nutrition goal.' }, { status: 400 });
    const allowedSlots = new Set(['morning', 'afternoon', 'evening']);
    const slot = body.deliverySlot == null ? null : String(body.deliverySlot);
    if (slot && !allowedSlots.has(slot)) return NextResponse.json({ error: 'Choose a valid delivery slot.' }, { status: 400 });

    const { data, error } = await supabase.rpc('np_customer_update_profile', {
      p_token: token,
      p_full_name: body.fullName ?? null,
      p_phone: phone,
      p_goal: goal,
      p_calorie_preference: calories,
      p_dietary_preferences: toList(body.dietaryPreferences),
      p_allergies: toList(body.allergies),
      p_delivery_address: body.deliveryAddress ?? null,
      p_delivery_zone: body.deliveryZone ?? null,
      p_delivery_slot: slot
    });

    if (error || !data) return NextResponse.json({ error: friendlyAuthError(error?.message) }, { status: 400 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Unable to save your profile.' }, { status: 500 });
  }
}
