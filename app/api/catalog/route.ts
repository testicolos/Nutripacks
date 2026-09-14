import { NextResponse } from 'next/server';
import { getPublicCatalog } from '../../../lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const catalog = await getPublicCatalog();
    return NextResponse.json(catalog, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load catalog.' }, { status: 500 });
  }
}
