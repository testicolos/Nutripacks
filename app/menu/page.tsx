import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const meals = [
  { name: 'Avocado Egg Bowl', type: 'Breakfast', calories: 430, protein: 28, carbs: 42, fat: 18, tags: ['Vegetarian', 'High protein'], image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=85' },
  { name: 'Protein Pancakes', type: 'Breakfast', calories: 390, protein: 32, carbs: 40, fat: 12, tags: ['High protein', 'Low sugar'], image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=85' },
  { name: 'Turkey Breakfast Wrap', type: 'Breakfast', calories: 410, protein: 35, carbs: 32, fat: 16, tags: ['High protein'], image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=85' },
  { name: 'Grilled Chicken Quinoa', type: 'Main', calories: 550, protein: 45, carbs: 55, fat: 16, tags: ['Balanced', 'Performance'], image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85' },
  { name: 'Beef Teriyaki Bowl', type: 'Main', calories: 610, protein: 44, carbs: 70, fat: 17, tags: ['High protein'], image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85' },
  { name: 'Salmon Power Bowl', type: 'Main', calories: 590, protein: 39, carbs: 52, fat: 24, tags: ['Omega-3', 'Balanced'], image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=85' },
  { name: 'Greek Yogurt Crunch', type: 'Snack', calories: 250, protein: 20, carbs: 28, fat: 7, tags: ['Vegetarian', 'High protein'], image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=85' },
  { name: 'Fresh Fruit Cup', type: 'Snack', calories: 160, protein: 3, carbs: 38, fat: 1, tags: ['Vegan', 'Fresh'], image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=85' }
];

export default function MenuPage() {
  return (
    <main className="siteShell">
      <SiteHeader />
      <section className="pageHero compactHero">
        <div className="contentWidth">
          <span className="eyebrow">Explore the menu</span>
          <h1>Meals you will actually look forward to.</h1>
          <p className="lead">Browse sample Nutripacks meals with calories and macros. When the backend is connected, each customer will only see items allowed by their selected package.</p>
          <div className="filterRow" aria-label="Menu filters">
            <button className="filterPill active">All meals</button><button className="filterPill">Breakfast</button><button className="filterPill">Main meals</button><button className="filterPill">Snacks</button><button className="filterPill">High protein</button><button className="filterPill">Vegetarian</button>
          </div>
        </div>
      </section>
      <section className="contentWidth sectionBlock menuPageGrid">
        {meals.map((meal) => (
          <article className="mealCard" key={meal.name}>
            <div className="mealImageWrap"><img className="mealImage" src={meal.image} alt={meal.name} /><span className="mealType">{meal.type}</span></div>
            <div className="mealBody">
              <div className="mealTitleRow"><h3>{meal.name}</h3><strong>{meal.calories}<small> kcal</small></strong></div>
              <div className="macroRow"><span><b>{meal.protein}g</b> protein</span><span><b>{meal.carbs}g</b> carbs</span><span><b>{meal.fat}g</b> fat</span></div>
              <div className="tagRow">{meal.tags.map((tag) => <span className="softTag" key={tag}>{tag}</span>)}</div>
              <button className="textButton">View nutrition details →</button>
            </div>
          </article>
        ))}
      </section>
      <section className="contentWidth sectionBlock"><div className="ctaBand"><div><span className="eyebrow lightEyebrow">Ready to start?</span><h2>Choose a plan and unlock your eligible meals.</h2></div><a className="button buttonLight" href="/#plans">View meal plans</a></div></section>
      <SiteFooter />
    </main>
  );
}
