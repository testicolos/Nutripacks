'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Order={
  id:string;order_number:string;total_qar:number|string;status:string;start_date?:string|null;delivery_address?:string|null;delivery_slot?:string|null;created_at:string;updated_at:string;
  customer_username?:string|null;full_name:string;email:string;phone?:string|null;delivery_zone?:string|null;
  package_name:string;package_slug:string;package_option_name?:string|null;duration_days:number;meals_per_day:number;days_per_week?:number;delivery_day_count?:number;selection_count:number;next_delivery?:string|null;skipped_deliveries:number;
};

type OrderAction='pause'|'resume'|'complete'|'cancel';
function availableActions(order:Order):Array<[OrderAction,string]>{
  if(order.status==='active') return [['pause','Pause'],['complete','Complete'],['cancel','Cancel']];
  if(order.status==='paused') return [['resume','Resume'],['complete','Complete'],['cancel','Cancel']];
  if(order.status==='draft') return [['cancel','Cancel draft']];
  return [];
}

export default function AdminOrdersPage(){
  const router=useRouter(); const [orders,setOrders]=useState<Order[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [message,setMessage]=useState(''); const [statusFilter,setStatusFilter]=useState('all'); const [busy,setBusy]=useState('');

  async function load(){setLoading(true);setError('');const me=await fetch('/api/staff/me',{cache:'no-store'});if(!me.ok){router.replace('/staff/login');return;}const who=await me.json();if(who.role!=='admin'){router.replace('/staff');return;}const ordersRes=await fetch('/api/admin/orders',{cache:'no-store'});if(!ordersRes.ok){setError((await ordersRes.json()).error||'Unable to load orders.');setLoading(false);return;}setOrders(await ordersRes.json());setLoading(false);}
  useEffect(()=>{load();},[]);
  const visible=useMemo(()=>orders.filter(o=>statusFilter==='all'||o.status===statusFilter),[orders,statusFilter]);

  async function transition(order:Order,action:OrderAction){
    if((action==='cancel'||action==='complete')&&!window.confirm(`Confirm ${action} for ${order.order_number}?`))return;
    setBusy(order.id+action);setError('');setMessage('');
    const response=await fetch('/api/admin/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:order.id,action})});
    const data=await response.json();setBusy('');if(!response.ok){setError(data.error||'Unable to update order.');return;}
    setMessage(`${order.order_number} is now ${data.status}.`);await load();
  }

  if(loading)return <main className="staffPortal"><div className="staffTopbar"><strong>Nutripacks Admin</strong></div><div className="staffContent"><div className="staffPanel"><h2>Loading orders…</h2></div></div></main>;
  return <main className="staffPortal">
    <div className="staffTopbar"><div><strong>Nutripacks Admin</strong><span className="rolePill role-admin">admin</span></div><div><a href="/admin">Catalog</a><a href="/staff">Operations</a><a href="/">Customer site</a></div></div>
    <div className="staffContent">
      <section className="staffHero"><div><span className="eyebrow">Order control</span><h1>Subscriptions & delivery lifecycle.</h1><p>A new order remains a draft until its complete meal schedule passes backend validation, then it activates automatically.</p></div></section>
      {error&&<div className="selectionError">{error}</div>}{message&&<div className="adminSuccess">{message}</div>}
      <section className="staffStats"><div><span>Total orders</span><strong>{orders.length}</strong></div><div><span>Active</span><strong>{orders.filter(o=>o.status==='active').length}</strong></div><div><span>Paused</span><strong>{orders.filter(o=>o.status==='paused').length}</strong></div><div><span>Scheduled meal units</span><strong>{orders.reduce((s,o)=>s+Number(o.selection_count||0),0)}</strong></div></section>
      <section className="staffPanel"><div className="panelHeader"><div><span className="eyebrow">Orders</span><h2>Customer subscriptions</h2></div><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">All statuses</option><option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>
        <div className="staffTableWrap"><table className="table staffTable"><thead><tr><th>Order</th><th>Customer</th><th>Package</th><th>Schedule</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visible.map(order=><tr key={order.id}><td><strong>{order.order_number}</strong><small>{new Date(order.created_at).toLocaleDateString('en-QA')}</small></td><td><strong>{order.full_name}</strong><small>{order.customer_username?`@${order.customer_username} • `:''}{order.phone||order.email}</small></td><td><strong>{order.package_name}</strong><small>{order.package_option_name||'Base package'} · QAR {Number(order.total_qar).toLocaleString()} · {order.meals_per_day||0} meals/day</small></td><td><strong>{order.next_delivery||'No future selection'}</strong><small>{order.delivery_day_count||order.duration_days} delivery days · {order.days_per_week||0} days/week · {order.skipped_deliveries||0} skipped</small></td><td><span className={`paymentStatus ${order.status}`}>{order.status.replace('_',' ')}</span></td><td><div className="orderActionGroup">{availableActions(order).length===0?<span className="formNote">No actions</span>:availableActions(order).map(([action,label])=><button key={action} className="button buttonSecondary buttonSmall" disabled={busy===order.id+action} onClick={()=>transition(order,action)}>{busy===order.id+action?'…':label}</button>)}</div></td></tr>)}</tbody></table></div>
      </section>
    </div>
  </main>;
}
