-- Reset the test catalog and seed one Diet and one Gym plan with 30 items each.
-- Customer and staff accounts are preserved. Existing demo orders and their
-- dependent schedules/events are removed because catalog foreign keys are strict.

begin;

delete from public.np_delivery_exceptions;
delete from public.np_order_events;
delete from public.np_meal_selections;
delete from public.np_orders;
delete from public.np_package_items;
delete from public.np_package_options;
delete from public.np_package_rules;
delete from public.np_packages;
delete from public.np_menu_items;

insert into public.np_packages
  (name,slug,tagline,description,price_qar,duration_days,meals_per_day,plan_type,plan_variant,allow_day_count_selection,calories_min,calories_max,protein_target,active,featured,sort_order)
values
  ('Balanced Diet','balanced-diet','Balanced meals for everyday progress','A practical monthly diet plan with fresh meals across an eight-week cycle.',1800,30,3,'diet','standard',false,1400,1800,100,true,true,1),
  ('Gym Performance','gym-performance','Fuel stronger training days','A high-protein gym plan with gym-approved catalogue items and a four-week cycle.',2400,30,4,'gym','gym',true,2200,3000,160,true,true,2);

insert into public.np_package_rules
  (package_id,breakfast_qty,main_qty,snack_qty,days_per_week,delivery_day_count,delivery_weekdays,cycle_weeks,cycle_anchor_date,selection_days_ahead,cutoff_hours)
select id,1,1,1,6,24,array[0,1,2,3,4,6]::smallint[],8,date '2026-01-04',7,24
from public.np_packages where slug='balanced-diet';

insert into public.np_package_rules
  (package_id,breakfast_qty,main_qty,snack_qty,days_per_week,delivery_day_count,delivery_weekdays,cycle_weeks,cycle_anchor_date,selection_days_ahead,cutoff_hours)
select id,1,2,1,6,24,array[0,1,2,3,4,6]::smallint[],4,date '2026-01-04',7,24
from public.np_packages where slug='gym-performance';

insert into public.np_package_options
  (package_id,name,breakfast_qty,main_qty,snack_qty,days_per_week,delivery_day_count,delivery_weekdays,price_qar,active,sort_order)
select id,'Balanced Diet • Fixed',1,1,1,6,24,array[0,1,2,3,4,6]::smallint[],1800,true,0
from public.np_packages where slug='balanced-diet';

insert into public.np_package_options
  (package_id,name,breakfast_qty,main_qty,snack_qty,days_per_week,delivery_day_count,delivery_weekdays,price_qar,active,sort_order)
select id,'Gym Performance • 5 days',1,2,1,5,20,array[0,1,2,3,4]::smallint[],2000,true,0
from public.np_packages where slug='gym-performance';

insert into public.np_package_options
  (package_id,name,breakfast_qty,main_qty,snack_qty,days_per_week,delivery_day_count,delivery_weekdays,price_qar,active,sort_order)
select id,'Gym Performance • 6 days',1,2,1,6,24,array[0,1,2,3,4,6]::smallint[],2400,true,1
from public.np_packages where slug='gym-performance';

insert into public.np_menu_items
  (name,slug,category,description,calories,protein_g,carbs_g,fat_g,tags,allergens,is_gym_menu,active,sort_order)
