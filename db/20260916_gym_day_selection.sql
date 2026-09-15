-- Customer day-count selection and admin visibility controls.
-- Gym packages require an active 5- or 6-day version before meal selection;
-- non-gym packages keep their configured fixed schedule unless an admin
-- explicitly enables the visibility control.

begin;

alter table public.np_packages
  add column if not exists allow_day_count_selection boolean not null default false;

update public.np_packages
set allow_day_count_selection = true
where plan_type = 'gym';

-- Ensure existing gym packages have both required day-count choices. Prices
-- are prorated from the package base and can be edited by an admin.
insert into public.np_package_options(package_id,name,breakfast_qty,main_qty,snack_qty,days_per_week,delivery_day_count,delivery_weekdays,price_qar,sort_order)
select p.id, p.name || ' • 5 days', r.breakfast_qty, r.main_qty, r.snack_qty,
       5, 20, array[0,1,2,3,4]::smallint[], round((p.price_qar * 5 / 6)::numeric, 2), 1
from public.np_packages p
join public.np_package_rules r on r.package_id=p.id
where p.plan_type='gym'
  and not exists (select 1 from public.np_package_options o where o.package_id=p.id and o.days_per_week=5);

create or replace function public.np_public_catalog()
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare v_result jsonb;
begin
  select jsonb_build_object(
    'packages', coalesce((select jsonb_agg(jsonb_build_object(
      'id',p.id,'name',p.name,'slug',p.slug,'tagline',p.tagline,'description',p.description,
      'price_qar',p.price_qar,'duration_days',p.duration_days,'meals_per_day',p.meals_per_day,
      'plan_type',p.plan_type,'plan_variant',p.plan_variant,
      'allow_day_count_selection',p.allow_day_count_selection,
      'calories_min',p.calories_min,'calories_max',p.calories_max,'protein_target',p.protein_target,
      'featured',p.featured,'sort_order',p.sort_order
    ) order by p.sort_order,p.name) from public.np_packages p where p.active=true),'[]'::jsonb),
    'rules', coalesce((select jsonb_agg(jsonb_build_object(
      'package_id',r.package_id,'breakfast_qty',r.breakfast_qty,'main_qty',r.main_qty,'snack_qty',r.snack_qty,
      'days_per_week',cardinality(r.delivery_weekdays),'delivery_day_count',r.delivery_day_count,
      'delivery_weekdays',r.delivery_weekdays,'cycle_weeks',r.cycle_weeks,
      'cycle_anchor_date',r.cycle_anchor_date,
      'selection_days_ahead',r.selection_days_ahead,'cutoff_hours',r.cutoff_hours
    )) from public.np_package_rules r join public.np_packages p on p.id=r.package_id and p.active=true),'[]'::jsonb),
    'options', coalesce((select jsonb_agg(jsonb_build_object(
      'id',o.id,'package_id',o.package_id,'name',o.name,
      'breakfast_qty',o.breakfast_qty,'main_qty',o.main_qty,'snack_qty',o.snack_qty,
      'days_per_week',o.days_per_week,'delivery_day_count',o.delivery_day_count,
      'delivery_weekdays',o.delivery_weekdays,'price_qar',o.price_qar,
      'active',o.active,'sort_order',o.sort_order
    ) order by o.package_id,o.sort_order,o.name) from public.np_package_options o join public.np_packages p on p.id=o.package_id and p.active=true),'[]'::jsonb),
    'menu', coalesce((select jsonb_agg(jsonb_build_object(
      'id',m.id,'name',m.name,'slug',m.slug,'category',m.category,'description',m.description,
      'calories',m.calories,'protein_g',m.protein_g,'carbs_g',m.carbs_g,'fat_g',m.fat_g,
      'tags',m.tags,'allergens',m.allergens,'image_url',m.image_url,'is_gym_menu',m.is_gym_menu,'sort_order',m.sort_order
    ) order by m.sort_order,m.name) from public.np_menu_items m where m.active=true),'[]'::jsonb),
    'mappings', coalesce((select jsonb_agg(jsonb_build_object(
      'package_id',pi.package_id,'menu_item_id',pi.menu_item_id,'meal_slot',pi.meal_slot,'cycle_week',pi.cycle_week
    )) from public.np_package_items pi
      join public.np_packages p on p.id=pi.package_id and p.active=true
      join public.np_menu_items m on m.id=pi.menu_item_id and m.active=true),'[]'::jsonb)
  ) into v_result;
  return v_result;
end; $$;

create or replace function public.np_admin_set_package_day_visibility(p_token text, p_package_id uuid, p_visible boolean)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare v_admin uuid; v_type text; v_visible boolean;
begin
  v_admin := public.np_admin_guard(p_token);
  select plan_type into v_type from public.np_packages where id=p_package_id;
  if v_type is null then raise exception 'package_not_found'; end if;
  v_visible := coalesce(p_visible,false) or v_type='gym';
  update public.np_packages
  set allow_day_count_selection=v_visible, updated_at=now()
  where id=p_package_id;
  return jsonb_build_object('id',p_package_id,'allow_day_count_selection',v_visible);
end; $$;

create or replace function public.np_customer_create_order(p_token text, p_package_id uuid, p_start_date date, p_delivery_address text, p_delivery_slot text, p_option_id uuid)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare
  v_customer uuid; v_package public.np_packages%rowtype; v_option public.np_package_options%rowtype;
  v_order uuid; v_number text; v_existing text; v_price numeric;
begin
  v_customer:=public.np_customer_guard(p_token);
  select * into v_package from public.np_packages where id=p_package_id and active=true;
  if v_package.id is null then raise exception 'package_not_available'; end if;
  if v_package.allow_day_count_selection and p_option_id is null then raise exception 'package_option_required'; end if;
  if p_option_id is not null then
    select * into v_option from public.np_package_options where id=p_option_id and package_id=p_package_id and active=true;
    if v_option.id is null then raise exception 'package_option_not_available'; end if;
    v_price:=v_option.price_qar;
  else
    v_price:=v_package.price_qar;
  end if;
  if p_start_date is null or p_start_date<current_date then raise exception 'invalid_start_date'; end if;
  if length(trim(coalesce(p_delivery_address,'')))<5 then raise exception 'delivery_address_required'; end if;
  if coalesce(trim(p_delivery_slot),'')='' then raise exception 'delivery_slot_required'; end if;
  select id,order_number into v_order,v_existing from public.np_orders
  where customer_id=v_customer and package_id=p_package_id and start_date=p_start_date
    and package_option_id is not distinct from p_option_id and status='draft' and created_at>now()-interval '24 hours'
  order by created_at desc limit 1;
  if v_order is not null then
    update public.np_orders set delivery_address=trim(p_delivery_address),delivery_slot=trim(p_delivery_slot),updated_at=now() where id=v_order;
    return jsonb_build_object('id',v_order,'order_number',v_existing,'amount',v_price,'status','draft','testing_mode',true,'reused',true,'package_option_id',p_option_id);
  end if;
  v_number:='NP-'||to_char(now(),'YYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
  insert into public.np_orders(order_number,customer_id,package_id,package_option_id,total_qar,status,payment_status,payment_provider,start_date,delivery_address,delivery_slot)
  values(v_number,v_customer,v_package.id,p_option_id,v_price,'draft','not_required','TESTING',p_start_date,trim(p_delivery_address),trim(p_delivery_slot)) returning id into v_order;
  return jsonb_build_object('id',v_order,'order_number',v_number,'amount',v_price,'status','draft','testing_mode',true,'reused',false,'package_option_id',p_option_id);
end; $$;

commit;
