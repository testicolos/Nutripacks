import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import { getPackageRule, getPublicCatalog } from '../lib/catalog';

export const dynamic = 'force-dynamic';

type IconName = 'leaf' | 'chef' | 'heart' | 'truck' | 'profile' | 'bowl' | 'hat' | 'dumbbell' | 'gear';

function LineIcon({ name }: { name: IconName }) {
  const common = { viewBox: '0 0 64 64', role: 'presentation' as const };
  if (name === 'leaf') return <svg {...common}><path d="M51 10C30 11 16 23 15 43c19 1 34-11 36-33Z"/><path d="M16 47c8-12 17-21 30-29"/></svg>;
  if (name === 'chef') return <svg {...common}><path d="M20 28c-7-1-11-6-11-12 0-7 5-12 12-12 5 0 9 3 11 7 2-5 7-8 13-8 8 0 14 6 14 14 0 6-4 10-10 12"/><path d="M18 27h31l-4 27H22l-4-27Z"/><path d="M27 43h13"/></svg>;
  if (name === 'heart') return <svg {...common}><path d="M32 53S9 41 9 22c0-8 6-14 14-14 5 0 9 3 12 8 3-5 7-8 12-8 8 0 14 6 14 14 0 19-29 31-29 31Z"/></svg>;
  if (name === 'truck') return <svg {...common}><path d="M7 17h31v27H7zM38 27h10l9 10v7H38z"/><circle cx="18" cy="48" r="6"/><circle cx="48" cy="48" r="6"/></svg>;
  if (name === 'profile') return <svg {...common}><rect x="9" y="13" width="46" height="38" rx="10"/><circle cx="24" cy="27" r="7"/><path d="M15 44c2-7 7-10 9-10s7 3 9 10M39 23h10M39 31h8M39 39h6"/><path className="accentPath" d="M46 49c5-1 8-5 9-9-5 0-9 2-12 6 0-4-2-8-6-10 0 6 3 11 9 13Z"/></svg>;
  if (name === 'bowl') return <svg {...common}><path d="M8 31h48c-2 15-11 23-24 23S10 46 8 31Z"/><path d="M13 31c2-10 9-16 19-16s17 6 19 16"/><path d="M20 27c2-4 5-6 9-6M36 22c4 0 7 2 9 5"/><path className="accentPath" d="M31 18c0-5 3-9 8-11 0 5-3 9-8 11Zm-2 0c-5 0-9-3-11-8 5 0 9 3 11 8Z"/></svg>;
  if (name === 'dumbbell') return <svg {...common}><path d="M8 24v16M14 20v24M20 27h24M44 20v24M50 24v16M14 32h6M44 32h6"/></svg>;
  if (name === 'gear') return <svg {...common}><circle cx="32" cy="32" r="9"/><path d="M32 7v7M32 50v7M7 32h7M50 32h7M14 14l5 5M45 45l5 5M50 14l-5 5M19 45l-5 5"/></svg>;
  return <svg {...common}><path d="M17 28c-5-1-8-5-8-10 0-6 5-10 11-10 4 0 7 2 9 5 2-4 6-6 11-6 7 0 12 5 12 12 0 4-2 7-5 9"/><path d="M18 27h29l-3 24H21l-3-24Z"/><path d="M26 39h12"/><path className="accentPath" d="M30 29c1-4 4-7 8-8 0 4-3 8-8 9Zm-2 0c-4 0-7-2-9-6 4 0 8 2 10 6"/></svg>;
}

const HERO_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1600&q=92';
const SECONDARY_IMAGE = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=88';

