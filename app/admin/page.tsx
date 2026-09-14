const recentOrders = [
  ['NP-DEMO-001','Demo Customer','Performance','QAR 2,700','Awaiting payment'],
  ['NP-DEMO-002','Sample Customer','Balance','QAR 1,950','Paid']
];

export default function AdminPage() {
  return (
    <main className="adminWrap">
      <aside className="sidebar"><div className="brand">Nutripacks</div><small>Admin Console</small><nav><a className="active" href="/admin">Dashboard</a><a href="#">Packages</a><a href="#">Menu items</a><a href="#">Orders</a><a href="#">Customers</a><a href="#">Email templates</a><a href="#">Settings</a></nav></aside>
      <section className="adminMain"><div className="eyebrow">Admin</div><h1 style={{fontSize:42,marginBottom:6}}>Dashboard</h1><p style={{color:'var(--muted)'}}>Frontend shell is ready. Live database wiring comes next.</p><div className="stats"><div className="stat">Packages<strong>3</strong></div><div className="stat">Menu items<strong>10</strong></div><div className="stat">Orders<strong>2</strong></div><div className="stat">Revenue<strong>QAR 1,950</strong></div></div><div className="card"><h3>Recent orders</h3><table className="table"><thead><tr><th>Order</th><th>Customer</th><th>Package</th><th>Total</th><th>Status</th></tr></thead><tbody>{recentOrders.map((o)=><tr key={o[0]}>{o.map((v)=><td key={v}>{v}</td>)}</tr>)}</tbody></table></div></section>
    </main>
  );
}
