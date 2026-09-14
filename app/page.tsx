const packages = [
  { name: 'Balance', price: '1,950', description: 'Simple, balanced nutrition for everyday life.' },
  { name: 'Performance', price: '2,700', description: 'High-protein meals for training and performance.', featured: true },
  { name: 'Lean', price: '2,250', description: 'Calorie-conscious meals with lean proteins and controlled carbs.' }
];

export default function HomePage() {
  return (
    <main className="shell">
      <header className="nav">
        <a className="brand" href="#top">Nutripacks</a>
        <nav className="navlinks">
          <a href="#plans">Plans</a><a href="#how">How it works</a><a href="#menu">Menu</a>
          <a className="btn secondary" href="/admin">Admin</a>
          <a className="btn primary" href="#plans">Choose your plan</a>
        </nav>
      </header>
      <section className="hero" id="top">
        <div>
          <div className="eyebrow">Nutrition made practical</div>
          <h1>Healthy meals built around your goals.</h1>
          <p className="lead">Choose a plan, select the meals available to that package, and manage your deliveries from one simple account.</p>
          <div style={{display:'flex',gap:12,marginTop:28}}><a className="btn primary" href="#plans">Explore plans</a><a className="btn secondary" href="#menu">Browse menu</a></div>
        </div>
        <div className="heroCard"><div className="visual">Fresh meals.<br/>Clear macros.<br/>Less guessing.</div></div>
      </section>
      <section className="section" id="plans">
        <div className="eyebrow">Meal plans</div><h2>Pick the plan that fits.</h2>
        <p className="lead">Package rules, eligible meals and nutrition targets will all be controlled from the admin backend.</p>
        <div className="grid3">{packages.map((p)=><article className="card" key={p.name}>{p.featured && <span className="tag">Most popular</span>}<h3>{p.name}</h3><p>{p.description}</p><div className="price">QAR {p.price}</div><button className="btn primary">View plan</button></article>)}</div>
      </section>
      <section className="section" id="how"><div className="eyebrow">How it works</div><h2>Four steps, no nutritional archaeology.</h2><div className="grid3"><div className="card"><b>1. Create account</b><p>Save your profile, address and preferences.</p></div><div className="card"><b>2. Select package</b><p>See only meals allowed for that plan.</p></div><div className="card"><b>3. Choose meals</b><p>Build your upcoming delivery schedule.</p></div></div></section>
      <section className="section" id="menu"><div className="eyebrow">Menu</div><h2>Menu discovery will live here.</h2><p className="lead">The next step will connect this screen to the live Nutripacks menu already prepared in the database.</p></section>
    </main>
  );
}
