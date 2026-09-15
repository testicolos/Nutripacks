-- Nutripacks plan scheduling and monthly menu-cycle support.
-- Safe to apply to the existing schema: all changes are additive except the
-- package-item key, which is rebuilt after preserving the existing mappings as
-- legacy cycle 0 mappings (available in every cycle week).

begin;

alter table public.np_packages
  add column if not exists plan_type text not null default 'diet',
  add column if not exists plan_variant text not null default 'standard';

alter table public.np_menu_items
  add column if not exists is_gym_menu boolean not null default false;

alter table public.np_package_rules
  add column if not exists delivery_day_count integer not null default 24,
  add column if not exists delivery_weekdays smallint[] not null default array[0,1,2,3,4,6]::smallint[],
  add column if not exists cycle_weeks integer not null default 8,
  add column if not exists cycle_anchor_date date not null default date '2026-01-04';

alter table public.np_package_rules
  drop constraint if exists np_package_rules_delivery_day_count_check,
  drop constraint if exists np_package_rules_delivery_weekdays_check,
  drop constraint if exists np_package_rules_cycle_weeks_check,
  add constraint np_package_rules_delivery_day_count_check check (delivery_day_count > 0),
  add constraint np_package_rules_delivery_weekdays_check check (cardinality(delivery_weekdays) between 1 and 7 and delivery_weekdays <@ array[0,1,2,3,4,5,6]::smallint[]),
  add constraint np_package_rules_cycle_weeks_check check (cycle_weeks between 1 and 8);

-- Existing packages are the standard six-day Diet packages. Existing item
-- mappings remain valid for every week through cycle_week = 0.
update public.np_packages
set plan_type = 'diet', plan_variant = case when lower(slug) = 'business-lunch' then 'business_lunch' else 'standard' end
where plan_type is null or plan_type = '';

update public.np_package_rules r
set delivery_day_count = case when p.plan_variant = 'business_lunch' then 20 else 24 end,
    delivery_weekdays = case when p.plan_variant = 'business_lunch' then array[0,1,2,3,4]::smallint[] else array[0,1,2,3,4,6]::smallint[] end,
    cycle_weeks = 8
from public.np_packages p
where p.id = r.package_id;

alter table public.np_package_items
  add column if not exists cycle_week integer not null default 0;

alter table public.np_package_items drop constraint if exists np_package_items_pkey;
alter table public.np_package_items
  add constraint np_package_items_pkey primary key (package_id, cycle_week, menu_item_id, meal_slot);

create index if not exists np_package_items_cycle_idx
  on public.np_package_items(package_id, cycle_week, meal_slot);

