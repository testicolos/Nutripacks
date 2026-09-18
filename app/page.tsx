import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import { getPackageRule, getPublicCatalog } from '../lib/catalog';

export const dynamic = 'force-dynamic';

type IconName = 'leaf'|'chef'|'heart'|'truck'|'profile'|'box'|'bowl'|'hat'|'dumbbell'|'gear';

function LineIcon({ name }: { name: IconName }) {
  const common = { viewBox: '0 0 64 64', role: 'presentation' as const };
  if (name === 'leaf') return <svg {...common}><path d="M51 10C30 11 16 23 15 43c19 1 34-11 36-33Z"/><path d="M16 47c8-12 17-21 30-29"/></svg>;
  if (name === 'chef') return <svg {...common}><path d="M20 28c-7-1-11-6-11-12 0-7 5-12 12-12 5 0 9 3 11 7 2-5 7-8 13-8 8 0 14 6 14 14 0 6-4 10-10 12"/><path d="M18 27h31l-4 27H22l-4-27Z"/><path d="M27 43h13"/></svg>;
  if (name === 'heart') return <svg {...common}><path d="M32 53S9 41 9 22c0-8 6-14 14-14 5 0 9 3 12 8 3-5 7-8 12-8 8 0 14 6 14 14 0 19-29 31-29 31Z"/></svg>;
  if (name === 'truck') return <svg {...common}><path d="M7 17h31v27H7zM38 27h10l9 10v7H38z"/><circle cx="18" cy="48" r="6"/><circle cx="48" cy="48" r="6"/></svg>;
  if (name === 'profile') return <svg {...common}><rect x="9" y="13" width="46" height="38" rx="10"/><circle cx="24" cy="27" r="7"/><path d="M15 44c2-7 7-10 9-10s7 3 9 10M39 23h10M39 31h8M39 39h6"/><path className="accentPath" d="M46 49c5-1 8-5 9-9-5 0-9 2-12 6 0-4-2-8-6-10 0 6 3 11 9 13Z"/></svg>;
  if (name === 'box') return <svg {...common}><path d="m9 23 23-11 23 11-23 11L9 23Z"/><path d="M9 23v24l23 10 23-10V23M32 34v23"/><path className="accentPath" d="M23 20c2-5 6-8 11-9-1 5-5 9-10 11M43 20c-2-4-6-7-10-8 1 5 4 8 9 10"/></svg>;
  if (name === 'bowl') return <svg {...common}><path d="M8 31h48c-2 15-11 23-24 23S10 46 8 31Z"/><path d="M13 31c2-10 9-16 19-16s17 6 19 16"/><path d="M20 27c2-4 5-6 9-6M36 22c4 0 7 2 9 5"/><path className="accentPath" d="M31 18c0-5 3-9 8-11 0 5-3 9-8 11Zm-2 0c-5 0-9-3-11-8 5 0 9 3 11 8Z"/></svg>;
  if (name === 'dumbbell') return <svg {...common}><path d="M8 24v16M14 20v24M20 27h24M44 20v24M50 24v16M14 32h6M44 32h6"/></svg>;
  if (name === 'gear') return <svg {...common}><circle cx="32" cy="32" r="9"/><path d="M32 7v7M32 50v7M7 32h7M50 32h7M14 14l5 5M45 45l5 5M50 14l-5 5M19 45l-5 5"/></svg>;
  return <svg {...common}><path d="M17 28c-5-1-8-5-8-10 0-6 5-10 11-10 4 0 7 2 9 5 2-4 6-6 11-6 7 0 12 5 12 12 0 4-2 7-5 9"/><path d="M18 27h29l-3 24H21l-3-24Z"/><path d="M26 39h12"/><path className="accentPath" d="M30 29c1-4 4-7 8-8 0 4-3 8-8 9Zm-2 0c-4 0-7-2-9-6 4 0 8 2 10 6"/></svg>;
}

