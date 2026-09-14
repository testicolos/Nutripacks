import { NextRequest, NextResponse } from 'next/server';
import { STAFF_COOKIE, backendClient, friendlyStaffError } from '../../../../lib/staff-session';

export async function GET(request:NextRequest){
  const token=request.cookies.get(STAFF_COOKIE)?.value;
  if(!token) return NextResponse.json({error:'Not signed in.'},{status:401});
  const from=request.nextUrl.searchParams.get('from')||undefined;
  const to=request.nextUrl.searchParams.get('to')||undefined;
  const supabase=backendClient();
  const {data,error}=await supabase.rpc('np_staff_schedule',{p_token:token,p_from:from,p_to:to});
  if(error||!data) return NextResponse.json({error:friendlyStaffError(error?.message)},{status:error?.message?.toLowerCase().includes('session')?401:400});
  return NextResponse.json(data);
}
