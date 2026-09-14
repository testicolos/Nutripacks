import { NextRequest, NextResponse } from 'next/server';
import { STAFF_COOKIE, backendClient, friendlyStaffError } from '../../../../lib/staff-session';

export async function GET(request:NextRequest){
  const token=request.cookies.get(STAFF_COOKIE)?.value;
  if(!token) return NextResponse.json({error:'Not signed in.'},{status:401});
  const supabase=backendClient();
  const {data,error}=await supabase.rpc('np_staff_users',{p_token:token});
  if(error) return NextResponse.json({error:friendlyStaffError(error.message)},{status:403});
  return NextResponse.json(data||[]);
}

export async function POST(request:NextRequest){
  const token=request.cookies.get(STAFF_COOKIE)?.value;
  if(!token) return NextResponse.json({error:'Not signed in.'},{status:401});
  try{
    const body=await request.json();
    const supabase=backendClient();
    const {data,error}=await supabase.rpc('np_admin_create_staff',{p_token:token,p_username:body.username,p_password:body.password,p_role:body.role});
    if(error||!data) return NextResponse.json({error:friendlyStaffError(error?.message)},{status:403});
    return NextResponse.json(data);
  }catch{return NextResponse.json({error:'Unable to save staff user.'},{status:400});}
}