values
  ('Oatmeal Berry Bowl','diet-oatmeal-berry-bowl','breakfast','Oatmeal Berry Bowl prepared for the diet menu.',420,22,58,12,'{}','{}',false,true,1),
  ('Egg White Veggie Scramble','diet-egg-white-veggie-scramble','breakfast','Egg White Veggie Scramble prepared for the diet menu.',360,32,18,16,'{}','{}',false,true,2),
  ('Greek Yogurt Parfait','diet-greek-yogurt-parfait','breakfast','Greek Yogurt Parfait prepared for the diet menu.',380,28,42,10,'{}','{}',false,true,3),
  ('Avocado Egg Toast','diet-avocado-egg-toast','breakfast','Avocado Egg Toast prepared for the diet menu.',450,24,38,22,'{}','{}',false,true,4),
  ('Cottage Cheese Fruit Cup','diet-cottage-cheese-fruit-cup','breakfast','Cottage Cheese Fruit Cup prepared for the diet menu.',340,30,36,8,'{}','{}',false,true,5),
  ('Protein Pancakes','diet-protein-pancakes','breakfast','Protein Pancakes prepared for the diet menu.',440,30,54,12,'{}','{}',false,true,6),
  ('Shakshuka Breakfast','diet-shakshuka-breakfast','breakfast','Shakshuka Breakfast prepared for the diet menu.',390,27,28,18,'{}','{}',false,true,7),
  ('Banana Protein Smoothie','diet-banana-protein-smoothie','breakfast','Banana Protein Smoothie prepared for the diet menu.',400,32,48,8,'{}','{}',false,true,8),
  ('Grilled Chicken Quinoa Bowl','diet-grilled-chicken-quinoa-bowl','main','Grilled Chicken Quinoa Bowl prepared for the diet menu.',620,48,58,18,'{}','{}',false,true,9),
  ('Lemon Herb Salmon','diet-lemon-herb-salmon','main','Lemon Herb Salmon prepared for the diet menu.',580,45,34,24,'{}','{}',false,true,10),
  ('Turkey Meatballs Pasta','diet-turkey-meatballs-pasta','main','Turkey Meatballs Pasta prepared for the diet menu.',640,44,68,18,'{}','{}',false,true,11),
  ('Beef Teriyaki Rice','diet-beef-teriyaki-rice','main','Beef Teriyaki Rice prepared for the diet menu.',680,46,70,20,'{}','{}',false,true,12),
  ('Chicken Tikka Masala','diet-chicken-tikka-masala','main','Chicken Tikka Masala prepared for the diet menu.',610,47,52,20,'{}','{}',false,true,13),
  ('Tuna Pesto Pasta','diet-tuna-pesto-pasta','main','Tuna Pesto Pasta prepared for the diet menu.',590,43,55,19,'{}','{}',false,true,14),
  ('Turkey Shawarma Bowl','diet-turkey-shawarma-bowl','main','Turkey Shawarma Bowl prepared for the diet menu.',630,48,60,17,'{}','{}',false,true,15),
  ('Beef Kofta Couscous','diet-beef-kofta-couscous','main','Beef Kofta Couscous prepared for the diet menu.',650,45,62,21,'{}','{}',false,true,16),
  ('Herb Chicken Sweet Potato','diet-herb-chicken-sweet-potato','main','Herb Chicken Sweet Potato prepared for the diet menu.',600,50,48,16,'{}','{}',false,true,17),
  ('Salmon Brown Rice','diet-salmon-brown-rice','main','Salmon Brown Rice prepared for the diet menu.',610,44,56,21,'{}','{}',false,true,18),
  ('Chicken Fajita Bowl','diet-chicken-fajita-bowl','main','Chicken Fajita Bowl prepared for the diet menu.',625,49,58,17,'{}','{}',false,true,19),
  ('Lean Beef Lasagna','diet-lean-beef-lasagna','main','Lean Beef Lasagna prepared for the diet menu.',670,46,62,23,'{}','{}',false,true,20),
  ('Almond Date Bites','diet-almond-date-bites','snack','Almond Date Bites prepared for the diet menu.',210,8,25,10,'{}','{}',false,true,21),
  ('Greek Yogurt Honey','diet-greek-yogurt-honey','snack','Greek Yogurt Honey prepared for the diet menu.',180,16,22,4,'{}','{}',false,true,22),
  ('Apple Peanut Butter','diet-apple-peanut-butter','snack','Apple Peanut Butter prepared for the diet menu.',220,7,28,10,'{}','{}',false,true,23),
  ('Protein Brownie','diet-protein-brownie','snack','Protein Brownie prepared for the diet menu.',230,18,24,9,'{}','{}',false,true,24),
  ('Hummus Veggie Cup','diet-hummus-veggie-cup','snack','Hummus Veggie Cup prepared for the diet menu.',190,8,20,9,'{}','{}',false,true,25),
  ('Cottage Cheese Berries','diet-cottage-cheese-berries','snack','Cottage Cheese Berries prepared for the diet menu.',170,15,18,4,'{}','{}',false,true,26),
  ('Roasted Seasonal Veg','diet-roasted-seasonal-veg','side','Roasted Seasonal Veg prepared for the diet menu.',120,4,18,4,'{}','{}',false,true,27),
  ('Garden Salad','diet-garden-salad','side','Garden Salad prepared for the diet menu.',95,3,12,4,'{}','{}',false,true,28),
  ('Green Detox Juice','diet-green-detox-juice','drink','Green Detox Juice prepared for the diet menu.',90,2,20,0,'{}','{}',false,true,29),
  ('Sparkling Citrus Water','diet-sparkling-citrus-water','drink','Sparkling Citrus Water prepared for the diet menu.',20,0,5,0,'{}','{}',false,true,30),
  ('Power Oats & Whey','gym-power-oats-whey','breakfast','Power Oats & Whey prepared for the gym menu.',520,38,62,14,'{}','{}',true,true,1),
  ('Steak Egg Breakfast','gym-steak-egg-breakfast','breakfast','Steak Egg Breakfast prepared for the gym menu.',610,45,20,30,'{}','{}',true,true,2),
  ('Chicken Breakfast Burrito','gym-chicken-breakfast-burrito','breakfast','Chicken Breakfast Burrito prepared for the gym menu.',570,42,54,18,'{}','{}',true,true,3),
  ('Peanut Butter Protein Toast','gym-peanut-butter-protein-toast','breakfast','Peanut Butter Protein Toast prepared for the gym menu.',500,32,48,20,'{}','{}',true,true,4),
  ('Greek Yogurt Granola Power Bowl','gym-greek-yogurt-granola-power-bowl','breakfast','Greek Yogurt Granola Power Bowl prepared for the gym menu.',540,35,68,12,'{}','{}',true,true,5),
  ('Turkey Egg Muffins','gym-turkey-egg-muffins','breakfast','Turkey Egg Muffins prepared for the gym menu.',480,40,18,24,'{}','{}',true,true,6),
  ('Berry Recovery Smoothie','gym-berry-recovery-smoothie','breakfast','Berry Recovery Smoothie prepared for the gym menu.',510,36,62,10,'{}','{}',true,true,7),
  ('Salmon Avocado Breakfast','gym-salmon-avocado-breakfast','breakfast','Salmon Avocado Breakfast prepared for the gym menu.',560,37,26,30,'{}','{}',true,true,8),
  ('High Protein Chicken Rice','gym-high-protein-chicken-rice','main','High Protein Chicken Rice prepared for the gym menu.',760,68,75,20,'{}','{}',true,true,9),
  ('Lean Beef Power Bowl','gym-lean-beef-power-bowl','main','Lean Beef Power Bowl prepared for the gym menu.',790,65,68,26,'{}','{}',true,true,10),
  ('Salmon Sweet Potato','gym-salmon-sweet-potato','main','Salmon Sweet Potato prepared for the gym menu.',720,58,52,27,'{}','{}',true,true,11),
  ('Turkey Pasta Performance','gym-turkey-pasta-performance','main','Turkey Pasta Performance prepared for the gym menu.',780,62,84,18,'{}','{}',true,true,12),
  ('Chicken Tikka Protein Plate','gym-chicken-tikka-protein-plate','main','Chicken Tikka Protein Plate prepared for the gym menu.',740,66,55,22,'{}','{}',true,true,13),
  ('Beef Fajita Rice','gym-beef-fajita-rice','main','Beef Fajita Rice prepared for the gym menu.',810,64,78,24,'{}','{}',true,true,14),
  ('Tuna Chickpea Pasta','gym-tuna-chickpea-pasta','main','Tuna Chickpea Pasta prepared for the gym menu.',700,58,70,18,'{}','{}',true,true,15),
  ('Chicken Shawarma Protein Bowl','gym-chicken-shawarma-protein-bowl','main','Chicken Shawarma Protein Bowl prepared for the gym menu.',750,65,64,20,'{}','{}',true,true,16),
  ('Steak Quinoa Greens','gym-steak-quinoa-greens','main','Steak Quinoa Greens prepared for the gym menu.',800,67,58,26,'{}','{}',true,true,17),
  ('Teriyaki Chicken Noodles','gym-teriyaki-chicken-noodles','main','Teriyaki Chicken Noodles prepared for the gym menu.',770,63,82,17,'{}','{}',true,true,18),
  ('Lamb Kofta Couscous','gym-lamb-kofta-couscous','main','Lamb Kofta Couscous prepared for the gym menu.',820,60,76,28,'{}','{}',true,true,19),
  ('Chicken Pesto Potato','gym-chicken-pesto-potato','main','Chicken Pesto Potato prepared for the gym menu.',730,64,55,21,'{}','{}',true,true,20),
  ('Whey Overnight Pudding','gym-whey-overnight-pudding','snack','Whey Overnight Pudding prepared for the gym menu.',280,28,25,8,'{}','{}',true,true,21),
  ('High Protein Greek Yogurt','gym-high-protein-greek-yogurt','snack','High Protein Greek Yogurt prepared for the gym menu.',240,24,22,6,'{}','{}',true,true,22),
  ('Beef Jerky & Fruit','gym-beef-jerky-fruit','snack','Beef Jerky & Fruit prepared for the gym menu.',260,22,26,5,'{}','{}',true,true,23),
  ('Peanut Protein Balls','gym-peanut-protein-balls','snack','Peanut Protein Balls prepared for the gym menu.',300,15,28,14,'{}','{}',true,true,24),
  ('Cottage Cheese Protein Cup','gym-cottage-cheese-protein-cup','snack','Cottage Cheese Protein Cup prepared for the gym menu.',230,26,18,5,'{}','{}',true,true,25),
  ('Tuna Rice Snack Box','gym-tuna-rice-snack-box','snack','Tuna Rice Snack Box prepared for the gym menu.',320,28,34,8,'{}','{}',true,true,26),
  ('Loaded Roasted Vegetables','gym-loaded-roasted-vegetables','side','Loaded Roasted Vegetables prepared for the gym menu.',160,7,24,5,'{}','{}',true,true,27),
  ('Quinoa Edamame Salad','gym-quinoa-edamame-salad','side','Quinoa Edamame Salad prepared for the gym menu.',240,12,30,8,'{}','{}',true,true,28),
  ('Electrolyte Citrus Cooler','gym-electrolyte-citrus-cooler','drink','Electrolyte Citrus Cooler prepared for the gym menu.',70,0,17,0,'{}','{}',true,true,29),
  ('Cocoa Recovery Shake','gym-cocoa-recovery-shake','drink','Cocoa Recovery Shake prepared for the gym menu.',260,30,28,4,'{}','{}',true,true,30);

insert into public.np_package_items(package_id,menu_item_id,meal_slot,cycle_week)
select p.id,m.id,m.category,0
from public.np_packages p
join public.np_menu_items m on m.slug like 'diet-%'
where p.slug='balanced-diet';

insert into public.np_package_items(package_id,menu_item_id,meal_slot,cycle_week)
select p.id,m.id,m.category,0
from public.np_packages p
join public.np_menu_items m on m.slug like 'gym-%'
where p.slug='gym-performance';

commit;
