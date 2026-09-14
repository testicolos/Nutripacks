import { NextResponse } from 'next/server';
import { getQiibGatewayStatus } from '../../../../../lib/qiib-payment';

export async function GET() {
  return NextResponse.json(getQiibGatewayStatus());
}
