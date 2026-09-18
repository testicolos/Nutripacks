import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import { getPackageRule, getPublicCatalog } from '../lib/catalog';

export const dynamic = 'force-dynamic';

function LineIcon({ name }: { name: 'leaf'|'chef'|'heart'|'truck'|'profile'|'box'|'bowl'|'hat' }) {
  const common = { viewBox: '0 0 64 64', role: 'presentation' as const };
  if (name === 'leaf') return <svg {...common}><path d="M51 10C30 11 16 23 15 43c19 1 34-11 36-33Z"/><path d="M16 47c8-12 17-21 30-29"/></svg>;
  if (name === 'chef') return <svg {...common}><path d="M20 28c-7-1-11-6-11-12 0-7 5-12 12-12 5 0 9 3 11 7 2-5 7-8 13-8 8 0 14 6 14 14 0 6-4 10-10 12"/><path d="M18 27h31l-4 27H22l-4-27Z"/><path d="M27 43h13"/></svg>;
  if (name === 'heart') return <svg {...common}><path d="M32 53S9 41 9 22c0-8 6-14 14-14 5 0 9 3 12 8 3-5 7-8 12-8 8 0 14 6 14 14 0 19-29 31-29 31Z"/></svg>;
  if (name === 'truck') return <svg {...common}><path d="M7 17h31v27H7zM38 27h10l9 10v7H38z"/><circle cx="18" cy="48" r="6"/><circle cx="48" cy="48" r="6"/></svg>;
  if (name === 'profile') return <svg {...common}><rect x="9" y="13" width="46" height="38" rx="10"/><circle cx="24" cy="27" r="7"/><path d="M15 44c2-7 7-10 9-10s7 3 9 10M39 23h10M39 31h8M39 39h6"/><path className="accentPath" d="M46 49c5-1 8-5 9-9-5 0-9 2-12 6 0-4-2-8-6-10 0 6 3 11 9 13Z"/></svg>;
  if (name === 'box') return <svg {...common}><path d="m9 23 23-11 23 11-23 11L9 23Z"/><path d="M9 23v24l23 10 23-10V23M32 34v23"/><path className="accentPath" d="M23 20c2-5 6-8 11-9-1 5-5 9-10 11M43 20c-2-4-6-7-10-8 1 5 4 8 9 10"/></svg>;
  if (name === 'bowl') return <svg {...common}><path d="M8 31h48c-2 15-11 23-24 23S10 46 8 31Z"/><path d="M13 31c2-10 9-16 19-16s17 6 19 16"/><path d="M20 27c2-4 5-6 9-6M36 22c4 0 7 2 9 5"/><path className="accentPath" d="M31 18c0-5 3-9 8-11 0 5-3 9-8 11Zm-2 0c-5 0-9-3-11-8 5 0 9 3 11 8Z"/></svg>;
  return <svg {...common}><path d="M17 28c-5-1-8-5-8-10 0-6 5-10 11-10 4 0 7 2 9 5 2-4 6-6 11-6 7 0 12 5 12 12 0 4-2 7-5 9"/><path d="M18 27h29l-3 24H21l-3-24Z"/><path d="M26 39h12"/><path className="accentPath" d="M30 29c1-4 4-7 8-8 0 4-3 8-8 9Zm-2 0c-4 0-7-2-9-6 4 0 8 2 10 6"/></svg>;
}

