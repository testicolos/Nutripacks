-- Expand the live Nutripacks catalogue without removing customers, orders, or existing items.
-- Run after the base schema and RPC functions. Safe to run more than once.

begin;

alter table public.np_packages add column if not exists image_url text;

insert into public.np_packages
  (name,slug,tagline,description,image_url,price_qar,duration_days,meals_per_day,plan_type,plan_variant,allow_day_count_selection,calories_min,calories_max,protein_target,active,featured,sort_order)
values
  ('Balanced Diet','balanced-diet','Balanced meals for everyday progress','A practical monthly diet plan with fresh breakfasts, mains and snacks.','https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=82',1800,30,3,'diet','standard',false,1400,1800,100,true,true,1),
  ('Everyday Essentials','everyday-essentials','Simple nutrition for busy weeks','Reliable everyday meals with familiar flavours and balanced portions.','https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=82',1650,30,3,'diet','standard',false,1500,2000,95,true,false,2),
  ('Weight Loss','weight-loss','Calorie-aware meals that satisfy','Lean proteins, vegetables and portion-controlled favourites for steady progress.','https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=82',1950,30,4,'diet','standard',false,1200,1600,110,true,true,3),
  ('Vegetarian Balance','vegetarian-balance','Plant-forward variety every day','A colourful vegetarian plan built around legumes, grains, dairy and fresh produce.','https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=82',1850,30,3,'diet','standard',false,1400,1850,85,true,false,4),
  ('Business Lunch','business-lunch','Workday lunches without the admin','A five-day office lunch plan with one main and one snack for every workday.','https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=1200&q=82',1250,30,2,'diet','business_lunch',false,650,900,45,true,false,5),
  ('Executive Business Lunch','executive-business-lunch','Premium meals for teams and meetings','Elevated weekday lunches with premium proteins, sides and office-ready snacks.','https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=82',1550,30,2,'diet','business_lunch',false,700,1000,55,true,false,6),
  ('Gym Performance','gym-performance','Fuel stronger training days','A high-protein gym plan with gym-approved meals and a customer choice of five or six days.','https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=82',2400,30,4,'gym','gym',true,2200,3000,160,true,true,7),
  ('Lean Muscle Gym','lean-muscle-gym','High protein with controlled calories','Training-day nutrition for building lean muscle with two mains and two snacks.','https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=82',2750,30,5,'gym','gym',true,2300,3100,185,true,false,8),
  ('Mass Gain Gym','mass-gain-gym','More fuel for serious size goals','A higher-calorie performance plan with three mains, two snacks and gym-only choices.','https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=82',3200,30,6,'gym','gym',true,2900,3900,210,true,false,9)
on conflict(slug) do update set
  name=excluded.name,tagline=excluded.tagline,description=excluded.description,image_url=excluded.image_url,
  price_qar=excluded.price_qar,duration_days=excluded.duration_days,meals_per_day=excluded.meals_per_day,
  plan_type=excluded.plan_type,plan_variant=excluded.plan_variant,allow_day_count_selection=excluded.allow_day_count_selection,
  calories_min=excluded.calories_min,calories_max=excluded.calories_max,protein_target=excluded.protein_target,
  active=excluded.active,featured=excluded.featured,sort_order=excluded.sort_order,updated_at=now();

insert into public.np_package_rules
  (package_id,breakfast_qty,main_qty,snack_qty,days_per_week,delivery_day_count,delivery_weekdays,cycle_weeks,cycle_anchor_date,selection_days_ahead,cutoff_hours)