export default async function HomePage() {
  const catalog = await getPublicCatalog();
  const mains = catalog.menu.filter(meal => meal.category === 'main');
  const featuredMeals = (mains.length >= 4 ? mains : catalog.menu).slice(0, 4);
  const displayPlans = catalog.packages.slice(0, 4);
  const heroMeal = featuredMeals[0] || catalog.menu[0];
  const sideMeal = featuredMeals[1] || heroMeal;

  return (
    <main className="siteShell referenceHome">
      <SiteHeader />

      <section className="referenceHero" id="top">
        <span className="decorLeaf leafOne" />
        <span className="decorLeaf leafTwo" />
        <span className="decorLeaf leafThree" />
        <span className="decorTomato tomatoOne" />
        <span className="decorTomato tomatoTwo" />

        <div className="contentWidth referenceHeroGrid">
          <div className="referenceHeroCopy" data-reveal>
            <span className="eyebrow">Fresh meals. A brighter you.</span>
            <h1>Healthy Meals<br/><span>for a Better Tomorrow</span></h1>
            <p>Nutri Packs Qatar delivers chef-prepared, nutritious meals designed for your goals. Real ingredients. Clear nutrition. Real progress.</p>
            <div className="heroActions">
              <a className="button buttonPrimary" href="#plans">Choose Your Plan →</a>
              <a className="button buttonSecondary" href="/menu">Explore Our Menu</a>
            </div>
            <div className="referenceTrust">
              <span><LineIcon name="leaf"/> Fresh Ingredients</span>
              <span><LineIcon name="chef"/> Chef Prepared</span>
              <span><LineIcon name="heart"/> Clear Nutrition</span>
              <span><LineIcon name="truck"/> Delivered to Your Door</span>
            </div>
          </div>

          <div className="referenceHeroVisual" data-reveal>
            <div className="referenceScript">Good Food.<br/>Brighter Days ♡</div>
            <div className="referencePlate">
              <img src={heroMeal?.image_url || 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=90'} alt={heroMeal?.name || 'Nutri Packs healthy meal'} />
            </div>
            <div className="referenceSeal">Real<br/>Food<br/><strong>Real Progress</strong></div>
            <div className="referenceSideDish"><img src={sideMeal?.image_url || heroMeal?.image_url || ''} alt="" /></div>
            <span className="decorLeaf heroLeafA" />
            <span className="decorLeaf heroLeafB" />
          </div>
        </div>
      </section>

      <section className="referenceBenefits">
        <div className="contentWidth referenceBenefitGrid">
          <article><span><LineIcon name="leaf"/></span><div><strong>Nutritious Ingredients</strong><small>Wholesome. Local. Trusted.</small></div></article>
          <article><span><LineIcon name="chef"/></span><div><strong>Chef-Prepared Meals</strong><small>Restaurant-quality taste.</small></div></article>
          <article><span><LineIcon name="heart"/></span><div><strong>Flexible Packages</strong><small>Plans for every lifestyle.</small></div></article>
          <article><span><LineIcon name="truck"/></span><div><strong>Convenient Delivery</strong><small>Fresh to your door, on time.</small></div></article>
        </div>
      </section>

      <section className="referenceHow" id="how">
        <span className="decorLeaf howLeafOne" />
        <span className="decorLeaf howLeafTwo" />
        <div className="contentWidth">
          <header className="referenceSectionHeading" data-reveal>
            <span className="eyebrow">Simple steps. Real results.</span>
            <h2>How <span>Nutri Packs</span> Works</h2>
            <p>From signup to serving — a healthier, happier you.</p>
          </header>

          <div className="referenceStepGrid">
            <article data-reveal>
              <div className="referenceStepMedia iconMedia"><LineIcon name="profile"/></div>
              <h3>Create your profile</h3>
              <p>Add delivery details, goals and allergies.</p>
            </article>
            <article data-reveal>
              <div className="referenceStepMedia photoMedia">
                <img src={displayPlans[0]?.image_url || heroMeal?.image_url || ''} alt="Nutri Packs meal package" />
              </div>
              <h3>Choose a live package</h3>
              <p>Pick a configured meals/day and days/week version with its own price.</p>
            </article>
            <article data-reveal>
              <div className="referenceStepMedia photoMedia roundMeal">
                <img src={featuredMeals[2]?.image_url || heroMeal?.image_url || ''} alt="Nutri Packs meal selection" />
              </div>
              <h3>Select your meals</h3>
              <p>Only items assigned to your package and active cycle week are shown.</p>
            </article>
            <article data-reveal>
              <div className="referenceStepMedia iconMedia chefMedia"><LineIcon name="hat"/></div>
              <h3>Kitchen sees the schedule</h3>
              <p>Chef and sales views update from customer selections.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="referencePlans" id="plans">
        <span className="decorLeaf planLeafOne" />
        <div className="contentWidth">
          <header className="referenceSectionHeading" data-reveal>
            <span className="eyebrow">Meal plans for every goal</span>
            <h2>Choose <span>Your Plan</span></h2>
            <p>Flexible. Nutritious. Made for your lifestyle.</p>
          </header>

          <div className="referencePlanGrid">
            {displayPlans.map((plan, index) => {
              const rule = getPackageRule(catalog, plan.id);
              const options = (catalog.options || []).filter(option => option.package_id === plan.id && option.active !== false);
              const price = Number(options[0]?.price_qar ?? plan.price_qar);
              const dayText = options.length
                ? Math.min(...options.map(option => option.days_per_week)) + '–' + Math.max(...options.map(option => option.days_per_week)) + ' days/week'
                : (rule?.days_per_week || 6) + ' days/week';
              const icon: IconName = index === 0 ? 'leaf' : index === 1 ? 'bowl' : index === 2 ? 'dumbbell' : 'gear';
              return (
                <article className={plan.featured ? 'referencePlanCard popularPlan' : 'referencePlanCard'} key={plan.id} data-reveal>
                  {plan.featured && <span className="referencePopular">Most Popular</span>}
                  <span className="referencePlanIcon"><LineIcon name={icon}/></span>
                  <h3>{plan.name}</h3>
                  <p>{plan.tagline || plan.description}</p>
                  <div className="referencePlanPrice">
                    <small>QAR</small>
                    <strong>{price.toLocaleString()}</strong>
                    <span>/ plan</span>
                  </div>
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

          {catalog.packages.length > 4 && <p className="referencePlanFootnote">More plan variations are available in the live catalog and selection flow.</p>}
        </div>
      </section>

      <section className="referenceMeals" id="menu">
        <div className="contentWidth">
          <header className="referenceSectionHeading mealHeading" data-reveal>
            <span className="eyebrow">Our signature meals</span>
            <h2>Fresh. Delicious. <span>Nutritious.</span></h2>
            <div className="referenceHomeFilters" aria-hidden="true">
              <span className="active">All Meals</span>
              <span>High Protein</span>
              <span>Low Carb</span>
              <span>Vegetarian</span>
              <span>Under 500 kcal</span>
            </div>
            <a className="referenceViewMenu" href="/menu">View Full Menu →</a>
          </header>

          <div className="referenceMealGrid">
            {featuredMeals.map(meal => (
              <article className="referenceMealCard" key={meal.id} data-reveal>
                <div className="referenceMealImage">
                  <img src={meal.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=86'} alt={meal.name}/>
                </div>
                <div className="referenceMealBody">
                  <div className="referenceMealTitle">
                    <h3>{meal.name}</h3>
                    <span>♡</span>
                  </div>
                  <div className="referenceMealMacros">
                    <span>{meal.calories} kcal</span>
                    <span>{Number(meal.protein_g)}g protein</span>
                  </div>
                  <p>{meal.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="referenceCommunity" id="about">
        <div className="contentWidth">
          <header className="referenceSectionHeading" data-reveal>
            <span className="eyebrow">Real routines. Real results.</span>
            <h2>Built for <span>Your Everyday Life</span></h2>
          </header>

          <div className="referenceCommunityGrid">
            <article data-reveal>
              <div className="referenceAvatar">F</div>
              <div><strong>Fresh choices</strong><p>Food-first meals with visible calories and macros, so the menu stays practical and easy to understand.</p><span>★★★★★</span></div>
            </article>
            <article data-reveal>
              <div className="referenceAvatar">F</div>
              <div><strong>Flexible plans</strong><p>Choose the package, delivery pattern and meal schedule that match the options configured in the live catalog.</p><span>★★★★★</span></div>
            </article>
            <article data-reveal>
              <div className="referenceAvatar">C</div>
              <div><strong>Connected workflow</strong><p>Customer selections flow through to the schedule used by sales, admin and kitchen operations.</p><span>★★★★★</span></div>
            </article>
          </div>
        </div>
      </section>

      <section className="contentWidth referenceBottomCta">
        <div className="referenceCtaPanel" data-reveal>
          <div className="referenceCtaPhoto">
            <img src={heroMeal?.image_url || ''} alt={heroMeal?.name || 'Nutri Packs meal'} />
          </div>
          <div className="referenceCtaCopy">
            <span className="eyebrow lightEyebrow">Ready for a healthier, happier you?</span>
            <h2>Let’s Get Started Today</h2>
            <p>Choose a live plan, build your meal schedule and let Nutri Packs take care of the rest.</p>
            <div className="heroActions">
              <a className="button buttonPrimary" href="#plans">Choose Your Plan →</a>
              <a className="button buttonLight" href="/menu">View Our Menu</a>
            </div>
          </div>
          <div className="referenceCtaBenefits">
            <span><LineIcon name="chef"/>Better Food</span>
            <span><LineIcon name="gear"/>Brighter Days</span>
            <span><LineIcon name="leaf"/>A Healthier You</span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
