-- Admin-configured plan versions for meal quantities, delivery frequency and price.
-- Existing packages/orders remain valid: their current package rule is used when
-- an order has no selected version.

begin;

create table if not exists public.np_package_options (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.np_packages(id) on delete cascade,
  name text not null,
  breakfast_qty integer not null default 1,
  main_qty integer not null default 1,
  snack_qty integer not null default 1,
  days_per_week integer not null default 6,
  delivery_day_count integer not null default 24,
  delivery_weekdays smallint[] not null default array[0,1,2,3,4,6]::smallint[],
  price_qar numeric not null default 0,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint np_package_options_name_check check (length(trim(name)) >= 2),
  constraint np_package_options_qty_check check (breakfast_qty >= 0 and main_qty >= 0 and snack_qty >= 0 and breakfast_qty + main_qty + snack_qty > 0),
  constraint np_package_options_days_check check (days_per_week between 1 and 7),
  constraint np_package_options_delivery_count_check check (delivery_day_count > 0),
  constraint np_package_options_weekdays_check check (cardinality(delivery_weekdays) = days_per_week and delivery_weekdays <@ array[0,1,2,3,4,5,6]::smallint[]),
  constraint np_package_options_price_check check (price_qar >= 0),
  constraint np_package_options_unique_name unique (package_id, name)
);

alter table public.np_orders
  add column if not exists package_option_id uuid references public.np_package_options(id) on delete set null;

create index if not exists np_orders_package_option_idx on public.np_orders(package_option_id);
create index if not exists np_package_options_package_idx on public.np_package_options(package_id, active, sort_order);

-- Give every existing package an explicit selectable default while preserving
-- its existing quantities, delivery calendar and price.
insert into public.np_package_options(package_id,name,breakfast_qty,main_qty,snack_qty,days_per_week,delivery_day_count,delivery_weekdays,price_qar,sort_order)
select p.id, p.name || ' • Default', r.breakfast_qty, r.main_qty, r.snack_qty,
       cardinality(r.delivery_weekdays), r.delivery_day_count, r.delivery_weekdays,
       p.price_qar, 0
from public.np_packages p
join public.np_package_rules r on r.package_id=p.id
where not exists (select 1 from public.np_package_options o where o.package_id=p.id);

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

create or replace function public.np_admin_catalog(p_token text)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare v_admin uuid; v_result jsonb;
begin
  v_admin := public.np_admin_guard(p_token);
  select jsonb_build_object(
    'packages',coalesce((select jsonb_agg(p order by p.sort_order,p.name) from public.np_packages p),'[]'::jsonb),
    'rules',coalesce((select jsonb_agg(r) from public.np_package_rules r),'[]'::jsonb),
    'options',coalesce((select jsonb_agg(o order by o.package_id,o.sort_order,o.name) from public.np_package_options o),'[]'::jsonb),
    'menu',coalesce((select jsonb_agg(m order by m.sort_order,m.name) from public.np_menu_items m),'[]'::jsonb),
    'mappings',coalesce((select jsonb_agg(pi) from public.np_package_items pi),'[]'::jsonb)
  ) into v_result;
  return v_result;
end; $$;