select p.id,v.breakfast_qty,v.main_qty,v.snack_qty,v.days_per_week,v.delivery_day_count,v.delivery_weekdays,v.cycle_weeks,date '2026-01-04',7,24
from (values
  ('balanced-diet',1,1,1,6,24,array[0,1,2,3,4,6]::smallint[],8),
  ('everyday-essentials',1,1,1,6,24,array[0,1,2,3,4,6]::smallint[],8),
  ('weight-loss',1,1,2,6,24,array[0,1,2,3,4,6]::smallint[],8),
  ('vegetarian-balance',1,1,1,6,24,array[0,1,2,3,4,6]::smallint[],8),
  ('business-lunch',0,1,1,5,20,array[0,1,2,3,4]::smallint[],8),
  ('executive-business-lunch',0,1,1,5,20,array[0,1,2,3,4]::smallint[],8),
  ('gym-performance',1,2,1,6,24,array[0,1,2,3,4,6]::smallint[],4),
  ('lean-muscle-gym',1,2,2,6,24,array[0,1,2,3,4,6]::smallint[],4),
  ('mass-gain-gym',1,3,2,6,24,array[0,1,2,3,4,6]::smallint[],4)
) as v(slug,breakfast_qty,main_qty,snack_qty,days_per_week,delivery_day_count,delivery_weekdays,cycle_weeks)
join public.np_packages p on p.slug=v.slug
on conflict(package_id) do update set
  breakfast_qty=excluded.breakfast_qty,main_qty=excluded.main_qty,snack_qty=excluded.snack_qty,
  days_per_week=excluded.days_per_week,delivery_day_count=excluded.delivery_day_count,
  delivery_weekdays=excluded.delivery_weekdays,cycle_weeks=excluded.cycle_weeks,
  cycle_anchor_date=excluded.cycle_anchor_date,selection_days_ahead=excluded.selection_days_ahead,
  cutoff_hours=excluded.cutoff_hours,updated_at=now();

insert into public.np_package_options
  (package_id,name,breakfast_qty,main_qty,snack_qty,days_per_week,delivery_day_count,delivery_weekdays,price_qar,active,sort_order)
select p.id,v.name,v.breakfast_qty,v.main_qty,v.snack_qty,v.days_per_week,v.delivery_day_count,v.delivery_weekdays,v.price_qar,true,v.sort_order
from (values
  ('balanced-diet','Balanced Diet • Fixed',1,1,1,6,24,array[0,1,2,3,4,6]::smallint[],1800::numeric,0),
  ('everyday-essentials','Everyday Essentials • Fixed',1,1,1,6,24,array[0,1,2,3,4,6]::smallint[],1650::numeric,0),
  ('weight-loss','Weight Loss • Fixed',1,1,2,6,24,array[0,1,2,3,4,6]::smallint[],1950::numeric,0),
  ('vegetarian-balance','Vegetarian Balance • Fixed',1,1,1,6,24,array[0,1,2,3,4,6]::smallint[],1850::numeric,0),
  ('business-lunch','Business Lunch • Fixed',0,1,1,5,20,array[0,1,2,3,4]::smallint[],1250::numeric,0),
  ('executive-business-lunch','Executive Business Lunch • Fixed',0,1,1,5,20,array[0,1,2,3,4]::smallint[],1550::numeric,0),
  ('gym-performance','Gym Performance • 5 days',1,2,1,5,20,array[0,1,2,3,4]::smallint[],2000::numeric,0),
  ('gym-performance','Gym Performance • 6 days',1,2,1,6,24,array[0,1,2,3,4,6]::smallint[],2400::numeric,1),
  ('lean-muscle-gym','Lean Muscle Gym • 5 days',1,2,2,5,20,array[0,1,2,3,4]::smallint[],2290::numeric,0),
  ('lean-muscle-gym','Lean Muscle Gym • 6 days',1,2,2,6,24,array[0,1,2,3,4,6]::smallint[],2750::numeric,1),
  ('mass-gain-gym','Mass Gain Gym • 5 days',1,3,2,5,20,array[0,1,2,3,4]::smallint[],2670::numeric,0),
  ('mass-gain-gym','Mass Gain Gym • 6 days',1,3,2,6,24,array[0,1,2,3,4,6]::smallint[],3200::numeric,1)
) as v(slug,name,breakfast_qty,main_qty,snack_qty,days_per_week,delivery_day_count,delivery_weekdays,price_qar,sort_order)
join public.np_packages p on p.slug=v.slug
on conflict(package_id,name) do update set
  breakfast_qty=excluded.breakfast_qty,main_qty=excluded.main_qty,snack_qty=excluded.snack_qty,
  days_per_week=excluded.days_per_week,delivery_day_count=excluded.delivery_day_count,
  delivery_weekdays=excluded.delivery_weekdays,price_qar=excluded.price_qar,
  active=excluded.active,sort_order=excluded.sort_order,updated_at=now();

insert into public.np_menu_items
  (name,slug,category,description,calories,protein_g,carbs_g,fat_g,tags,allergens,is_gym_menu,active,sort_order)