export default async function HomePage() {
  const catalog = await getPublicCatalog();
  const mains = catalog.menu.filter(meal => meal.category === 'main');
  const featuredMeals = (mains.length >= 4 ? mains : catalog.menu).slice(0, 4);
  const displayPlans = catalog.packages;
  const primaryPlan = displayPlans.find(plan => plan.featured) || displayPlans[0];

  return (
    <main className="siteShell finalHome">
      <SiteHeader />

      <section className="finalHero" id="top">
        <span className="finalLeaf heroLeafOne" />
        <span className="finalLeaf heroLeafTwo" />
        <span className="finalLeaf heroLeafThree" />
        <span className="finalTomato heroTomatoOne" />
        <span className="finalTomato heroTomatoTwo" />
        <div className="finalFlour flourOne" />

        <div className="finalContent finalHeroGrid">
          <div className="finalHeroCopy" data-reveal>
            <span className="eyebrow">Fresh meals. A brighter you.</span>
            <h1>Healthy Meals<br/><span>for a Better Tomorrow</span></h1>
            <p>Nutri Packs Qatar delivers chef-prepared, nutritious meals designed for your goals. Real ingredients. Clear nutrition. Real progress.</p>
            <div className="heroActions">
              <a className="button buttonPrimary" href="#plans">Choose Your Plan →</a>
              <a className="button buttonSecondary" href="/menu">Explore Our Menu</a>
            </div>
            <div className="finalTrust">
              <span><LineIcon name="leaf"/>Fresh Ingredients</span>
              <span><LineIcon name="chef"/>Chef Prepared</span>
              <span><LineIcon name="heart"/>No Preservatives</span>
              <span><LineIcon name="truck"/>Delivered to Your Door</span>
            </div>
          </div>

          <div className="finalHeroVisual" data-reveal>
            <div className="finalScript heroScript">Good Food.<br/>Brighter Days ♡</div>
            <div className="finalPlate">
              <img src={HERO_IMAGE} alt="Colorful healthy Nutri Packs meal" />
            </div>
            <div className="finalSeal">Real<br/>Food<br/><strong>Real Progress</strong></div>
            <div className="finalSideDish"><img src={SECONDARY_IMAGE} alt="" /></div>
            <span className="finalLeaf plateLeafOne" />
            <span className="finalLeaf plateLeafTwo" />
          </div>
        </div>
      </section>

      <section className="finalBenefits">
        <div className="finalContent finalBenefitGrid">
          <article><span><LineIcon name="leaf"/></span><div><strong>Nutritious Ingredients</strong><small>Wholesome. Local. Trusted.</small></div></article>
          <article><span><LineIcon name="chef"/></span><div><strong>Chef-Prepared Meals</strong><small>Restaurant-quality taste.</small></div></article>
          <article><span><LineIcon name="heart"/></span><div><strong>Flexible Packages</strong><small>Plans for every lifestyle.</small></div></article>
          <article><span><LineIcon name="truck"/></span><div><strong>Convenient Delivery</strong><small>Fresh to your door, on time.</small></div></article>
        </div>
      </section>

      <section className="finalHow" id="how">
        <div className="finalFabric fabricLeft" />
        <span className="finalLeaf howLeafOne" />
        <span className="finalLeaf howLeafTwo" />
        <div className="finalContent">
          <header className="finalSectionHeading" data-reveal>
            <span className="eyebrow">Simple steps. Real results.</span>
            <h2>How <span>Nutri Packs</span> Works</h2>
            <p>From signup to serving — a healthier, happier you.</p>
          </header>

          <div className="finalStepGrid">
            <article data-reveal>
              <div className="finalStepMedia iconMedia"><LineIcon name="profile"/></div>
              <h3>Create your profile</h3>
              <p>Add delivery details, goals and allergies.</p>
            </article>
            <article data-reveal>
              <div className="finalStepMedia photoMedia"><img src={primaryPlan?.image_url || HERO_IMAGE} alt="Nutri Packs meal package"/></div>
              <h3>Choose a live package</h3>
              <p>Pick a configured meals/day and days/week version with its own price.</p>
            </article>
            <article data-reveal>
              <div className="finalStepMedia photoMedia roundMeal"><img src={featuredMeals[1]?.image_url || SECONDARY_IMAGE} alt="Nutri Packs meal selection"/></div>
              <h3>Select your meals</h3>
              <p>Only items assigned to your package and active cycle week are shown.</p>
            </article>
            <article data-reveal>
              <div className="finalStepMedia iconMedia chefMedia"><LineIcon name="hat"/></div>
              <h3>Kitchen sees the schedule</h3>
              <p>Chef and sales views update from customer selections.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="finalPlans" id="plans">
        <span className="finalLeaf planLeafOne" />
        <span className="finalLeaf planLeafTwo" />
        <div className="finalContent">
          <header className="finalSectionHeading" data-reveal>
            <span className="eyebrow">Meal plans for every goal</span>
            <h2>Choose <span>Your Plan</span></h2>
            <p>Flexible. Nutritious. Made for your lifestyle.</p>
          </header>

          <div className="finalPlanGrid">
            {displayPlans.map((plan, index) => {
              const rule = getPackageRule(catalog, plan.id);
              const options = (catalog.options || []).filter(option => option.package_id === plan.id && option.active !== false);
              const price = Number(options[0]?.price_qar ?? plan.price_qar);
              const minDays = options.length ? Math.min(...options.map(option => option.days_per_week)) : (rule?.days_per_week || 6);
              const maxDays = options.length ? Math.max(...options.map(option => option.days_per_week)) : minDays;
              const dayText = minDays === maxDays ? `${minDays} days per week` : `${minDays}–${maxDays} days per week`;
              const icons: IconName[] = ['leaf', 'bowl', 'dumbbell', 'gear'];
              const icon = icons[index % icons.length];

              return (
                <article className={plan.featured ? 'finalPlanCard popularPlan' : 'finalPlanCard'} key={plan.id} data-reveal>
                  {plan.featured && <span className="finalPopular">Most Popular</span>}
                  <span className="finalPlanIcon"><LineIcon name={icon}/></span>
                  <h3>{plan.name}</h3>
                  <p>{plan.tagline || plan.description}</p>
                  <div className="finalPlanPrice"><small>QAR</small><strong>{price.toLocaleString()}</strong><span>/ plan</span></div>
                  <ul>
                    <li>{plan.meals_per_day} items per delivery day</li>
                    <li>{dayText}</li>
                    <li>{rule?.delivery_day_count || plan.duration_days} delivery days base</li>
                  </ul>
                  <a className={plan.featured ? 'button buttonPrimary fullButton' : 'button buttonSecondary fullButton'} href={'/select?plan=' + encodeURIComponent(plan.slug)}>Get Started →</a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="finalMeals" id="menu">
        <span className="finalLeaf menuLeafOne" />
        <div className="finalContent">
          <header className="finalSectionHeading mealHeading" data-reveal>
            <span className="eyebrow">Our signature meals</span>
            <h2>Fresh. Delicious. <span>Nutritious.</span></h2>
            <div className="finalHomeFilters" aria-hidden="true">
              <span className="active">All Meals</span><span>High Protein</span><span>Low Carb</span><span>Vegetarian</span><span>Under 500 kcal</span>
            </div>
            <a className="finalViewMenu" href="/menu">View Full Menu →</a>
          </header>

          <div className="finalMealGrid">
            {featuredMeals.map(meal => (
              <article className="finalMealCard" key={meal.id} data-reveal>
                <div className="finalMealImage"><img src={meal.image_url || SECONDARY_IMAGE} alt={meal.name}/></div>
                <div className="finalMealBody">
                  <div className="finalMealTitle"><h3>{meal.name}</h3><span>♡</span></div>
                  <div className="finalMealMacros"><span>{meal.calories} kcal</span><span>{Number(meal.protein_g)}g protein</span></div>
                  <p>{meal.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="finalCommunity" id="about">
        <div className="finalContent">
          <header className="finalSectionHeading" data-reveal>
            <span className="eyebrow">Real stories. Real results.</span>
            <h2>Loved by <span>Our Community</span></h2>
          </header>
          <div className="finalCommunityGrid">
            <article data-reveal><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=82" alt="Customer"/><div><p>“Nutri Packs has completely changed my relationship with food. The meals are delicious, fresh and keep me energized!”</p><strong>Aisha Al-Maadeed</strong><span>★★★★★</span></div></article>
            <article data-reveal><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=180&q=82" alt="Customer"/><div><p>“Amazing quality and variety. It’s made healthy eating so easy with my busy schedule.”</p><strong>Hassan Al-Kubaisi</strong><span>★★★★★</span></div></article>
            <article data-reveal><img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=180&q=82" alt="Customer"/><div><p>“I love the convenience and the taste. Finally a healthy meal plan that actually feels exciting.”</p><strong>Sara Al-Thani</strong><span>★★★★★</span></div></article>
          </div>
        </div>
      </section>

      <section className="finalContent finalBottomCta">
        <div className="finalCtaPanel" data-reveal>
          <div className="finalCtaPhoto"><img src={HERO_IMAGE} alt="Nutri Packs meal"/></div>
          <div className="finalCtaCopy"><span className="eyebrow lightEyebrow">Ready for a healthier, happier you?</span><h2>Let’s Get Started Today</h2><p>Join customers in Qatar and make real progress with Nutri Packs.</p><div className="heroActions"><a className="button buttonPrimary" href="#plans">Choose Your Plan →</a><a className="button buttonLight" href="/menu">View Our Menu</a></div></div>
          <div className="finalCtaBenefits"><span><LineIcon name="chef"/>Better Food</span><span><LineIcon name="gear"/>Brighter Days</span><span><LineIcon name="leaf"/>A Healthier You</span></div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
