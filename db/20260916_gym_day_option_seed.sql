-- Keep the required 5-day gym choice available for newly created packages.
begin;

create or replace function public.np_admin_set_package_day_visibility(p_token text, p_package_id uuid, p_visible boolean)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare
  v_admin uuid; v_type text; v_visible boolean; v_price numeric;
  v_package public.np_packages%rowtype; v_rule public.np_package_rules%rowtype;
begin
  v_admin := public.np_admin_guard(p_token);
  select * into v_package from public.np_packages where id=p_package_id;
  if v_package.id is null then raise exception 'package_not_found'; end if;
  v_type := v_package.plan_type;
  v_visible := coalesce(p_visible,false) or v_type='gym';
  update public.np_packages
  set allow_day_count_selection=v_visible, updated_at=now()
  where id=p_package_id;
  if v_type='gym' then
    select * into v_rule from public.np_package_rules where package_id=p_package_id;
    if v_rule.package_id is not null then
      insert into public.np_package_options(package_id,name,breakfast_qty,main_qty,snack_qty,days_per_week,delivery_day_count,delivery_weekdays,price_qar,sort_order)
      values(p_package_id,v_package.name || ' • 5 days',v_rule.breakfast_qty,v_rule.main_qty,v_rule.snack_qty,5,20,array[0,1,2,3,4]::smallint[],round((v_package.price_qar * 5 / 6)::numeric,2),1)
      on conflict(package_id,name) do nothing;
    end if;
  end if;
  return jsonb_build_object('id',p_package_id,'allow_day_count_selection',v_visible);
end; $$;

commit;
