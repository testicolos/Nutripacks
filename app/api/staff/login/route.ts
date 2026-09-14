import { NextRequest, NextResponse } from 'next/server';
import { STAFF_COOKIE, backendClient, friendlyStaffError } from '../../../../lib/staff-session';

export async function POST(request: NextRequest) {
  try {
    const body=await request.json();
    const supabase=backendClient();
    const { data, error }=await supabase.rpc('np_admin_login',{p_username:body.username,p_password:body.password});
    if(error||!data) return NextResponse.json({error:friendlyStaffError(error?.message)},{status:401});
    const response=NextResponse.json({username:data.username,role:data.role});
    response.cookies.set(STAFF_COOKIE,data.token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*12});
    return response;
  } catch { return NextResponse.json({error:'Unable to sign in.'},{status:400}); }
}
