import { NextRequest, NextResponse } from 'next/server';
import { STAFF_COOKIE, backendClient, friendlyStaffError } from '../../../../lib/staff-session';

export async function GET(request:NextRequest){
  const token=request.cookies.get(STAFF_COOKIE)?.value;
  if(!token) return NextResponse.json({error:'Not signed in.'},{status:401});
  const supabase=backendClient();
  const {data,error}=await supabase.rpc('np_admin_catalog',{p_token:token});
  if(error||!data) return NextResponse.json({error:friendlyStaffError(error?.message)},{status:403});
  return NextResponse.json(data);
}

export async function POST(request:NextRequest){
  const token=request.cookies.get(STAFF_COOKIE)?.value;
  if(!token) return NextResponse.json({error:'Not signed in.'},{status:401});
  try{
    const body=await request.json();
    const supabase=backendClient();
    if(body.action==='savePackage'){
      const {data,error}=await supabase.rpc('np_admin_save_package',{p_token:token,p_payload:body.payload});
      if(error) return NextResponse.json({error:friendlyStaffError(error.message)},{status:403});
      return NextResponse.json(data);
    }
    if(body.action==='saveMenuItem'){
      const {data,error}=await supabase.rpc('np_admin_save_menu_item',{p_token:token,p_payload:body.payload});
      if(error) return NextResponse.json({error:friendlyStaffError(error.message)},{status:403});
      return NextResponse.json(data);
    }
    if(body.action==='setMappings'){
      const {data,error}=await supabase.rpc('np_admin_set_package_items',{p_token:token,p_package_id:body.packageId,p_mappings:body.mappings||[]});
      if(error) return NextResponse.json({error:friendlyStaffError(error.message)},{status:403});
      return NextResponse.json(data);
    }
    if(body.action==='deletePackage'){
      const {data,error}=await supabase.rpc('np_admin_delete_package',{p_token:token,p_package_id:body.packageId});
      if(error) return NextResponse.json({error:friendlyStaffError(error.message)},{status:403});
      return NextResponse.json(data);
    }
    if(body.action==='deleteMenuItem'){
      const {data,error}=await supabase.rpc('np_admin_delete_menu_item',{p_token:token,p_menu_item_id:body.menuItemId});
      if(error) return NextResponse.json({error:friendlyStaffError(error.message)},{status:403});
      return NextResponse.json(data);
    }
    return NextResponse.json({error:'Unknown catalog action.'},{status:400});
  }catch{return NextResponse.json({error:'Unable to update catalog.'},{status:400});}
}
