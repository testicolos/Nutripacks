import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

const includes = ['1 breakfast every delivery day', '2 main meals every delivery day', '1 snack every delivery day', '6 delivery days per week', 'Meal selection 7 days ahead', 'Nutrition details on every item'];

export default function PerformancePlanPage() {
  return (
    <main className="siteShell">
      <SiteHeader />
      <section className="contentWidth planDetailHero">
        <div className="planDetailCopy">
          <span className="eyebrow">Performance plan</span>
          <h1>More protein. More progress. Less meal prep.</h1>
          <p className="lead">A high-protein monthly plan designed for active lifestyles, training days and people who want clear macros without living in the kitchen.</p>
          <div className="planPriceLine"><strong>QAR 2,700</strong><span>30-day package</span></div>
          <div className="heroActions"><a className="button buttonPrimary" href="/signup?plan=performance">Choose Performance</a><a className="button buttonSecondary" href="/menu">Browse eligible meals</a></div>
          <div className="trustLine"><span>✓ Clear macros</span><span>✓ Flexible meal choice</span><span>✓ Doha delivery</span></div>
        </div>
        <div className="planVisualCard">
          <img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=88" alt="Healthy high protein meal" />
          <div className="floatingNutrition"><span>Daily target</span><strong>1,800–2,300 kcal</strong><small>Approx. 150g protein target</small></div>
        </div>
      </section>
      <section className="contentWidth sectionBlock">
        <div className="sectionHeading"><div><span className="eyebrow">What is included</span><h2>Built around consistency.</h2></div><p>Package rules remain configurable from the Nutripacks admin backend, so the business can change quantities and eligibility without rebuilding the website.</p></div>
        <div className="twoColumnGrid">
          <div className="featureList">{includes.map((item) => <div className="featureListItem" key={item}><span className="checkIcon">✓</span><span>{item}</span></div>)}</div>
          <div className="nutritionPanel"><span className="eyebrow">Typical daily structure</span><div className="nutritionStat"><strong>4</strong><span>meals / snacks</span></div><div className="nutritionStat"><strong>150g</strong><span>protein target</span></div><div className="nutritionStat"><strong>6</strong><span>delivery days / week</span></div></div>
        </div>
      </section>
      <section className="sectionTint"><div className="contentWidth sectionBlock"><div className="sectionHeading"><div><span className="eyebrow">Sample day</span><h2>Know what is coming.</h2></div><a className="textButton" href="/menu">See the full menu →</a></div><div className="sampleDayGrid"><div className="sampleMeal"><span>Breakfast</span><strong>Protein Pancakes</strong><small>390 kcal • 32g protein</small></div><div className="sampleMeal"><span>Main 1</span><strong>Grilled Chicken Quinoa</strong><small>550 kcal • 45g protein</small></div><div className="sampleMeal"><span>Main 2</span><strong>Beef Teriyaki Bowl</strong><small>610 kcal • 44g protein</small></div><div className="sampleMeal"><span>Snack</span><strong>Greek Yogurt Crunch</strong><small>250 kcal • 20g protein</small></div></div></div></section>
      <section className="contentWidth sectionBlock"><div className="ctaBand"><div><span className="eyebrow lightEyebrow">Performance</span><h2>Start your 30-day plan for QAR 2,700.</h2></div><a className="button buttonLight" href="/signup?plan=performance">Create account</a></div></section>
      <SiteFooter />
    </main>
  );
}
