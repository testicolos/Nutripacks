import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';

const plans = [
  { name: 'Balance', price: '1,950', eyebrow: 'Everyday nutrition', description: 'Balanced meals with practical portions for a simple, consistent routine.', calories: '1,400–1,800 kcal', meals: '3 items / day', link: '/signup?plan=balance' },
  { name: 'Performance', price: '2,700', eyebrow: 'High protein', description: 'More protein and more meal volume for active lifestyles and training goals.', calories: '1,800–2,300 kcal', meals: '4 items / day', link: '/plans/performance', featured: true },
  { name: 'Lean', price: '2,250', eyebrow: 'Calorie conscious', description: 'Lean proteins, vegetables and controlled carbs for a lighter daily plan.', calories: '1,200–1,600 kcal', meals: '3 items / day', link: '/signup?plan=lean' }
];

const featuredMeals = [
  { name: 'Grilled Chicken Quinoa', type: 'Main meal', kcal: 550, protein: 45, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85' },
  { name: 'Protein Pancakes', type: 'Breakfast', kcal: 390, protein: 32, image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=85' },
  { name: 'Greek Yogurt Crunch', type: 'Snack', kcal: 250, protein: 20, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=85' }
];

export default function HomePage() {
  return (
    <main className="siteShell">
      <SiteHeader />
      <section className="heroSection" id="top">
        <div className="contentWidth heroGrid">
          <div className="heroCopy">
            <span className="eyebrow">Nutrition made practical</span>
            <h1>Eat better without making food your full-time job.</h1>
            <p className="lead">Choose your plan, pick meals that match your package, track calories and macros, and manage delivery from one clean Nutripacks account.</p>
            <div className="heroActions"><a className="button buttonPrimary" href="#plans">Explore meal plans</a><a className="button buttonSecondary" href="/menu">Browse the menu</a></div>
            <div className="trustLine"><span>✓ Fresh prepared meals</span><span>✓ Clear nutrition data</span><span>✓ Flexible selections</span></div>
          </div>
          <div className="heroVisual">
            <img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=90" alt="Fresh Nutripacks style meal" />
            <div className="heroFloat topFloat"><small>Performance plan</small><strong>150g</strong><span>protein target</span></div>
            <div className="heroFloat bottomFloat"><span className="dot" /><div><strong>Next delivery</strong><small>Tomorrow • Evening</small></div></div>
          </div>
        </div>
      </section>

      <section className="proofStrip"><div className="contentWidth proofGrid"><div><strong>3</strong><span>launch meal plans</span></div><div><strong>30</strong><span>days per package</span></div><div><strong>6</strong><span>delivery days / week</span></div><div><strong>100%</strong><span>visible macros</span></div></div></section>

      <section className="contentWidth sectionBlock" id="plans">
        <div className="sectionHeading"><div><span className="eyebrow">Meal plans</span><h2>Pick the structure that fits your goal.</h2></div><p>Every package controls which menu items a customer can select. Nutripacks staff will be able to change these rules from the admin backend without touching code.</p></div>
        <div className="planGrid">
          {plans.map((plan) => (
            <article className={plan.featured ? 'planCard featuredPlan' : 'planCard'} key={plan.name}>
              {plan.featured && <span className="popularBadge">Most popular</span>}
              <span className="eyebrow">{plan.eyebrow}</span><h3>{plan.name}</h3><p>{plan.description}</p>
              <div className="planPrice"><strong>QAR {plan.price}</strong><span>/ 30 days</span></div>
              <div className="planFacts"><span>{plan.meals}</span><span>{plan.calories}</span><span>6 days / week</span></div>
              <a className={plan.featured ? 'button buttonLight fullButton' : 'button buttonPrimary fullButton'} href={plan.link}>{plan.name === 'Performance' ? 'View Performance plan' : `Choose ${plan.name}`}</a>
            </article>
          ))}
        </div>
      </section>

      <section className="sectionTint" id="menu"><div className="contentWidth sectionBlock"><div className="sectionHeading"><div><span className="eyebrow">Inside the menu</span><h2>Food first. Numbers included.</h2></div><div><p>Each meal shows calories, protein, carbs, fats, dietary tags and allergens before you add it to your schedule.</p><a className="textButton" href="/menu">Explore all sample meals →</a></div></div><div className="featuredMealGrid">{featuredMeals.map((meal) => <article className="mealCard" key={meal.name}><div className="mealImageWrap"><img className="mealImage" src={meal.image} alt={meal.name} /><span className="mealType">{meal.type}</span></div><div className="mealBody"><div className="mealTitleRow"><h3>{meal.name}</h3><strong>{meal.kcal}<small> kcal</small></strong></div><div className="macroHighlight"><span>Protein</span><strong>{meal.protein}g</strong></div></div></article>)}</div></div></section>

      <section className="contentWidth sectionBlock" id="how">
        <div className="sectionHeading centeredHeading"><div><span className="eyebrow">How it works</span><h2>A simple routine from signup to delivery.</h2></div></div>
        <div className="stepsGrid"><article><span className="stepNumber">01</span><h3>Create your profile</h3><p>Add your contact details, goals, allergies and delivery address.</p></article><article><span className="stepNumber">02</span><h3>Choose your package</h3><p>Select Balance, Lean or Performance depending on your preferred structure.</p></article><article><span className="stepNumber">03</span><h3>Pick eligible meals</h3><p>Your menu automatically narrows to meals allowed inside your package.</p></article><article><span className="stepNumber">04</span><h3>Manage deliveries</h3><p>Edit upcoming meals, skip days, pause your plan and track your schedule.</p></article></div>
      </section>

      <section className="contentWidth sectionBlock">
        <div className="accountShowcase">
          <div className="accountShowcaseCopy"><span className="eyebrow lightEyebrow">Your Nutripacks account</span><h2>See the whole week before the first container arrives.</h2><p>Customers get a clean view of upcoming deliveries, selected meals, plan progress and quick actions.</p><a className="button buttonLight" href="/account">Preview customer account</a></div>
          <div className="miniCalendar"><div className="miniCalendarHeader"><span>September</span><strong>Delivery week</strong></div><div className="miniDays"><div><b>MON</b><strong>14</strong><span className="dayDot" /></div><div><b>TUE</b><strong>15</strong><span className="dayDot" /></div><div className="activeDay"><b>WED</b><strong>16</strong><span className="dayDot" /></div><div><b>THU</b><strong>17</strong><span className="dayDot" /></div><div><b>FRI</b><strong>18</strong><span className="dayDot" /></div></div><div className="miniOrder"><div><span>Tomorrow</span><strong>4 selected meals</strong></div><span className="softTag">Confirmed</span></div></div>
        </div>
      </section>

      <section className="contentWidth sectionBlock faqSection" id="faq"><div className="sectionHeading"><div><span className="eyebrow">FAQ</span><h2>The useful questions.</h2></div><p>No corporate poetry about “wellness journeys.” Just the things customers need to know before paying.</p></div><div className="faqGrid"><details open><summary>Can I choose my own meals?</summary><p>Yes. Each package unlocks a specific set of eligible menu items, and you choose from those meals for upcoming delivery days.</p></details><details><summary>Can I see calories and macros?</summary><p>Yes. Nutripacks displays calories, protein, carbohydrates and fats on menu items before selection.</p></details><details><summary>How will payment work?</summary><p>The production checkout will use secure card payment through QIIB. The website will not store raw card details.</p></details><details><summary>Can I pause or skip deliveries?</summary><p>The customer account is designed to support pause and skip controls, subject to the package cutoff rules configured by Nutripacks.</p></details></div></section>

      <section className="contentWidth sectionBlock"><div className="ctaBand"><div><span className="eyebrow lightEyebrow">Start simple</span><h2>Your next month of meals can be organized in a few minutes.</h2></div><a className="button buttonLight" href="/signup">Create your account</a></div></section>
      <SiteFooter />
    </main>
  );
}