values
  ('Overnight Chia Cup','normal-chia-cup','breakfast','Chia, oats, berries and Greek yogurt prepared overnight.',360,20,44,11,array['balanced','high-fibre'],array['dairy'],false,true,101),
  ('Labneh Za’atar Wrap','normal-labneh-wrap','breakfast','Whole-wheat wrap with labneh, za’atar, cucumber and tomato.',410,19,48,16,array['vegetarian','middle-eastern'],array['dairy','gluten'],false,true,102),
  ('Date Almond Porridge','normal-date-porridge','breakfast','Creamy oats with dates, almond butter and cinnamon.',430,17,59,15,array['vegetarian','high-fibre'],array['nuts'],false,true,103),
  ('Turkey Cheese Croissant','normal-turkey-croissant','breakfast','Turkey breast and light cheese in a baked whole-grain croissant.',470,30,43,20,array['high-protein'],array['dairy','gluten'],false,true,104),
  ('Spinach Feta Omelette','veggie-spinach-feta-omelette','breakfast','Three-egg omelette with spinach, feta and roasted tomato.',390,29,13,24,array['vegetarian','low-carb'],array['egg','dairy'],false,true,105),
  ('Chicken Machboos Light','normal-chicken-machboos-light','main','Qatari-spiced chicken and basmati rice with lighter seasoning.',610,48,67,16,array['local-favourite','high-protein'],array[]::text[],false,true,106),
  ('Beef Mushroom Rice','normal-beef-mushroom-rice','main','Lean beef strips, mushrooms and herbed brown rice.',650,47,61,22,array['high-protein'],array[]::text[],false,true,107),
  ('Lemon Chicken Pasta','normal-lemon-chicken-pasta','main','Grilled chicken, penne and a bright lemon herb sauce.',620,49,66,17,array['high-protein'],array['gluten'],false,true,108),
  ('Grilled Halloumi Quinoa','veggie-halloumi-quinoa','main','Grilled halloumi, quinoa, cucumber, tomato and fresh herbs.',590,27,57,28,array['vegetarian'],array['dairy'],false,true,109),
  ('Teriyaki Tofu Bowl','veggie-teriyaki-tofu-bowl','main','Tofu, brown rice, edamame and vegetables with light teriyaki.',560,29,69,18,array['vegetarian','plant-protein'],array['soy'],false,true,110),
  ('Mediterranean Chickpea Bowl','veggie-mediterranean-chickpea-bowl','main','Chickpeas, couscous, roasted vegetables, tahini and herbs.',570,24,76,19,array['vegetarian','high-fibre'],array['sesame','gluten'],false,true,111),
  ('Executive Grilled Chicken','business-executive-grilled-chicken','main','Herb-grilled chicken breast, saffron rice and seasonal vegetables.',640,52,63,18,array['business-lunch','high-protein'],array[]::text[],false,true,112),
  ('Corporate Beef Stroganoff','business-corporate-beef-stroganoff','main','Lean beef and mushrooms in a light creamy sauce with rice.',690,48,66,25,array['business-lunch'],array['dairy'],false,true,113),
  ('Office Salmon Teriyaki','business-office-salmon-teriyaki','main','Teriyaki salmon, sesame vegetables and steamed brown rice.',650,45,58,26,array['business-lunch','omega-3'],array['fish','soy','sesame'],false,true,114),
  ('Meeting Veggie Lasagna','business-meeting-veggie-lasagna','main','Layered vegetables, tomato, pasta and ricotta for office lunches.',610,28,70,24,array['business-lunch','vegetarian'],array['dairy','gluten'],false,true,115),
  ('Fruit & Nut Box','normal-fruit-nut-box','snack','Fresh seasonal fruit with a portion of roasted mixed nuts.',220,6,27,11,array['vegetarian'],array['nuts'],false,true,116),
  ('Chocolate Protein Mousse','normal-chocolate-protein-mousse','snack','Light cocoa mousse blended with Greek yogurt and protein.',210,21,20,6,array['high-protein'],array['dairy'],false,true,117),
  ('Mini Hummus Pita','normal-mini-hummus-pita','snack','Whole-wheat pita wedges with creamy hummus and vegetables.',230,9,35,7,array['vegetarian'],array['sesame','gluten'],false,true,118),
  ('Office Protein Cookie','business-office-protein-cookie','snack','Soft oat protein cookie individually packed for the workday.',240,15,28,9,array['business-lunch'],array['dairy','gluten'],false,true,119),
  ('Executive Yogurt Cup','business-executive-yogurt-cup','snack','Greek yogurt, berries, honey and toasted granola.',205,17,27,4,array['business-lunch','vegetarian'],array['dairy','gluten'],false,true,120),
  ('Herb Couscous Salad','normal-herb-couscous-salad','side','Couscous with parsley, mint, cucumber, tomato and lemon.',170,6,29,4,array['vegetarian'],array['gluten'],false,true,121),
  ('Office Garden Salad','business-office-garden-salad','side','Crisp greens, cucumber, tomato and balsamic dressing.',105,4,13,5,array['business-lunch','vegetarian'],array[]::text[],false,true,122),
  ('Roasted Root Vegetables','veggie-roasted-root-vegetables','side','Carrot, pumpkin and sweet potato roasted with herbs.',155,3,30,4,array['vegetarian','vegan'],array[]::text[],false,true,123),
  ('Office Citrus Water','business-office-citrus-water','drink','Still water infused with orange, lemon and mint.',15,0,4,0,array['business-lunch','refreshing'],array[]::text[],false,true,124),
  ('Berry Hibiscus Water','normal-berry-hibiscus-water','drink','Chilled hibiscus infusion with berries and no added sugar.',25,0,6,0,array['refreshing','low-calorie'],array[]::text[],false,true,125),
  ('Egg & Steak Hash','gym-egg-steak-hash','breakfast','Lean steak, eggs and roasted potato for a powerful start.',650,49,42,31,array['gym','high-protein'],array['egg'],true,true,126),
  ('Whey Banana Oats','gym-whey-banana-oats','breakfast','Oats, banana, whey and peanut butter for training fuel.',590,42,72,16,array['gym','high-protein'],array['dairy','nuts'],true,true,127),
  ('Chicken Egg Wrap','gym-chicken-egg-wrap','breakfast','Chicken breast, scrambled egg and vegetables in a whole-wheat wrap.',610,52,48,22,array['gym','high-protein'],array['egg','gluten'],true,true,128),
  ('Double Chicken Rice','gym-double-chicken-rice','main','Double grilled chicken breast with basmati rice and vegetables.',860,82,80,21,array['gym','high-protein'],array[]::text[],true,true,129),
  ('Beef Sweet Potato Power Plate','gym-beef-sweet-potato','main','Lean beef, roasted sweet potato and sautéed greens.',790,66,61,27,array['gym','high-protein'],array[]::text[],true,true,130),
  ('Salmon Quinoa Power Bowl','gym-salmon-quinoa-power','main','Salmon, quinoa, edamame and greens with lemon dressing.',760,59,55,31,array['gym','omega-3'],array['fish','soy'],true,true,131),
  ('Turkey Macros Pasta','gym-turkey-macros-pasta','main','Turkey mince, whole-wheat pasta and tomato basil sauce.',810,67,86,20,array['gym','high-protein'],array['gluten'],true,true,132),
  ('Lean Lamb Rice Plate','gym-lean-lamb-rice','main','Lean lamb, spiced rice and grilled vegetables.',840,62,78,29,array['gym','high-protein'],array[]::text[],true,true,133),
  ('Protein Shawarma Plate','gym-protein-shawarma-plate','main','Extra chicken shawarma, rice, salad and light garlic sauce.',820,72,70,25,array['gym','high-protein'],array['dairy'],true,true,134),
  ('Whey Cheesecake Cup','gym-whey-cheesecake-cup','snack','Protein cheesecake cup with berry compote.',290,29,25,9,array['gym','high-protein'],array['dairy'],true,true,135),
  ('Turkey Snack Box','gym-turkey-snack-box','snack','Turkey slices, boiled egg, fruit and whole-grain crackers.',310,30,29,10,array['gym','high-protein'],array['egg','gluten'],true,true,136),
  ('Protein Date Truffles','gym-protein-date-truffles','snack','Dates, whey, cocoa and almond butter rolled into bites.',280,18,32,10,array['gym','high-protein'],array['dairy','nuts'],true,true,137),
  ('Broccoli Edamame Mix','gym-broccoli-edamame','side','Steamed broccoli and edamame with lemon and sea salt.',180,14,20,6,array['gym','plant-protein'],array['soy'],true,true,138),
  ('Power Greens','gym-power-greens','side','Kale, spinach, avocado and pumpkin seeds.',210,8,14,16,array['gym','low-carb'],array['seeds'],true,true,139),
  ('Mocha Recovery Shake','gym-mocha-recovery-shake','drink','Cold brew, cocoa, milk and whey blended for recovery.',300,32,31,6,array['gym','high-protein'],array['dairy'],true,true,140)
