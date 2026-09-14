import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ service: 'nutripacks', ok: true, payment: 'QIIB_CARD_PENDING' });
}
