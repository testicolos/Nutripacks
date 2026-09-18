import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import MenuBrowser from '../components/MenuBrowser';
import { getPublicCatalog } from '../../lib/catalog';

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  const catalog = await getPublicCatalog();

  return (
    <main className="siteShell referenceSubpage">
      <SiteHeader />

      <section className="pageHero compactHero referenceMenuHero">
        <div className="contentWidth">
          <span className="eyebrow">Our signature meals</span>
          <h1>Fresh. Delicious. <span>Nutritious.</span></h1>
          <p className="lead">Browse the active Nutri Packs menu directly from the backend. Nutrition values, meal types and gym-menu availability stay connected to the live catalog.</p>
          <div className="menuCatalogStatus">
            <strong>{catalog.menu.length}</strong>
            <span>active menu items loaded from the live catalog</span>
          </div>
        </div>
      </section>

      <MenuBrowser meals={catalog.menu} />

      <section className="contentWidth sectionBlock">
        <div className="ctaBand referenceCtaBand">
          <div>
            <span className="eyebrow lightEyebrow">Ready to build your schedule?</span>
            <h2>Choose a plan and see the meals available for your package.</h2>
          </div>
          <a className="button buttonLight" href="/#plans">View meal plans</a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