on conflict(slug) do update set
  name=excluded.name,category=excluded.category,description=excluded.description,
  calories=excluded.calories,protein_g=excluded.protein_g,carbs_g=excluded.carbs_g,fat_g=excluded.fat_g,
  tags=excluded.tags,allergens=excluded.allergens,is_gym_menu=excluded.is_gym_menu,
  active=excluded.active,sort_order=excluded.sort_order,updated_at=now();

-- Add a category-appropriate photo to every menu item, including the original 60-item seed.
update public.np_menu_items
set image_url = case
  when category='breakfast' and slug like '%smoothie%' then 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=82'
  when category='breakfast' and (slug like '%egg%' or slug like '%omelette%' or slug like '%shakshuka%') then 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=82'
  when category='breakfast' and (slug like '%pancake%' or slug like '%toast%') then 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1200&q=82'
  when category='breakfast' then 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=1200&q=82'
  when category='main' and slug like '%salmon%' then 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=82'
  when category='main' and (slug like '%pasta%' or slug like '%lasagna%' or slug like '%noodle%') then 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=82'
  when category='main' and (slug like '%beef%' or slug like '%steak%' or slug like '%lamb%') then 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=82'
  when category='main' and (slug like '%tofu%' or slug like '%chickpea%' or slug like '%halloumi%' or slug like '%veggie%') then 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=82'
  when category='main' then 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=82'
  when category='snack' and (slug like '%yogurt%' or slug like '%cheesecake%' or slug like '%mousse%') then 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=82'
  when category='snack' then 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1200&q=82'
  when category='side' then 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=82'
  when category='drink' and is_gym_menu then 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=82'
  else 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1200&q=82'