create or replace function public.np_public_catalog()
returns jsonb
language plpgsql security definer set search_path to 'public'
as $$
declare v_result jsonb;
begin
  select jsonb_build_object(
    'packages', coalesce((select jsonb_agg(jsonb_build_object(
      'id',p.id,'name',p.name,'slug',p.slug,'tagline',p.tagline,'description',p.description,
      'price_qar',p.price_qar,'duration_days',p.duration_days,'meals_per_day',p.meals_per_day,
      'plan_type',p.plan_type,'plan_variant',p.plan_variant,
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

create or replace function public.np_admin_save_menu_item(p_token text, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare v_admin uuid; v_id uuid; v_slug text;
begin
  v_admin := public.np_admin_guard(p_token);
  v_slug := lower(regexp_replace(coalesce(p_payload->>'slug',p_payload->>'name'),'[^a-zA-Z0-9]+','-','g'));
  v_slug := trim(both '-' from v_slug);
  if coalesce(p_payload->>'category','') not in ('breakfast','main','snack','side','drink') then raise exception 'invalid_menu_category'; end if;
  if coalesce(p_payload->>'id','')='' then
    insert into public.np_menu_items(name,slug,category,description,calories,protein_g,carbs_g,fat_g,tags,allergens,image_url,is_gym_menu,active,sort_order)
    values(p_payload->>'name',v_slug,p_payload->>'category',p_payload->>'description',coalesce((p_payload->>'calories')::int,0),coalesce((p_payload->>'protein_g')::numeric,0),coalesce((p_payload->>'carbs_g')::numeric,0),coalesce((p_payload->>'fat_g')::numeric,0),coalesce(array(select jsonb_array_elements_text(coalesce(p_payload->'tags','[]'::jsonb))),'{}'),coalesce(array(select jsonb_array_elements_text(coalesce(p_payload->'allergens','[]'::jsonb))),'{}'),p_payload->>'image_url',coalesce((p_payload->>'is_gym_menu')::boolean,false),coalesce((p_payload->>'active')::boolean,true),coalesce((p_payload->>'sort_order')::int,0))
    returning id into v_id;
  else
    v_id := (p_payload->>'id')::uuid;
    update public.np_menu_items set name=p_payload->>'name',slug=v_slug,category=p_payload->>'category',description=p_payload->>'description',calories=coalesce((p_payload->>'calories')::int,0),protein_g=coalesce((p_payload->>'protein_g')::numeric,0),carbs_g=coalesce((p_payload->>'carbs_g')::numeric,0),fat_g=coalesce((p_payload->>'fat_g')::numeric,0),tags=coalesce(array(select jsonb_array_elements_text(coalesce(p_payload->'tags','[]'::jsonb))),'{}'),allergens=coalesce(array(select jsonb_array_elements_text(coalesce(p_payload->'allergens','[]'::jsonb))),'{}'),image_url=p_payload->>'image_url',is_gym_menu=coalesce((p_payload->>'is_gym_menu')::boolean,is_gym_menu),active=coalesce((p_payload->>'active')::boolean,active),sort_order=coalesce((p_payload->>'sort_order')::int,sort_order),updated_at=now() where id=v_id;
  end if;
  return jsonb_build_object('id',v_id);
end; $$;

create or replace function public.np_admin_save_package(p_token text, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare
  v_admin uuid; v_id uuid; v_slug text; v_plan_type text; v_variant text;
  v_breakfast integer:=greatest(coalesce((p_payload->>'breakfast_qty')::int,0),0);
  v_main integer:=greatest(coalesce((p_payload->>'main_qty')::int,0),0);
  v_snack integer:=greatest(coalesce((p_payload->>'snack_qty')::int,0),0);
  v_meals integer; v_price numeric; v_duration integer; v_days integer;
  v_delivery_days integer; v_weekdays smallint[]; v_cycle_weeks integer; v_anchor date;
begin
  v_admin:=public.np_admin_guard(p_token);
  if length(trim(coalesce(p_payload->>'name','')))<2 then raise exception 'invalid_package_name'; end if;
  v_slug:=lower(regexp_replace(coalesce(nullif(trim(p_payload->>'slug'),''),p_payload->>'name'),'[^a-zA-Z0-9]+','-','g'));
  v_slug:=trim(both '-' from v_slug);
  if length(v_slug)<2 then raise exception 'invalid_package_slug'; end if;
  v_plan_type:=lower(coalesce(nullif(trim(p_payload->>'plan_type'),''),'diet'));
  if v_plan_type not in ('diet','gym') then raise exception 'invalid_plan_type'; end if;
  v_variant:=lower(coalesce(nullif(trim(p_payload->>'plan_variant'),''),case when v_plan_type='gym' then 'gym' else 'standard' end));
  if v_plan_type='gym' then v_variant:='gym'; end if;
  if v_variant not in ('business_lunch','standard','gym') then raise exception 'invalid_plan_variant'; end if;
  v_price:=coalesce((p_payload->>'price_qar')::numeric,0);
  v_duration:=greatest(coalesce((p_payload->>'duration_days')::int,30),1);
  v_days:=least(greatest(coalesce((p_payload->>'days_per_week')::int,case when v_variant='business_lunch' then 5 else 6 end),1),7);
  v_delivery_days:=greatest(coalesce((p_payload->>'delivery_day_count')::int,case when v_variant='business_lunch' then 20 else 24 end),1);
  if v_variant='business_lunch' then v_days:=5; v_weekdays:=array[0,1,2,3,4]::smallint[]; else v_days:=6; v_weekdays:=array[0,1,2,3,4,6]::smallint[]; end if;
  v_cycle_weeks:=case when v_plan_type='gym' then 4 else 8 end;
  v_anchor:=coalesce(nullif(p_payload->>'cycle_anchor_date','')::date,date '2026-01-04');
  v_meals:=v_breakfast+v_main+v_snack;
  if v_price<0 then raise exception 'invalid_package_price'; end if;
  if v_meals<1 then raise exception 'package_requires_meal'; end if;
  if nullif(p_payload->>'calories_min','') is not null and nullif(p_payload->>'calories_max','') is not null and (p_payload->>'calories_min')::int>(p_payload->>'calories_max')::int then raise exception 'invalid_calorie_range'; end if;

  if coalesce(p_payload->>'id','')='' then
    insert into public.np_packages(name,slug,tagline,description,price_qar,duration_days,meals_per_day,plan_type,plan_variant,calories_min,calories_max,protein_target,active,featured,sort_order)
    values(trim(p_payload->>'name'),v_slug,p_payload->>'tagline',p_payload->>'description',v_price,v_duration,v_meals,v_plan_type,v_variant,nullif(p_payload->>'calories_min','')::int,nullif(p_payload->>'calories_max','')::int,nullif(p_payload->>'protein_target','')::int,coalesce((p_payload->>'active')::boolean,true),coalesce((p_payload->>'featured')::boolean,false),coalesce((p_payload->>'sort_order')::int,0)) returning id into v_id;
  else
    v_id:=(p_payload->>'id')::uuid;
    if not exists(select 1 from public.np_packages where id=v_id) then raise exception 'package_not_found'; end if;
    update public.np_packages set name=trim(p_payload->>'name'),slug=v_slug,tagline=p_payload->>'tagline',description=p_payload->>'description',price_qar=v_price,duration_days=v_duration,meals_per_day=v_meals,plan_type=v_plan_type,plan_variant=v_variant,calories_min=nullif(p_payload->>'calories_min','')::int,calories_max=nullif(p_payload->>'calories_max','')::int,protein_target=nullif(p_payload->>'protein_target','')::int,active=coalesce((p_payload->>'active')::boolean,active),featured=coalesce((p_payload->>'featured')::boolean,featured),sort_order=coalesce((p_payload->>'sort_order')::int,sort_order),updated_at=now() where id=v_id;
  end if;
  insert into public.np_package_rules(package_id,breakfast_qty,main_qty,snack_qty,days_per_week,delivery_day_count,delivery_weekdays,cycle_weeks,cycle_anchor_date,selection_days_ahead,cutoff_hours)
  values(v_id,v_breakfast,v_main,v_snack,v_days,v_delivery_days,v_weekdays,v_cycle_weeks,v_anchor,greatest(coalesce((p_payload->>'selection_days_ahead')::int,7),1),greatest(coalesce((p_payload->>'cutoff_hours')::int,24),0))
  on conflict(package_id) do update set breakfast_qty=excluded.breakfast_qty,main_qty=excluded.main_qty,snack_qty=excluded.snack_qty,days_per_week=excluded.days_per_week,delivery_day_count=excluded.delivery_day_count,delivery_weekdays=excluded.delivery_weekdays,cycle_weeks=excluded.cycle_weeks,cycle_anchor_date=excluded.cycle_anchor_date,selection_days_ahead=excluded.selection_days_ahead,cutoff_hours=excluded.cutoff_hours,updated_at=now();
  return jsonb_build_object('id',v_id,'meals_per_day',v_meals,'delivery_day_count',v_delivery_days,'plan_type',v_plan_type,'plan_variant',v_variant);
end; $$;

create or replace function public.np_admin_set_package_items(p_token text, p_package_id uuid, p_mappings jsonb)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$ begin return public.np_admin_set_package_items_v2(p_token,p_package_id,0,p_mappings); end; $$;

create or replace function public.np_admin_set_package_items_v2(p_token text, p_package_id uuid, p_cycle_week integer, p_mappings jsonb)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare v_admin uuid; v_map jsonb; v_count integer:=0; v_slot text; v_item uuid; v_rule public.np_package_rules%rowtype; v_type text;
begin
  v_admin:=public.np_admin_guard(p_token);
  if not exists(select 1 from public.np_packages where id=p_package_id) then raise exception 'package_not_found'; end if;
  if jsonb_typeof(coalesce(p_mappings,'[]'::jsonb))<>'array' then raise exception 'invalid_mappings'; end if;
  select r.* into v_rule from public.np_package_rules r where r.package_id=p_package_id;
  select plan_type into v_type from public.np_packages where id=p_package_id;
  if v_rule.package_id is null then raise exception 'package_rules_missing'; end if;
  if p_cycle_week<0 or p_cycle_week>v_rule.cycle_weeks then raise exception 'invalid_cycle_week'; end if;
  delete from public.np_package_items where package_id=p_package_id and cycle_week=p_cycle_week;
  for v_map in select * from jsonb_array_elements(coalesce(p_mappings,'[]'::jsonb)) loop
    begin v_item:=(v_map->>'menu_item_id')::uuid; v_slot:=lower(v_map->>'meal_slot'); exception when others then raise exception 'invalid_mapping_row'; end;
    if v_slot not in ('breakfast','main','snack','side','drink') then raise exception 'invalid_mapping_slot'; end if;
    if not exists(select 1 from public.np_menu_items where id=v_item and active=true and category=v_slot and (v_type<>'gym' or is_gym_menu=true)) then raise exception 'mapping_item_category_mismatch'; end if;
    insert into public.np_package_items(package_id,cycle_week,menu_item_id,meal_slot) values(p_package_id,p_cycle_week,v_item,v_slot) on conflict do nothing;
    v_count:=v_count+1;
  end loop;
  if v_rule.breakfast_qty>0 and not exists(select 1 from public.np_package_items where package_id=p_package_id and cycle_week=p_cycle_week and meal_slot='breakfast') then raise exception 'breakfast_mapping_required'; end if;
  if v_rule.main_qty>0 and not exists(select 1 from public.np_package_items where package_id=p_package_id and cycle_week=p_cycle_week and meal_slot='main') then raise exception 'main_mapping_required'; end if;
  if v_rule.snack_qty>0 and not exists(select 1 from public.np_package_items where package_id=p_package_id and cycle_week=p_cycle_week and meal_slot='snack') then raise exception 'snack_mapping_required'; end if;
  return jsonb_build_object('saved',v_count,'validated',true,'cycle_week',p_cycle_week);
end; $$;

create or replace function public.np_customer_create_order(p_token text, p_package_id uuid, p_start_date date, p_delivery_address text, p_delivery_slot text)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare v_customer uuid; v_package public.np_packages%rowtype; v_order uuid; v_number text; v_existing text;
begin
  v_customer:=public.np_customer_guard(p_token);
  select * into v_package from public.np_packages where id=p_package_id and active=true;
  if v_package.id is null then raise exception 'package_not_available'; end if;
  if p_start_date is null or p_start_date<current_date then raise exception 'invalid_start_date'; end if;
  if length(trim(coalesce(p_delivery_address,'')))<5 then raise exception 'delivery_address_required'; end if;
  if coalesce(trim(p_delivery_slot),'')='' then raise exception 'delivery_slot_required'; end if;
  select id,order_number into v_order,v_existing from public.np_orders where customer_id=v_customer and package_id=p_package_id and start_date=p_start_date and status='draft' and created_at>now()-interval '24 hours' order by created_at desc limit 1;
  if v_order is not null then update public.np_orders set delivery_address=trim(p_delivery_address),delivery_slot=trim(p_delivery_slot),updated_at=now() where id=v_order; return jsonb_build_object('id',v_order,'order_number',v_existing,'amount',v_package.price_qar,'status','draft','testing_mode',true,'reused',true); end if;
  v_number:='NP-'||to_char(now(),'YYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
  insert into public.np_orders(order_number,customer_id,package_id,total_qar,status,payment_status,payment_provider,start_date,delivery_address,delivery_slot) values(v_number,v_customer,v_package.id,v_package.price_qar,'draft','not_required','TESTING',p_start_date,trim(p_delivery_address),trim(p_delivery_slot)) returning id into v_order;
  return jsonb_build_object('id',v_order,'order_number',v_number,'amount',v_package.price_qar,'status','draft','testing_mode',true,'reused',false);
end; $$;

create or replace function public.np_customer_order_selections(p_token text, p_order_id uuid)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare v_customer uuid; v_result jsonb;
begin
  v_customer := public.np_customer_guard(p_token);
  if not exists(select 1 from public.np_orders where id=p_order_id and customer_id=v_customer) then raise exception 'order_not_found'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'delivery_date',s.delivery_date,'meal_slot',s.meal_slot,'quantity',s.quantity,'menu_item_id',m.id,'name',m.name,'calories',m.calories,'cycle_week',case when r.cycle_weeks>0 then mod(((s.delivery_date-r.cycle_anchor_date)/7),r.cycle_weeks)+1 else 1 end) order by s.delivery_date,s.meal_slot),'[]'::jsonb) into v_result
  from public.np_meal_selections s join public.np_menu_items m on m.id=s.menu_item_id join public.np_orders o on o.id=s.order_id join public.np_package_rules r on r.package_id=o.package_id where s.order_id=p_order_id;
  return v_result;
end; $$;

create or replace function public.np_customer_save_selections(p_token text, p_order_id uuid, p_selections jsonb)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare
  v_customer uuid; v_package uuid; v_start date; v_duration integer; v_status text; v_rule public.np_package_rules%rowtype; v_package_type text;
  v_sel jsonb; v_item uuid; v_slot text; v_date date; v_qty integer; v_count integer:=0; v_bad integer; v_days integer; v_cycle_week integer; v_existing_count integer;
  v_expected_days integer:=0; v_cursor date;
begin
  v_customer:=public.np_customer_guard(p_token);
  select o.package_id,o.start_date,p.duration_days,o.status,p.plan_type into v_package,v_start,v_duration,v_status,v_package_type from public.np_orders o join public.np_packages p on p.id=o.package_id where o.id=p_order_id and o.customer_id=v_customer for update of o;
  if v_package is null then raise exception 'order_not_found'; end if;
  if v_status not in ('draft','active','paused') then raise exception 'order_not_editable'; end if;
  select * into v_rule from public.np_package_rules where package_id=v_package;
  if v_rule.package_id is null then raise exception 'package_rules_missing'; end if;
  if jsonb_typeof(p_selections)<>'array' or jsonb_array_length(p_selections)=0 then raise exception 'invalid_selections'; end if;
  for v_sel in select * from jsonb_array_elements(p_selections) loop
    begin v_item:=(v_sel->>'menu_item_id')::uuid; v_slot:=lower(v_sel->>'meal_slot'); v_date:=(v_sel->>'delivery_date')::date; v_qty:=coalesce((v_sel->>'quantity')::integer,1); exception when others then raise exception 'invalid_selection_row'; end;
    if v_slot not in ('breakfast','main','snack') or v_qty<1 then raise exception 'invalid_selection_row'; end if;
    if v_date<v_start or v_date>=v_start+v_duration or extract(dow from v_date)::int <> all(v_rule.delivery_weekdays) then raise exception 'selection_outside_package_dates'; end if;
    v_cycle_week:=mod(((v_date-v_rule.cycle_anchor_date)/7),v_rule.cycle_weeks)+1;
    if not exists(select 1 from public.np_package_items pi join public.np_menu_items mi on mi.id=pi.menu_item_id and mi.active=true where pi.package_id=v_package and pi.menu_item_id=v_item and pi.meal_slot=v_slot and (pi.cycle_week=0 or pi.cycle_week=v_cycle_week) and (v_package_type<>'gym' or mi.is_gym_menu=true)) then raise exception 'item_not_allowed_for_package'; end if;
  end loop;
  select count(distinct (x->>'delivery_date')::date)::int into v_days from jsonb_array_elements(p_selections) x;
  if v_days<>v_rule.delivery_day_count then raise exception 'incorrect_delivery_day_count'; end if;
  v_cursor:=v_start;
  while v_cursor < v_start+v_duration and v_expected_days < v_rule.delivery_day_count loop
    if extract(dow from v_cursor)::int = any(v_rule.delivery_weekdays) then
      v_expected_days:=v_expected_days+1;
      if not exists(select 1 from jsonb_array_elements(p_selections) x where (x->>'delivery_date')::date=v_cursor) then raise exception 'incorrect_delivery_day_count'; end if;
    end if;
    v_cursor:=v_cursor+1;
  end loop;
  if v_expected_days<>v_rule.delivery_day_count or exists(select 1 from jsonb_array_elements(p_selections) x where not exists(select 1 from generate_series(v_start,v_start+v_duration-1,interval '1 day') g(d) where g.d::date=(x->>'delivery_date')::date and extract(dow from g.d)::int=any(v_rule.delivery_weekdays))) then raise exception 'incorrect_delivery_day_count'; end if;
  select count(*)::int into v_bad from (select (x->>'delivery_date')::date delivery_date,coalesce(sum(coalesce((x->>'quantity')::int,1)) filter(where lower(x->>'meal_slot')='breakfast'),0)::int b,coalesce(sum(coalesce((x->>'quantity')::int,1)) filter(where lower(x->>'meal_slot')='main'),0)::int m,coalesce(sum(coalesce((x->>'quantity')::int,1)) filter(where lower(x->>'meal_slot')='snack'),0)::int s from jsonb_array_elements(p_selections) x group by 1) q where q.b<>v_rule.breakfast_qty or q.m<>v_rule.main_qty or q.s<>v_rule.snack_qty;
  if v_bad>0 then raise exception 'incorrect_meal_quantities'; end if;
  select count(*)::int into v_existing_count from public.np_meal_selections where order_id=p_order_id;
  if v_existing_count>0 then raise exception 'meal_selection_locked'; end if;
  for v_sel in select * from jsonb_array_elements(p_selections) loop
    v_item:=(v_sel->>'menu_item_id')::uuid; v_slot:=lower(v_sel->>'meal_slot'); v_date:=(v_sel->>'delivery_date')::date; v_qty:=coalesce((v_sel->>'quantity')::integer,1);
    insert into public.np_meal_selections(order_id,delivery_date,meal_slot,menu_item_id,quantity) values(p_order_id,v_date,v_slot,v_item,v_qty) on conflict(order_id,delivery_date,meal_slot,menu_item_id) do update set quantity=excluded.quantity;
    v_count:=v_count+1;
  end loop;
  if v_status='draft' then update public.np_orders set status='active',updated_at=now() where id=p_order_id; insert into public.np_order_events(order_id,event_type,from_status,to_status,from_payment_status,to_payment_status,actor_type,actor_id,note) values(p_order_id,'schedule_completed','draft','active','not_required','not_required','customer',v_customer,'Testing mode: order activated after complete monthly meal schedule.'); end if;
  return jsonb_build_object('saved',v_count,'delivery_days',v_days,'validated',true,'status',case when v_status='draft' then 'active' else v_status end);
end; $$;

commit;