export default async function HomePage() {
  const catalog = await getPublicCatalog();
  const featuredMeals = catalog.menu.filter(m => m.category === 'main').slice(0, 4);
  const allPlans = catalog.packages;
  const primaryPlan = allPlans.find(p => p.featured) || allPlans[0];

  return (
    <main className="siteShell npHome">
      <SiteHeader />

      <section className="npHero" id="top">
        <span className="npLeaf leafA" /><span className="npLeaf leafB" /><span className="npTomato tomatoA" />
        <div className="contentWidth npHeroGrid">
          <div className="npHeroCopy" data-reveal>
            <span className="eyebrow">Fresh meals. A brighter you.</span>
            <h1>Healthy Meals<br/><em>for a Better Tomorrow</em></h1>
            <p>Nutri Packs Qatar delivers chef-prepared, nutritious meals designed around your goals. Real ingredients. Clear nutrition. Less food admin.</p>
            <div className="heroActions">
              <a className="button buttonPrimary" href="#plans">Choose Your Plan <span>→</span></a>
              <a className="button buttonSecondary" href="/menu">Explore Our Menu</a>
            </div>
            <div className="npTrustRow">
              <span><LineIcon name="leaf"/>Fresh ingredients</span>
              <span><LineIcon name="chef"/>Chef prepared</span>
              <span><LineIcon name="heart"/>Clear nutrition</span>
              <span><LineIcon name="truck"/>Delivery planning</span>
            </div>
          </div>

          <div className="npHeroArt" data-reveal>
            <div className="npPlateRing">
              <img src={featuredMeals[0]?.image_url || primaryPlan?.image_url || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=92'} alt="Nutritious prepared meal" />
            </div>
            <div className="npHeroBadge">Real<br/>Food<br/><b>Real Progress</b></div>
            <div className="npNote noteHero">Good Food.<br/>Brighter Days ♡</div>
            <span className="npLeaf leafC" /><span className="npLeaf leafD" />
          </div>
        </div>
      </section>

      <section className="npBenefits">
        <div className="contentWidth npBenefitGrid">
          <article><span><LineIcon name="leaf"/></span><div><strong>Nutritious Ingredients</strong><small>Wholesome. Fresh. Carefully selected.</small></div></article>
          <article><span><LineIcon name="chef"/></span><div><strong>Chef-Prepared Meals</strong><small>Built for taste as well as nutrition.</small></div></article>
          <article><span><LineIcon name="heart"/></span><div><strong>Flexible Packages</strong><small>Different goals, meals and delivery days.</small></div></article>
          <article><span><LineIcon name="truck"/></span><div><strong>Convenient Delivery</strong><small>Your schedule stays connected to the kitchen.</small></div></article>
        </div>
      </section>

      <section className="npHow" id="how">
        <span className="npLeaf leafE" />
        <div className="contentWidth">
          <header className="npCenteredHeading" data-reveal>
            <span className="eyebrow">Simple steps. Real results.</span>
            <h2>How <em>Nutri Packs</em> Works</h2>
            <p>From signup to serving — a healthier, easier routine.</p>
          </header>
          <div className="npStepGrid">
            <article data-reveal><div className="npStepMedia illustration"><LineIcon name="profile"/></div><h3>Create your profile</h3><p>Add delivery details, goals and allergies.</p></article>
            <article data-reveal><div className="npStepMedia photo"><img src={primaryPlan?.image_url || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=86'} alt="Nutri Packs meal package"/></div><h3>Choose a live package</h3><p>Pick a configured meals/day and days/week version with its own price.</p></article>
            <article data-reveal><div className="npStepMedia photo"><img src={featuredMeals[1]?.image_url || featuredMeals[0]?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=86'} alt="Healthy meal selection"/></div><h3>Select your meals</h3><p>See only the meals available for your package and active cycle.</p></article>
            <article data-reveal><div className="npStepMedia illustration chefVisual"><LineIcon name="hat"/></div><h3>Kitchen sees the schedule</h3><p>Chef and sales views update from customer selections.</p></article>
          </div>
        </div>
      </section>

      <section className="npPlans" id="plans">
        <div className="contentWidth">
          <header className="npCenteredHeading" data-reveal>
            <span className="eyebrow">Meal plans for every goal</span>
            <h2>Choose <em>Your Plan</em></h2>
            <p>Flexible, nutritious and connected to the live catalog.</p>
          </header>
          <div className="npPlanRail" aria-label="Available Nutri Packs plans">
            {allPlans.map(plan => {
              const rule = getPackageRule(catalog, plan.id);
              const options = (catalog.options || []).filter(o => o.package_id === plan.id && o.active !== false);
              const price = Number(options[0]?.price_qar ?? plan.price_qar);
              const dayText = options.length ? Math.min(...options.map(o=>o.days_per_week)) + '–' + Math.max(...options.map(o=>o.days_per_week)) + ' days/week' : (rule?.days_per_week || 6) + ' days/week';
              return (
                <article className={plan.featured ? 'npPlanCard isPopular' : 'npPlanCard'} key={plan.id} data-reveal>
                  {plan.featured && <span className="npPopular">Most Popular</span>}
                  <span className="npPlanIcon"><LineIcon name={plan.plan_type === 'gym' ? 'heart' : 'leaf'}/></span>
                  <h3>{plan.name}</h3>
                  <p>{plan.tagline || plan.description}</p>
                  <div className="npPrice"><small>From</small><strong>QAR {price.toLocaleString()}</strong><span>/ plan</span></div>
                  <ul>
                    <li>{plan.meals_per_day} items per delivery day</li>
                    <li>{dayText}</li>
                    <li>{rule?.delivery_day_count || plan.duration_days} delivery days base</li>
                  </ul>
                  <a className={plan.featured ? 'button buttonPrimary fullButton' : 'button buttonSecondary fullButton'} href={'/select?plan=' + encodeURIComponent(plan.slug)}>Get Started <span>→</span></a>
                </article>
              );
            })}
          </div>
          <p className="npRailHint">Swipe or scroll to explore all {allPlans.length} live packages.</p>
        </div>
      </section>

      <section className="npMeals" id="menu">
        <span className="npLeaf leafF" />
        <div className="contentWidth">
          <header className="npSectionSplit" data-reveal>
            <div><span className="eyebrow">Our signature meals</span><h2>Fresh. Delicious. <em>Nutritious.</em></h2></div>
            <a className="textButton" href="/menu">View Full Menu →</a>
          </header>
          <div className="npMealGrid">
            {featuredMeals.map(meal => (
              <article className="npMealCard" key={meal.id} data-reveal>
                <div className="npMealPhoto"><img src={meal.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=86'} alt={meal.name}/><span>{meal.category}</span></div>
                <div className="npMealInfo">
                  <h3>{meal.name}</h3>
                  <div><span>{meal.calories} kcal</span><span>{Number(meal.protein_g)}g protein</span></div>
                  <p>{meal.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="npAbout" id="about">
        <div className="contentWidth npAboutGrid">
          <div className="npAboutPhoto" data-reveal>
            <img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=90" alt="Fresh ingredients and prepared meal"/>
            <span className="npNote">Real Food.<br/>Real People ♡</span>
          </div>
          <div className="npAboutCopy" data-reveal>
            <span className="eyebrow">Built around real routines</span>
            <h2>Healthy food should feel <em>easy to live with.</em></h2>
            <p>Nutri Packs connects your package, meal choices, delivery information and kitchen schedule in one flow. The goal is simple: make nutritious eating easier without making it boring.</p>
            <div className="npAboutStats">
              <div><strong>{catalog.packages.length}</strong><span>live packages</span></div>
              <div><strong>{catalog.menu.length}</strong><span>menu choices</span></div>
              <div><strong>100%</strong><span>visible nutrition</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="npCommunity">
        <div className="contentWidth">
          <header className="npCenteredHeading" data-reveal>
            <span className="eyebrow">Designed for everyday life</span>
            <h2>Better food. <em>Less friction.</em></h2>
          </header>
          <div className="npQuoteGrid">
            <article data-reveal><span>Fresh</span><p>Meals stay food-first, colorful and satisfying — with nutrition data there when you need it.</p></article>
            <article data-reveal><span>Flexible</span><p>Package options, meal eligibility and delivery days are controlled from the live system rather than static pages.</p></article>
            <article data-reveal><span>Connected</span><p>What the customer selects flows through to the schedule used by sales, admin and kitchen operations.</p></article>
          </div>
        </div>
      </section>

      <section className="contentWidth npBottomCta">
        <div className="npCtaPanel" data-reveal>
          <div className="npCtaMeal"><img src={featuredMeals[2]?.image_url || featuredMeals[0]?.image_url || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=90'} alt="Nutri Packs meal"/></div>
          <div>
            <span className="eyebrow">Ready for a healthier, happier routine?</span>
            <h2>Let’s Get Started Today</h2>
            <p>Choose a live plan, build your meal schedule and let Nutri Packs take care of the rest.</p>
            <div className="heroActions"><a className="button buttonPrimary" href="#plans">Choose Your Plan →</a><a className="button buttonLight" href="/menu">View Our Menu</a></div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
