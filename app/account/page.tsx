import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const deliveries = [
  { date: 'Mon 14', meals: '4 meals', status: 'Confirmed' },
  { date: 'Tue 15', meals: '4 meals', status: 'Confirmed' },
  { date: 'Wed 16', meals: '4 meals', status: 'Selection open' },
  { date: 'Thu 17', meals: '4 meals', status: 'Selection open' },
  { date: 'Fri 18', meals: '4 meals', status: 'Selection open' },
  { date: 'Sat 19', meals: '4 meals', status: 'Planned' }
];

export default function AccountPreviewPage() {
  return (
    <main className="siteShell">
      <SiteHeader />
      <section className="contentWidth accountHero">
        <div><span className="eyebrow">Customer account preview</span><h1>Your meals, deliveries and plan in one place.</h1><p className="lead">This screen shows the customer experience we will connect to real order and delivery data in the next backend-wiring step.</p></div>
        <div className="accountPlanCard"><span>Active package</span><strong>Performance</strong><small>30-day plan • QAR 2,700</small><div className="progressTrack"><span style={{ width: '42%' }} /></div><small>13 of 30 days completed</small></div>
      </section>
      <section className="contentWidth sectionBlock">
        <div className="dashboardGrid">
          <div className="dashboardPanel widePanel">
            <div className="panelHeader"><div><span className="eyebrow">Upcoming week</span><h2>Delivery calendar</h2></div><button className="button buttonSecondary buttonSmall">Pause plan</button></div>
            <div className="deliveryGrid">{deliveries.map((item) => <div className="deliveryDay" key={item.date}><strong>{item.date}</strong><span>{item.meals}</span><small className={item.status === 'Confirmed' ? 'status confirmed' : item.status === 'Selection open' ? 'status open' : 'status'}>{item.status}</small><button>Edit meals</button></div>)}</div>
          </div>
          <aside className="dashboardPanel">
            <span className="eyebrow">Quick actions</span>
            <div className="quickActions"><button>Choose next meals <span>→</span></button><button>Change delivery address <span>→</span></button><button>Skip a delivery <span>→</span></button><button>View payment history <span>→</span></button></div>
          </aside>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