create or replace function public.np_admin_save_package_option(p_token text, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare
  v_admin uuid; v_id uuid; v_package uuid; v_name text; v_days integer; v_count integer;
  v_breakfast integer:=greatest(coalesce((p_payload->>'breakfast_qty')::int,0),0);
  v_main integer:=greatest(coalesce((p_payload->>'main_qty')::int,0),0);
  v_snack integer:=greatest(coalesce((p_payload->>'snack_qty')::int,0),0);
  v_price numeric:=coalesce((p_payload->>'price_qar')::numeric,0);
  v_weekdays smallint[];
begin
  v_admin:=public.np_admin_guard(p_token);
  v_package:=(p_payload->>'package_id')::uuid;
  if not exists(select 1 from public.np_packages where id=v_package) then raise exception 'package_not_found'; end if;
  v_name:=trim(coalesce(p_payload->>'name',''));
  if length(v_name)<2 then raise exception 'invalid_option_name'; end if;
  v_days:=least(greatest(coalesce((p_payload->>'days_per_week')::int,6),1),7);
  v_count:=greatest(coalesce((p_payload->>'delivery_day_count')::int,case when v_days=5 then 20 else 24 end),1);
  if jsonb_typeof(p_payload->'delivery_weekdays')='array' then
    v_weekdays:=array(select value::smallint from jsonb_array_elements_text(p_payload->'delivery_weekdays'));
  else
    v_weekdays:=case when v_days=5 then array[0,1,2,3,4]::smallint[] when v_days=6 then array[0,1,2,3,4,6]::smallint[] else (select array_agg(x::smallint) from generate_series(0,v_days-1) x) end;
  end if;
  if cardinality(v_weekdays)<>v_days then raise exception 'invalid_delivery_weekdays'; end if;
  if v_breakfast+v_main+v_snack<1 then raise exception 'package_requires_meal'; end if;
  if v_price<0 then raise exception 'invalid_package_price'; end if;
  if coalesce(p_payload->>'id','')='' then
    insert into public.np_package_options(package_id,name,breakfast_qty,main_qty,snack_qty,days_per_week,delivery_day_count,delivery_weekdays,price_qar,active,sort_order)
    values(v_package,v_name,v_breakfast,v_main,v_snack,v_days,v_count,v_weekdays,v_price,coalesce((p_payload->>'active')::boolean,true),coalesce((p_payload->>'sort_order')::int,0)) returning id into v_id;
  else
    v_id:=(p_payload->>'id')::uuid;
    if not exists(select 1 from public.np_package_options where id=v_id) then raise exception 'option_not_found'; end if;
    update public.np_package_options set package_id=v_package,name=v_name,breakfast_qty=v_breakfast,main_qty=v_main,snack_qty=v_snack,days_per_week=v_days,delivery_day_count=v_count,delivery_weekdays=v_weekdays,price_qar=v_price,active=coalesce((p_payload->>'active')::boolean,active),sort_order=coalesce((p_payload->>'sort_order')::int,sort_order),updated_at=now() where id=v_id;
  end if;
  return jsonb_build_object('id',v_id,'package_id',v_package,'price_qar',v_price,'days_per_week',v_days);
exception when unique_violation then raise exception 'option_name_exists';
end; $$;

-- Ensure packages created through the existing admin form also receive a
-- selectable default version. This preserves the existing package-save API.
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
  v_default_name text;
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
  v_default_name:=trim(p_payload->>'name')||' • Default';
  insert into public.np_package_options(package_id,name,breakfast_qty,main_qty,snack_qty,days_per_week,delivery_day_count,delivery_weekdays,price_qar,sort_order)
  values(v_id,v_default_name,v_breakfast,v_main,v_snack,v_days,v_delivery_days,v_weekdays,v_price,0)
  on conflict(package_id,name) do update set breakfast_qty=excluded.breakfast_qty,main_qty=excluded.main_qty,snack_qty=excluded.snack_qty,days_per_week=excluded.days_per_week,delivery_day_count=excluded.delivery_day_count,delivery_weekdays=excluded.delivery_weekdays,price_qar=excluded.price_qar,updated_at=now();
  return jsonb_build_object('id',v_id,'meals_per_day',v_meals,'delivery_day_count',v_delivery_days,'plan_type',v_plan_type,'plan_variant',v_variant);
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

create or replace function public.np_customer_create_order(p_token text, p_package_id uuid, p_start_date date, p_delivery_address text, p_delivery_slot text)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$ begin
  return public.np_customer_create_order(p_token,p_package_id,p_start_date,p_delivery_address,p_delivery_slot,null);
end; $$;

create or replace function public.np_customer_me(p_token text)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare v_id uuid; v_result jsonb;
begin
  v_id:=public.np_customer_id_for_token(p_token);
  if v_id is null then raise exception 'unauthorized'; end if;
  select jsonb_build_object(
    'customer',jsonb_build_object(
      'id',c.id,'username',c.username,'full_name',c.full_name,'email',c.email,'phone',c.phone,
      'goal',c.goal,'calorie_preference',c.calorie_preference,'dietary_preferences',c.dietary_preferences,'allergies',c.allergies,
      'delivery_address',c.delivery_address,'delivery_zone',c.delivery_zone,'delivery_slot',c.delivery_slot
    ),
    'orders',coalesce((select jsonb_agg(jsonb_build_object(
      'id',o.id,'order_number',o.order_number,'status',o.status,'payment_status',o.payment_status,'total_qar',o.total_qar,
      'start_date',o.start_date,'delivery_address',o.delivery_address,'delivery_slot',o.delivery_slot,
      'package_id',p.id,'package_name',p.name,'package_slug',p.slug,'plan_type',p.plan_type,'plan_variant',p.plan_variant,
      'package_option_id',o.package_option_id,'package_option_name',po.name,
      'duration_days',p.duration_days,'meals_per_day',coalesce(po.breakfast_qty+po.main_qty+po.snack_qty,p.meals_per_day),
      'breakfast_qty',coalesce(po.breakfast_qty,r.breakfast_qty),'main_qty',coalesce(po.main_qty,r.main_qty),'snack_qty',coalesce(po.snack_qty,r.snack_qty),
      'days_per_week',coalesce(po.days_per_week,cardinality(r.delivery_weekdays)),'delivery_day_count',coalesce(po.delivery_day_count,r.delivery_day_count),
      'selection_count',(select coalesce(sum(s.quantity),0) from public.np_meal_selections s where s.order_id=o.id),
      'next_delivery',(select min(s.delivery_date) from public.np_meal_selections s where s.order_id=o.id and s.delivery_date>=(now() at time zone 'Asia/Qatar')::date and not exists(select 1 from public.np_delivery_exceptions e where e.order_id=o.id and e.delivery_date=s.delivery_date and e.exception_type='skip')),
      'meal_change_count',o.meal_change_count,'meal_change_remaining',greatest(0,1-o.meal_change_count),'meal_change_used_at',o.meal_change_used_at
    ) order by o.created_at desc) from public.np_orders o join public.np_packages p on p.id=o.package_id join public.np_package_rules r on r.package_id=p.id left join public.np_package_options po on po.id=o.package_option_id where o.customer_id=c.id),'[]'::jsonb)
  ) into v_result from public.np_customers c where c.id=v_id;
  return v_result;
end; $$;

create or replace function public.np_customer_save_selections(p_token text, p_order_id uuid, p_selections jsonb)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare
  v_customer uuid; v_package uuid; v_option_id uuid; v_start date; v_duration integer; v_status text; v_rule public.np_package_rules%rowtype; v_option public.np_package_options%rowtype; v_package_type text;
  v_breakfast integer; v_main integer; v_snack integer; v_delivery_days integer; v_weekdays smallint[]; v_cycle_weeks integer; v_anchor date;
  v_sel jsonb; v_item uuid; v_slot text; v_date date; v_qty integer; v_count integer:=0; v_bad integer; v_days integer; v_cycle_week integer; v_existing_count integer; v_expected_days integer:=0; v_cursor date;
begin
  v_customer:=public.np_customer_guard(p_token);
  select o.package_id,o.package_option_id,o.start_date,p.duration_days,o.status,p.plan_type into v_package,v_option_id,v_start,v_duration,v_status,v_package_type
  from public.np_orders o join public.np_packages p on p.id=o.package_id where o.id=p_order_id and o.customer_id=v_customer for update of o;
  if v_package is null then raise exception 'order_not_found'; end if;
  if v_status not in ('draft','active','paused') then raise exception 'order_not_editable'; end if;
  select * into v_rule from public.np_package_rules where package_id=v_package;
  if v_rule.package_id is null then raise exception 'package_rules_missing'; end if;
  v_breakfast:=v_rule.breakfast_qty; v_main:=v_rule.main_qty; v_snack:=v_rule.snack_qty; v_delivery_days:=v_rule.delivery_day_count; v_weekdays:=v_rule.delivery_weekdays; v_cycle_weeks:=v_rule.cycle_weeks; v_anchor:=v_rule.cycle_anchor_date;
  if v_option_id is not null then
    select * into v_option from public.np_package_options where id=v_option_id and package_id=v_package and active=true;
    if v_option.id is null then raise exception 'package_option_not_available'; end if;
    v_breakfast:=v_option.breakfast_qty; v_main:=v_option.main_qty; v_snack:=v_option.snack_qty; v_delivery_days:=v_option.delivery_day_count; v_weekdays:=v_option.delivery_weekdays;
  end if;
  if jsonb_typeof(p_selections)<>'array' or jsonb_array_length(p_selections)=0 then raise exception 'invalid_selections'; end if;
  for v_sel in select * from jsonb_array_elements(p_selections) loop
    begin v_item:=(v_sel->>'menu_item_id')::uuid; v_slot:=lower(v_sel->>'meal_slot'); v_date:=(v_sel->>'delivery_date')::date; v_qty:=coalesce((v_sel->>'quantity')::integer,1); exception when others then raise exception 'invalid_selection_row'; end;
    if v_slot not in ('breakfast','main','snack') or v_qty<1 then raise exception 'invalid_selection_row'; end if;
    if v_date<v_start or v_date>=v_start+v_duration or extract(dow from v_date)::int <> all(v_weekdays) then raise exception 'selection_outside_package_dates'; end if;
    v_cycle_week:=mod(((v_date-v_anchor)/7),v_cycle_weeks)+1;
    if not exists(select 1 from public.np_package_items pi join public.np_menu_items mi on mi.id=pi.menu_item_id and mi.active=true where pi.package_id=v_package and pi.menu_item_id=v_item and pi.meal_slot=v_slot and (pi.cycle_week=0 or pi.cycle_week=v_cycle_week) and (v_package_type<>'gym' or mi.is_gym_menu=true)) then raise exception 'item_not_allowed_for_package'; end if;
  end loop;
  select count(distinct (x->>'delivery_date')::date)::int into v_days from jsonb_array_elements(p_selections) x;
  if v_days<>v_delivery_days then raise exception 'incorrect_delivery_day_count'; end if;
  v_cursor:=v_start;
  while v_cursor < v_start+v_duration and v_expected_days < v_delivery_days loop
    if extract(dow from v_cursor)::int = any(v_weekdays) then
      v_expected_days:=v_expected_days+1;
      if not exists(select 1 from jsonb_array_elements(p_selections) x where (x->>'delivery_date')::date=v_cursor) then raise exception 'incorrect_delivery_day_count'; end if;
    end if;
    v_cursor:=v_cursor+1;
  end loop;
  if v_expected_days<>v_delivery_days or exists(select 1 from jsonb_array_elements(p_selections) x where not exists(select 1 from generate_series(v_start,v_start+v_duration-1,interval '1 day') g(d) where g.d::date=(x->>'delivery_date')::date and extract(dow from g.d)::int=any(v_weekdays))) then raise exception 'incorrect_delivery_day_count'; end if;
  select count(*)::int into v_bad from (select (x->>'delivery_date')::date delivery_date,coalesce(sum(coalesce((x->>'quantity')::int,1)) filter(where lower(x->>'meal_slot')='breakfast'),0)::int b,coalesce(sum(coalesce((x->>'quantity')::int,1)) filter(where lower(x->>'meal_slot')='main'),0)::int m,coalesce(sum(coalesce((x->>'quantity')::int,1)) filter(where lower(x->>'meal_slot')='snack'),0)::int s from jsonb_array_elements(p_selections) x group by 1) q where q.b<>v_breakfast or q.m<>v_main or q.s<>v_snack;
  if v_bad>0 then raise exception 'incorrect_meal_quantities'; end if;
  select count(*)::int into v_existing_count from public.np_meal_selections where order_id=p_order_id;
  if v_existing_count>0 then raise exception 'meal_selection_locked'; end if;
  for v_sel in select * from jsonb_array_elements(p_selections) loop
    v_item:=(v_sel->>'menu_item_id')::uuid; v_slot:=lower(v_sel->>'meal_slot'); v_date:=(v_sel->>'delivery_date')::date; v_qty:=coalesce((v_sel->>'quantity')::integer,1);
    insert into public.np_meal_selections(order_id,delivery_date,meal_slot,menu_item_id,quantity) values(p_order_id,v_date,v_slot,v_item,v_qty) on conflict(order_id,delivery_date,meal_slot,menu_item_id) do update set quantity=excluded.quantity;
    v_count:=v_count+1;
  end loop;
  if v_status='draft' then update public.np_orders set status='active',updated_at=now() where id=p_order_id; insert into public.np_order_events(order_id,event_type,from_status,to_status,from_payment_status,to_payment_status,actor_type,actor_id,note) values(p_order_id,'schedule_completed','draft','active','not_required','not_required','customer',v_customer,'Testing mode: order activated after complete monthly meal schedule.'); end if;
  return jsonb_build_object('saved',v_count,'delivery_days',v_days,'validated',true,'status',case when v_status='draft' then 'active' else v_status end,'package_option_id',v_option_id);
end; $$;

create or replace function public.np_admin_orders(p_token text)
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare v_admin uuid; v_result jsonb;
begin
  v_admin:=public.np_admin_guard(p_token);
  select coalesce(jsonb_agg(r order by r.created_at desc),'[]'::jsonb) into v_result from (
    select o.id,o.order_number,o.total_qar,o.status,o.start_date,o.delivery_address,o.delivery_slot,o.created_at,o.updated_at,
      c.username customer_username,c.full_name,c.email,c.phone,c.delivery_zone,
      p.name package_name,p.slug package_slug,p.duration_days,
      coalesce(po.breakfast_qty+po.main_qty+po.snack_qty,p.meals_per_day) meals_per_day,
      po.name package_option_name,coalesce(po.days_per_week,cardinality(r.delivery_weekdays)) days_per_week,
      coalesce(po.delivery_day_count,r.delivery_day_count) delivery_day_count,
      coalesce((select sum(s.quantity)::int from public.np_meal_selections s where s.order_id=o.id),0) selection_count,
      (select min(s.delivery_date) from public.np_meal_selections s where s.order_id=o.id and s.delivery_date>=current_date and not exists(select 1 from public.np_delivery_exceptions e where e.order_id=o.id and e.delivery_date=s.delivery_date and e.exception_type='skip')) next_delivery,
      (select count(*)::int from public.np_delivery_exceptions e where e.order_id=o.id and e.exception_type='skip') skipped_deliveries
    from public.np_orders o join public.np_customers c on c.id=o.customer_id join public.np_packages p on p.id=o.package_id join public.np_package_rules r on r.package_id=p.id left join public.np_package_options po on po.id=o.package_option_id
  ) r;
  return v_result;
end; $$;

create or replace function public.np_staff_schedule(p_token text, p_from date default current_date, p_to date default (current_date + 7))
returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare v_id uuid; v_role text; v_rows jsonb; v_totals jsonb;
begin
  v_id:=public.np_staff_guard(p_token); select role into v_role from public.np_admin_users where id=v_id;
  if v_role not in ('admin','chef','sales') then raise exception 'forbidden'; end if;
  if p_to<p_from or p_to>p_from+31 then raise exception 'invalid_date_range'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'selection_id',s.id,'delivery_date',s.delivery_date,'meal_slot',s.meal_slot,'quantity',s.quantity,'meal_name',m.name,'meal_slug',m.slug,'calories',m.calories,
    'order_id',o.id,'order_number',o.order_number,'order_status',o.status,'package_name',p.name,'package_slug',p.slug,'package_option_name',po.name,'customer_name',c.full_name,
    'customer_email',case when v_role in ('admin','sales') then c.email else null end,'customer_phone',case when v_role in ('admin','sales') then c.phone else null end,
    'delivery_address',o.delivery_address,'delivery_slot',o.delivery_slot
  ) order by s.delivery_date,s.meal_slot,m.name,c.full_name),'[]'::jsonb) into v_rows
  from public.np_meal_selections s join public.np_orders o on o.id=s.order_id join public.np_customers c on c.id=o.customer_id join public.np_packages p on p.id=o.package_id join public.np_menu_items m on m.id=s.menu_item_id left join public.np_package_options po on po.id=o.package_option_id
  where s.delivery_date between p_from and p_to and o.status not in ('cancelled','completed') and (v_role<>'chef' or o.status='active') and not exists(select 1 from public.np_delivery_exceptions e where e.order_id=o.id and e.delivery_date=s.delivery_date and e.exception_type='skip');
  select coalesce(jsonb_agg(x order by x.delivery_date,x.meal_slot,x.meal_name),'[]'::jsonb) into v_totals from (
    select s.delivery_date,s.meal_slot,m.name meal_name,sum(s.quantity)::int total_quantity from public.np_meal_selections s join public.np_orders o on o.id=s.order_id join public.np_menu_items m on m.id=s.menu_item_id
    where s.delivery_date between p_from and p_to and o.status='active' and not exists(select 1 from public.np_delivery_exceptions e where e.order_id=o.id and e.delivery_date=s.delivery_date and e.exception_type='skip') group by s.delivery_date,s.meal_slot,m.name
  ) x;
  return jsonb_build_object('role',v_role,'from',p_from,'to',p_to,'rows',v_rows,'totals',v_totals,'testing_mode',true);
end; $$;

commit;
