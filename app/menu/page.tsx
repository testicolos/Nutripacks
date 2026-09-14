import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { getPublicCatalog } from '../../lib/catalog';

export const dynamic='force-dynamic';

export default async function MenuPage(){
  const catalog=await getPublicCatalog();
  return <main className="siteShell"><SiteHeader/>
    <section className="pageHero compactHero"><div className="contentWidth"><span className="eyebrow">Live Nutripacks menu</span><h1>Meals customers can actually select.</h1><p className="lead">Every item below is loaded from the backend. Package eligibility is applied when a customer builds their delivery week.</p><div className="filterRow"><span className="filterPill active">{catalog.menu.length} active items</span><span className="filterPill">Breakfast {catalog.menu.filter(m=>m.category==='breakfast').length}</span><span className="filterPill">Main {catalog.menu.filter(m=>m.category==='main').length}</span><span className="filterPill">Snacks {catalog.menu.filter(m=>m.category==='snack').length}</span></div></div></section>
    <section className="contentWidth sectionBlock menuPageGrid">{catalog.menu.map(meal=><article className="mealCard" key={meal.id}><div className="mealImageWrap"><img className="mealImage" src={meal.image_url||'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85'} alt={meal.name}/><span className="mealType">{meal.category}</span></div><div className="mealBody"><div className="mealTitleRow"><h3>{meal.name}</h3><strong>{meal.calories}<small> kcal</small></strong></div>{meal.description&&<p className="mealDescription">{meal.description}</p>}<div className="macroRow"><span><b>{Number(meal.protein_g)}g</b> protein</span><span><b>{Number(meal.carbs_g)}g</b> carbs</span><span><b>{Number(meal.fat_g)}g</b> fat</span></div><div className="tagRow">{(meal.tags||[]).map(tag=><span className="softTag" key={tag}>{tag}</span>)}</div>{(meal.allergens||[]).length>0&&<small className="allergenLine">Allergens: {meal.allergens.join(', ')}</small>}</div></article>)}</section>
    <section className="contentWidth sectionBlock"><div className="ctaBand"><div><span className="eyebrow lightEyebrow">Package rules</span><h2>Choose a plan to see exactly what you are allowed to select.</h2></div><a className="button buttonLight" href="/#plans">View meal plans</a></div></section><SiteFooter/>
  </main>;
}
