import { NextRequest, NextResponse } from 'next/server';
import { STAFF_COOKIE, backendClient, friendlyStaffError } from '../../../../lib/staff-session';

export async function GET(request:NextRequest){
  const token=request.cookies.get(STAFF_COOKIE)?.value;
  if(!token) return NextResponse.json({error:'Not signed in.'},{status:401});
  const supabase=backendClient();
  const {data,error}=await supabase.rpc('np_staff_me',{p_token:token});
  if(error||!data){
    const response=NextResponse.json({error:friendlyStaffError(error?.message)},{status:401});
    response.cookies.set(STAFF_COOKIE,'',{httpOnly:true,path:'/',maxAge:0});
    return response;
  }
  return NextResponse.json(data);
}
