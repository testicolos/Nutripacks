import { NextRequest, NextResponse } from 'next/server';
import { STAFF_COOKIE, backendClient } from '../../../../lib/staff-session';

export async function POST(request:NextRequest){
  const token=request.cookies.get(STAFF_COOKIE)?.value;
  if(token){ const supabase=backendClient(); await supabase.rpc('np_admin_logout',{p_token:token}); }
  const response=NextResponse.json({ok:true});
  response.cookies.set(STAFF_COOKIE,'',{httpOnly:true,path:'/',maxAge:0});
  return response;
}
