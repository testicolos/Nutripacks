'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Order = {
  id:string; order_number:string; total_qar:number|string; status:string; payment_status:string; payment_provider:string; payment_reference?:string|null;
  start_date?:string|null; delivery_address?:string|null; delivery_slot?:string|null; created_at:string; updated_at:string;
  customer_username?:string|null; full_name:string; email:string; phone?:string|null; delivery_zone?:string|null;
  package_name:string; package_slug:string; duration_days:number; meals_per_day:number; selection_count:number; next_delivery?:string|null; skipped_deliveries:number;
};

type QiibStatus = { provider:string; configured:boolean; cardOnly:boolean; mode:string };

const actions = [
  ['mark_paid','Mark paid + activate'],['payment_failed','Payment failed'],['pause','Pause'],['resume','Resume'],['complete','Complete'],['cancel','Cancel'],['refund','Refund']
] as const;

export default function AdminOrdersPage(){
  const router=useRouter();
  const [orders,setOrders]=useState<Order[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [message,setMessage]=useState('');
  const [statusFilter,setStatusFilter]=useState('all'); const [paymentFilter,setPaymentFilter]=useState('all'); const [qiib,setQiib]=useState<QiibStatus|null>(null); const [busy,setBusy]=useState('');

  async function load(){
    setLoading(true); setError('');
    const me=await fetch('/api/staff/me',{cache:'no-store'}); if(!me.ok){router.replace('/staff/login');return;} const who=await me.json(); if(who.role!=='admin'){router.replace('/staff');return;}
    const [ordersRes,qiibRes]=await Promise.all([fetch('/api/admin/orders',{cache:'no-store'}),fetch('/api/payment/qiib/status',{cache:'no-store'})]);
    if(!ordersRes.ok){setError((await ordersRes.json()).error||'Unable to load orders.');setLoading(false);return;}
    setOrders(await ordersRes.json()); if(qiibRes.ok)setQiib(await qiibRes.json()); setLoading(false);
  }
  useEffect(()=>{load();},[]);
  const visible=useMemo(()=>orders.filter(o=>(statusFilter==='all'||o.status===statusFilter)&&(paymentFilter==='all'||o.payment_status===paymentFilter)),[orders,statusFilter,paymentFilter]);

  async function transition(order:Order,action:string){
    setBusy(order.id+action); setError(''); setMessage('');
    let reference:string|undefined;
    if(action==='mark_paid') reference=window.prompt('Payment reference / bank reference (optional):',order.payment_reference||'')||undefined;
    if((action==='refund'||action==='cancel')&&!window.confirm(`Confirm ${action.replace('_',' ')} for ${order.order_number}?`)){setBusy('');return;}
    const response=await fetch('/api/admin/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:order.id,action,reference})});
    const data=await response.json(); setBusy(''); if(!response.ok){setError(data.error||'Unable to update order.');return;}
    setMessage(`${order.order_number} updated to ${data.status} / ${data.payment_status}.`); await load();
  }

  if(loading)return <main className="staffPortal"><div className="staffTopbar"><strong>Nutripacks Admin</strong></div><div className="staffContent"><div className="staffPanel"><h2>Loading orders…</h2></div></div></main>;
  return <main className="staffPortal">
    <div className="staffTopbar"><div><strong>Nutripacks Admin</strong><span className="rolePill role-admin">admin</span></div><div><a href="/admin">Catalog</a><a href="/staff">Operations</a><a href="/">Customer site</a></div></div>
    <div className="staffContent">
      <section className="staffHero"><div><span className="eyebrow">Step 6</span><h1>Order lifecycle & subscription control.</h1><p>Confirm payment, activate packages, pause/resume plans, complete orders, cancel or refund from one live board.</p></div><div className="accountPlanCard"><span>QIIB card gateway</span><strong>{qiib?.configured?'Configured':'Credentials pending'}</strong><small>{qiib?.configured?`Mode: ${qiib.mode}`:'Adapter is ready. Merchant ID, endpoint and callback secret still need to come from QIIB.'}</small></div></section>
      {error&&<div className="selectionError">{error}</div>}{message&&<div className="adminSuccess">{message}</div>}
      <section className="staffStats"><div><span>Total orders</span><strong>{orders.length}</strong></div><div><span>Active</span><strong>{orders.filter(o=>o.status==='active').length}</strong></div><div><span>Awaiting payment</span><strong>{orders.filter(o=>o.payment_status==='pending').length}</strong></div><div><span>Paid revenue</span><strong>QAR {orders.filter(o=>o.payment_status==='paid').reduce((s,o)=>s+Number(o.total_qar),0).toLocaleString()}</strong></div></section>
      <section className="staffPanel"><div className="panelHeader"><div><span className="eyebrow">Filters</span><h2>Orders</h2></div><div style={{display:'flex',gap:10,flexWrap:'wrap'}}><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">All statuses</option><option value="awaiting_payment">Awaiting payment</option><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select><select value={paymentFilter} onChange={e=>setPaymentFilter(e.target.value)}><option value="all">All payments</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select></div></div>
        <div className="staffTableWrap"><table className="table staffTable"><thead><tr><th>Order</th><th>Customer</th><th>Package</th><th>Schedule</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead><tbody>{visible.map(order=><tr key={order.id}><td><strong>{order.order_number}</strong><small>{new Date(order.created_at).toLocaleDateString('en-QA')}</small></td><td><strong>{order.full_name}</strong><small>{order.customer_username?`@${order.customer_username} • `:''}{order.phone||order.email}</small></td><td><strong>{order.package_name}</strong><small>QAR {Number(order.total_qar).toLocaleString()} • {order.selection_count||0} meal units</small></td><td><strong>{order.next_delivery||'No future selection'}</strong><small>{order.delivery_slot||'No slot'} • {order.skipped_deliveries||0} skipped</small></td><td><span className={`paymentStatus ${order.status}`}>{order.status.replace('_',' ')}</span></td><td><span className={`paymentStatus ${order.payment_status}`}>{order.payment_status}</span><small>{order.payment_reference||order.payment_provider}</small></td><td><div style={{display:'flex',gap:6,flexWrap:'wrap',minWidth:260}}>{actions.map(([action,label])=><button key={action} className="button buttonSecondary buttonSmall" disabled={busy===order.id+action} onClick={()=>transition(order,action)}>{busy===order.id+action?'…':label}</button>)}</div></td></tr>)}</tbody></table></div>
      </section>
    </div>
  </main>;
}
