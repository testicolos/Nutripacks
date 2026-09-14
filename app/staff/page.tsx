'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Staff={id:string;username:string;role:'admin'|'chef'|'sales'};
type Row={selection_id:string;delivery_date:string;meal_slot:string;quantity:number;meal_name:string;order_number:string;order_status:string;package_name:string;customer_name:string;customer_email?:string|null;customer_phone?:string|null;delivery_address?:string|null;delivery_slot?:string|null};
type Total={delivery_date:string;meal_slot:string;meal_name:string;total_quantity:number};
type Schedule={role:string;from:string;to:string;rows:Row[];totals:Total[];testing_mode?:boolean};
type StaffUser={id:string;username:string;role:string;active:boolean;created_at:string};

function iso(d:Date){return d.toISOString().slice(0,10)}
function pretty(value:string){return new Intl.DateTimeFormat('en-QA',{weekday:'short',month:'short',day:'numeric'}).format(new Date(`${value}T12:00:00`))}

export default function StaffPortal(){
  const router=useRouter();
  const [me,setMe]=useState<Staff|null>(null); const [schedule,setSchedule]=useState<Schedule|null>(null); const [users,setUsers]=useState<StaffUser[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  const today=new Date(); const next=new Date(); next.setDate(next.getDate()+7); const [from,setFrom]=useState(iso(today)); const [to,setTo]=useState(iso(next));

  async function loadSchedule(currentFrom=from,currentTo=to){const response=await fetch(`/api/staff/schedule?from=${currentFrom}&to=${currentTo}`,{cache:'no-store'});const data=await response.json();if(!response.ok){setError(data.error||'Unable to load schedule.');return;}setSchedule(data);}
  async function load(){setLoading(true);setError('');const meRes=await fetch('/api/staff/me',{cache:'no-store'});if(!meRes.ok){router.replace('/staff/login');return;}const who=await meRes.json();setMe(who);await loadSchedule();if(who.role==='admin'){const u=await fetch('/api/staff/users',{cache:'no-store'});if(u.ok)setUsers(await u.json());}setLoading(false);}
  useEffect(()=>{load();},[]);
  const grouped=useMemo(()=>{const map=new Map<string,Total[]>();(schedule?.totals||[]).forEach(t=>{const list=map.get(t.delivery_date)||[];list.push(t);map.set(t.delivery_date,list)});return Array.from(map.entries())},[schedule]);
  const activeLines=(schedule?.rows||[]).filter(r=>r.order_status==='active').length;

  async function signOut(){await fetch('/api/staff/logout',{method:'POST'});router.push('/staff/login');router.refresh();}
  async function applyRange(event:FormEvent){event.preventDefault();setError('');await loadSchedule();}
  async function createUser(event:FormEvent<HTMLFormElement>){event.preventDefault();setError('');const form=new FormData(event.currentTarget);const response=await fetch('/api/staff/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:form.get('username'),password:form.get('password'),role:form.get('role')})});const data=await response.json();if(!response.ok){setError(data.error||'Unable to save staff user.');return;}event.currentTarget.reset();const u=await fetch('/api/staff/users',{cache:'no-store'});if(u.ok)setUsers(await u.json());}

  if(loading)return <main className="staffPortal"><div className="staffTopbar"><strong>Nutripacks Operations</strong></div><div className="staffContent"><div className="staffPanel"><h2>Loading live schedule…</h2></div></div></main>;
  if(!me)return null;
  return <main className="staffPortal">
    <div className="staffTopbar"><div><strong>Nutripacks Operations</strong><span className={`rolePill role-${me.role}`}>{me.role}</span></div><div><span>{me.username}</span>{me.role==='admin'&&<><a href="/admin">Catalog</a><a href="/admin/orders">Orders</a></>}<button onClick={signOut}>Sign out</button></div></div>
    <div className="staffContent">
      <section className="staffHero"><div><span className="eyebrow">Live operations</span><h1>{me.role==='chef'?'Kitchen production schedule':me.role==='sales'?'Customer selections & sales view':'Operations overview'}</h1><p>{me.role==='chef'?'See exactly what needs to be prepared by date and meal, without exposing customer contact details.':'Review customer selections, delivery timing, package status and production totals. Payment is disabled in this testing environment.'}</p></div><form className="staffDateFilter" onSubmit={applyRange}><label>From<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>To<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label><button className="button buttonPrimary buttonSmall">Refresh</button></form></section>
      <div className="testingBanner"><strong>Testing mode</strong><span>Orders enter the operational schedule immediately. No payment step is required.</span></div>
      {error&&<div className="selectionError">{error}</div>}
      <section className="staffStats"><div><span>Selected meal units</span><strong>{(schedule?.rows||[]).reduce((n,r)=>n+Number(r.quantity||0),0)}</strong></div><div><span>Delivery days</span><strong>{grouped.length}</strong></div><div><span>Customer lines</span><strong>{schedule?.rows?.length||0}</strong></div><div><span>Active production lines</span><strong>{activeLines}</strong></div></section>
      <section className="staffPanel"><div className="panelHeader"><div><span className="eyebrow">Kitchen view</span><h2>Production totals by delivery day</h2></div></div>{grouped.length===0?<div className="emptyState"><strong>No production scheduled.</strong><span>Customer meal selections will appear here automatically.</span></div>:<div className="kitchenDays">{grouped.map(([date,items])=><article className="kitchenDay" key={date}><h3>{pretty(date)}</h3>{items.map(item=><div className="kitchenTotal" key={`${item.meal_slot}-${item.meal_name}`}><div><span>{item.meal_slot}</span><strong>{item.meal_name}</strong></div><b>× {item.total_quantity}</b></div>)}</article>)}</div>}</section>
      <section className="staffPanel"><div className="panelHeader"><div><span className="eyebrow">Customer schedule</span><h2>Selections & delivery details</h2></div></div><div className="staffTableWrap"><table className="table staffTable"><thead><tr><th>Date</th><th>Customer</th><th>Package</th><th>Meal</th><th>Qty</th><th>Delivery</th><th>Status</th>{me.role!=='chef'&&<th>Contact</th>}</tr></thead><tbody>{(schedule?.rows||[]).map(row=><tr key={row.selection_id}><td>{pretty(row.delivery_date)}</td><td><strong>{row.customer_name}</strong><small>{row.order_number}</small></td><td>{row.package_name}</td><td><strong>{row.meal_name}</strong><small>{row.meal_slot}</small></td><td>{row.quantity}</td><td><strong>{row.delivery_slot||'—'}</strong><small>{row.delivery_address||'No address'}</small></td><td><span className={`paymentStatus ${row.order_status}`}>{row.order_status}</span></td>{me.role!=='chef'&&<td><strong>{row.customer_phone||'—'}</strong><small>{row.customer_email||''}</small></td>}</tr>)}</tbody></table></div></section>
      {me.role==='admin'&&<section className="staffPanel"><div className="panelHeader"><div><span className="eyebrow">Access control</span><h2>Chef & sales accounts</h2></div></div><div className="staffUserGrid"><form className="formGrid staffUserForm" onSubmit={createUser}><label className="field full"><span>Username</span><input name="username" required minLength={3}/></label><label className="field"><span>Role</span><select name="role" defaultValue="chef"><option value="chef">Chef</option><option value="sales">Sales</option><option value="admin">Admin</option></select></label><label className="field"><span>Password</span><input name="password" type="password" required minLength={8}/></label><button className="button buttonPrimary fullButton">Create / reset staff user</button></form><div className="staffUserList">{users.map(user=><div key={user.id}><span><strong>{user.username}</strong><small>{user.active?'Active':'Disabled'}</small></span><span className={`rolePill role-${user.role}`}>{user.role}</span></div>)}</div></div></section>}
    </div>
  </main>;
}