end
where image_url is null or btrim(image_url)='';

-- Standard and weight-loss plans share the full non-business Diet catalogue.
insert into public.np_package_items(package_id,menu_item_id,meal_slot,cycle_week)
select p.id,m.id,m.category,0
from public.np_packages p
cross join public.np_menu_items m
where p.slug in ('balanced-diet','everyday-essentials','weight-loss')
  and m.active and not m.is_gym_menu and m.slug not like 'business-%'
on conflict do nothing;

-- Vegetarian eligibility includes plant-forward mains plus vegetarian breakfasts, snacks, sides and drinks.
insert into public.np_package_items(package_id,menu_item_id,meal_slot,cycle_week)
select p.id,m.id,m.category,0
from public.np_packages p
cross join public.np_menu_items m
where p.slug='vegetarian-balance' and m.active and not m.is_gym_menu
  and (
    m.slug like 'veggie-%'
    or m.slug in (
      'diet-oatmeal-berry-bowl','diet-greek-yogurt-parfait','diet-avocado-egg-toast','diet-cottage-cheese-fruit-cup',
      'diet-protein-pancakes','diet-shakshuka-breakfast','diet-banana-protein-smoothie','normal-chia-cup',
      'normal-labneh-wrap','normal-date-porridge','diet-almond-date-bites','diet-greek-yogurt-honey',
      'diet-apple-peanut-butter','diet-protein-brownie','diet-hummus-veggie-cup','diet-cottage-cheese-berries',
      'normal-fruit-nut-box','normal-chocolate-protein-mousse','normal-mini-hummus-pita','diet-roasted-seasonal-veg',
      'diet-garden-salad','normal-herb-couscous-salad','diet-green-detox-juice','diet-sparkling-citrus-water',
      'normal-berry-hibiscus-water'
    )
  )
on conflict do nothing;

-- Business plans use only the office-labelled menu, including related sides and drinks.
insert into public.np_package_items(package_id,menu_item_id,meal_slot,cycle_week)
select p.id,m.id,m.category,0
from public.np_packages p
cross join public.np_menu_items m
where p.slug in ('business-lunch','executive-business-lunch') and m.active and m.slug like 'business-%'
on conflict do nothing;

-- All Gym plans receive every item explicitly marked for the Gym menu.
insert into public.np_package_items(package_id,menu_item_id,meal_slot,cycle_week)
select p.id,m.id,m.category,0
from public.np_packages p
cross join public.np_menu_items m
where p.slug in ('gym-performance','lean-muscle-gym','mass-gain-gym') and m.active and m.is_gym_menu
on conflict do nothing;

commit;
