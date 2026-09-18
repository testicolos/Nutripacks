import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import { getPackageRule, getPublicCatalog } from '../lib/catalog';

export const dynamic = 'force-dynamic';

type ProcessKind = 'profile' | 'package' | 'meal' | 'kitchen';

function ProcessIcon({ kind }: { kind: ProcessKind }) {
  if (kind === 'profile') {
    return (
      <svg viewBox="0 0 64 64" role="presentation">
        <rect x="9" y="13" width="46" height="38" rx="10" />
        <circle cx="25" cy="28" r="7" />
        <path d="M16 44c2-7 7-10 9-10s7 3 9 10M39 24h10M39 32h8M39 40h6" />
        <path className="iconAccent" d="M47 47c4-1 7-4 8-8-4 0-8 2-10 5 0-4-2-7-5-9-1 5 1 10 7 12Z" />
      </svg>
    );
  }
  if (kind === 'package') {
    return (
      <svg viewBox="0 0 64 64" role="presentation">
        <path d="m10 23 22-10 22 10-22 10-22-10Z" />
        <path d="M10 23v23l22 10 22-10V23M32 33v23" />
        <path className="iconAccent" d="M22 20c2-5 6-7 10-8-1 5-4 8-9 10M42 19c-2-4-5-6-9-7 1 5 4 8 8 9" />
      </svg>
    );
  }
  if (kind === 'meal') {
    return (
      <svg viewBox="0 0 64 64" role="presentation">
        <path d="M8 31h48c-2 14-10 22-24 22S10 45 8 31Z" />
        <path d="M13 31c2-9 8-15 19-15s17 6 19 15" />
        <path d="M20 27c2-4 5-6 9-6M36 22c3 0 6 2 8 5" />
        <path className="iconAccent" d="M31 18c0-5 3-9 8-11 0 5-3 9-8 11Zm-2 0c-5 0-9-3-11-8 5 0 9 3 11 8Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" role="presentation">
      <path d="M17 28c-5-1-8-5-8-10 0-6 5-10 11-10 4 0 7 2 9 5 2-4 6-6 11-6 7 0 12 5 12 12 0 4-2 7-5 9" />
      <path d="M18 27h29l-3 24H21l-3-24Z" />
      <path d="M26 39h12" />
      <path className="iconAccent" d="M30 29c1-4 4-7 8-8 0 4-3 8-8 9Zm-2 0c-4 0-7-2-9-6 4 0 8 2 10 6" />
    </svg>
  );
}

function BenefitIcon({ kind }: { kind: ProcessKind }) {
  return (
    <span className="benefitIcon" aria-hidden="true">
      <ProcessIcon kind={kind} />
    </span>
  );
}

export default async function HomePage() {
  const catalog = await getPublicCatalog();
  const featuredMeals = catalog.menu.slice(0, 4);

  return (
    <main className="siteShell">
      <SiteHeader />

      <section className="heroSection" id="top">
        <div className="contentWidth heroGrid">
          <div className="heroCopy" data-reveal>
            <span className="eyebrow">Fresh meals. A brighter you.</span>
            <h1>Healthy meals for a <span className="heroAccent">better tomorrow.</span></h1>
            <p className="lead">Chef-prepared meal plans with clear nutrition, flexible package rules and a simple monthly delivery schedule.</p>
            <div className="heroActions">
              <a className="button buttonPrimary" href="#plans">Choose your plan</a>
              <a className="button buttonSecondary" href="/menu">Explore the menu</a>
            </div>
            <div className="trustLine">
              <span>Fresh prepared meals</span>
              <span>Visible nutrition</span>
              <span>Doha delivery scheduling</span>
            </div>
          </div>

          <div className="heroVisual" data-reveal>
            <img
              src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=92"
              alt="Fresh healthy meal"
            />
            <div className="heroStamp">real food<br />real progress</div>
            <div className="heroFloat topFloat">
              <small>Live plans</small>
              <strong>{catalog.packages.length}</strong>
              <span>ready to customize</span>
            </div>
            <div className="heroFloat bottomFloat">
              <span className="dot" />
              <div>
                <strong>{catalog.menu.length} live menu items</strong>
                <small>with nutrition visible</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="proofStrip">
        <div className="contentWidth proofGrid">
          <div><BenefitIcon kind="meal" /><span><strong>Freshly prepared</strong><small>Food-first meal choices</small></span></div>
          <div><BenefitIcon kind="kitchen" /><span><strong>Kitchen connected</strong><small>Selections feed production</small></span></div>
          <div><BenefitIcon kind="package" /><span><strong>Flexible packages</strong><small>Configured by plan</small></span></div>
          <div><BenefitIcon kind="profile" /><span><strong>One simple account</strong><small>Profile, meals and delivery</small></span></div>
        </div>
      </section>

      <section className="contentWidth sectionBlock" id="plans">
        <div className="sectionHeading">
          <div><span className="eyebrow">Meal plans for every goal</span><h2>Choose your <span>plan.</span></h2></div>
          <p>Every package below comes from the live Nutripacks catalog, so pricing, options and eligibility stay connected to the backend.</p>
        </div>
        <div className="planGrid">
          {catalog.packages.map(plan => {
            const rule = getPackageRule(catalog, plan.id);
            const options = (catalog.options || []).filter(o => o.package_id === plan.id && o.active !== false);
            return (
              <article className={plan.featured ? 'planCard featuredPlan' : 'planCard'} key={plan.id} data-reveal>
                {plan.featured && <span className="popularBadge">Most popular</span>}
                <img
                  className="planCardImage"
                  src={plan.image_url || 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=84'}
                  alt={plan.name}
                />
                <span className="eyebrow">{plan.plan_type === 'gym' ? 'Gym menu' : plan.plan_variant === 'business_lunch' ? 'Business lunch' : plan.tagline || 'Meal plan'}</span>
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
                <div className="planPrice"><strong>From QAR {Number(options[0]?.price_qar ?? plan.price_qar).toLocaleString()}</strong><span>/ configured version</span></div>
                <div className="planFacts">
                  <span>{options.length || 1} meal/day versions</span>
                  <span>{options.length ? `${Math.min(...options.map(o => o.days_per_week))}–${Math.max(...options.map(o => o.days_per_week))} days/week` : `${plan.meals_per_day} items / day`}</span>
                  <span>{rule?.delivery_day_count || plan.duration_days} delivery days base</span>
                </div>
                <a className="button buttonPrimary fullButton" href={`/select?plan=${encodeURIComponent(plan.slug)}`}>Customize {plan.name}</a>
              </article>
            );
          })}
        </div>
      </section>

      <section className="sectionTint" id="menu">
        <div className="contentWidth sectionBlock">
          <div className="sectionHeading">
            <div><span className="eyebrow">Our signature meals</span><h2>Fresh. Delicious. <span>Transparent.</span></h2></div>
            <div><p>Calories, protein, carbs, fats, tags and allergens come directly from the backend.</p><a className="textButton" href="/menu">View the full menu →</a></div>
          </div>
          <div className="featuredMealGrid">
            {featuredMeals.map(meal => (
              <article className="mealCard" key={meal.id} data-reveal>
                <div className="mealImageWrap">
                  <img className="mealImage" src={meal.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=86'} alt={meal.name} />
                  <span className="mealType">{meal.category}</span>
                </div>
                <div className="mealBody">
                  <div className="mealTitleRow"><h3>{meal.name}</h3><strong>{meal.calories}<small> kcal</small></strong></div>
                  <div className="macroHighlight"><span>Protein</span><strong>{Number(meal.protein_g)}g</strong></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contentWidth sectionBlock processSection" id="how">
        <div className="sectionHeading centeredHeading">
          <div><span className="eyebrow">Simple steps. Real results.</span><h2>How Nutripacks <span>works.</span></h2><p className="sectionKicker">From signup to serving, your plan stays connected.</p></div>
        </div>
        <div className="stepsGrid">
          <article data-reveal><div className="stepVisual mintVisual"><ProcessIcon kind="profile" /></div><h3>Create your profile</h3><p>Add delivery details, goals and allergies.</p></article>
          <article data-reveal><div className="stepVisual blushVisual"><ProcessIcon kind="package" /></div><h3>Choose a live package</h3><p>Pick a configured meals/day and days/week version with its own price.</p></article>
          <article data-reveal><div className="stepVisual mintVisual"><ProcessIcon kind="meal" /></div><h3>Select your meals</h3><p>Only items assigned to your package and active cycle week are shown.</p></article>
          <article data-reveal><div className="stepVisual blushVisual"><ProcessIcon kind="kitchen" /></div><h3>Kitchen sees the schedule</h3><p>Chef and sales views update from customer selections.</p></article>
        </div>
      </section>

      <section className="contentWidth sectionBlock" id="faq">
        <div className="sectionHeading">
          <div><span className="eyebrow">Good to know</span><h2>Simple answers before you <span>start.</span></h2></div>
          <p>This environment is still being validated before production payment goes live.</p>
        </div>
        <div className="faqGrid">
          <details open><summary>Do I need to pay in this environment?</summary><p>No. Orders activate immediately after the customer saves a complete monthly meal schedule.</p></details>
          <details><summary>Can admins edit packages and menu items?</summary><p>Yes. Packages, menu items and weekly eligibility rules are managed from the admin catalog.</p></details>
          <details><summary>Can customers change selections?</summary><p>No. Once a monthly meal schedule is confirmed, customer selections are locked.</p></details>
          <details><summary>Do Chef and Sales see the same data?</summary><p>Chef sees production quantities without customer contact information. Sales and Admin can see customer and delivery details.</p></details>
        </div>
      </section>

      <section className="contentWidth sectionBlock">
        <div className="ctaBand" data-reveal>
          <div><span className="eyebrow lightEyebrow">Ready for a healthier routine?</span><h2>Build your first monthly delivery schedule.</h2><p>Choose a plan, pick your meals and let the kitchen take it from there.</p></div>
          <div className="ctaActions"><a className="button buttonAccent" href="/signup">Create your account</a><a className="button buttonLight" href="/menu">View menu</a></div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
