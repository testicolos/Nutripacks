'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

type PackageItem = { id:string; name:string; slug:string; price_qar:number|string; duration_days:number; meals_per_day:number; calories_min?:number|null; calories_max?:number|null; protein_target?:number|null; tagline?:string|null; description?:string|null };
type Rule = { package_id:string; breakfast_qty:number; main_qty:number; snack_qty:number; days_per_week:number };
type MenuItem = { id:string; name:string; category:string; calories:number; protein_g:number|string; image_url?:string|null };
type Mapping = { package_id:string; menu_item_id:string; meal_slot:string };
type Catalog = { packages:PackageItem[]; rules:Rule[]; menu:MenuItem[]; mappings:Mapping[] };
type Customer = { full_name:string; delivery_address?:string|null; delivery_slot?:string|null; delivery_zone?:string|null };
type Order = { id:string; package_id:string; package_slug:string; package_name:string; start_date?:string|null; delivery_address?:string|null; delivery_slot?:string|null };
type ExistingSelection = { delivery_date:string; meal_slot:string; menu_item_id:string; quantity:number };

function isoDate(date: Date) {
  const y=date.getFullYear(); const m=String(date.getMonth()+1).padStart(2,'0'); const d=String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
function prettyDate(value:string) { return new Intl.DateTimeFormat('en-QA',{weekday:'short',month:'short',day:'numeric'}).format(new Date(`${value}T12:00:00`)); }

export default function MealSelectionPage() {
  const router=useRouter();
  const search=useSearchParams();
  const planSlug=search.get('plan');
  const orderIdParam=search.get('order');
  const [catalog,setCatalog]=useState<Catalog|null>(null);
  const [customer,setCustomer]=useState<Customer|null>(null);
  const [orders,setOrders]=useState<Order[]>([]);
  const [plan,setPlan]=useState<PackageItem|null>(null);
  const [orderId,setOrderId]=useState<string|null>(orderIdParam);
  const [startDate,setStartDate]=useState('');
  const [selected,setSelected]=useState<Record<string,string>>({});
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{
    (async()=>{
      const [catalogRes,meRes]=await Promise.all([fetch('/api/catalog',{cache:'no-store'}),fetch('/api/customer/me',{cache:'no-store'})]);
      if(!catalogRes.ok){ setError('Unable to load the Nutripacks menu.'); setLoading(false); return; }
      const cat=await catalogRes.json() as Catalog; setCatalog(cat);
      if(!meRes.ok){ setLoading(false); return; }
      const me=await meRes.json(); setCustomer(me.customer); setOrders(me.orders||[]);
      const editing:Order|undefined=orderIdParam ? (me.orders||[]).find((o:Order)=>o.id===orderIdParam) : undefined;
      const resolved=editing ? cat.packages.find(p=>p.id===editing.package_id) : cat.packages.find(p=>p.slug===(planSlug||cat.packages[0]?.slug));
      setPlan(resolved||null);
      const tomorrow=new Date(); tomorrow.setDate(tomorrow.getDate()+1);
      setStartDate(editing?.start_date || isoDate(tomorrow));
      if(editing){
        setOrderId(editing.id);
        const selRes=await fetch(`/api/customer/selections?orderId=${encodeURIComponent(editing.id)}`,{cache:'no-store'});
        if(selRes.ok){
          const existing=await selRes.json() as ExistingSelection[];
          const values:Record<string,string>={};
          existing.forEach((s)=>{ for(let i=0;i<Number(s.quantity||1);i++) values[`${s.delivery_date}:${s.meal_slot}:${i}`]=s.menu_item_id; });
          setSelected(values);
        }
      }
      setLoading(false);
    })();
  },[orderIdParam,planSlug]);

  const rule=useMemo(()=>catalog&&plan ? catalog.rules.find(r=>r.package_id===plan.id)||null:null,[catalog,plan]);
  const dates=useMemo(()=>{
    if(!startDate||!rule) return [];
    const start=new Date(`${startDate}T12:00:00`); const list:string[]=[];
    for(let i=0;i<Math.max(1,rule.days_per_week);i++){ const d=new Date(start); d.setDate(start.getDate()+i); list.push(isoDate(d)); }
    return list;
  },[startDate,rule]);

  function eligible(slot:string){
    if(!catalog||!plan) return [] as MenuItem[];
    const ids=new Set(catalog.mappings.filter(m=>m.package_id===plan.id&&m.meal_slot===slot).map(m=>m.menu_item_id));
    return catalog.menu.filter(m=>ids.has(m.id));
  }
  function qty(slot:string){ if(!rule) return 0; if(slot==='breakfast') return rule.breakfast_qty; if(slot==='main') return rule.main_qty; return rule.snack_qty; }

  async function save(event:FormEvent){
    event.preventDefault(); if(!catalog||!plan||!rule||!customer) return; setSaving(true); setError('');
    if(!customer.delivery_address||!customer.delivery_slot){ setSaving(false); setError('Please complete your delivery address and preferred slot in your account first.'); return; }
    const expected=dates.reduce((n)=>n+qty('breakfast')+qty('main')+qty('snack'),0);
    const chosen=Object.values(selected).filter(Boolean).length;
    if(chosen<expected){ setSaving(false); setError('Please choose every meal for the first delivery week before saving.'); return; }
    let currentOrder=orderId;
    if(!currentOrder){
      const orderRes=await fetch('/api/customer/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({packageId:plan.id,startDate,deliveryAddress:customer.delivery_address,deliverySlot:customer.delivery_slot})});
      const orderData=await orderRes.json();
      if(!orderRes.ok){ setSaving(false); setError(orderData.error||'Unable to create order.'); return; }
      currentOrder=orderData.id; setOrderId(currentOrder);
    }
    const grouped=new Map<string,{delivery_date:string;meal_slot:string;menu_item_id:string;quantity:number}>();
    Object.entries(selected).forEach(([key,itemId])=>{
      if(!itemId) return;
      const [delivery_date,meal_slot]=key.split(':'); const groupKey=`${delivery_date}:${meal_slot}:${itemId}`;
      const row=grouped.get(groupKey); if(row) row.quantity+=1; else grouped.set(groupKey,{delivery_date,meal_slot,menu_item_id:itemId,quantity:1});
    });
    const saveRes=await fetch('/api/customer/selections',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:currentOrder,selections:Array.from(grouped.values())})});
    const saveData=await saveRes.json(); setSaving(false);
    if(!saveRes.ok){ setError(saveData.error||'Unable to save meal selections.'); return; }
    router.push('/account?meals=saved'); router.refresh();
  }

  if(loading) return <main className="siteShell"><SiteHeader/><section className="contentWidth sectionBlock"><div className="formCard"><h2>Loading live package rules…</h2></div></section><SiteFooter/></main>;
  if(!customer) return <main className="siteShell"><SiteHeader/><section className="contentWidth sectionBlock"><div className="formCard"><span className="eyebrow">Meal selection</span><h1 className="selectionTitle">Sign in before choosing meals.</h1><p className="lead">Your selections are tied to your customer account and delivery schedule.</p><a className="button buttonPrimary" href={`/login?next=${encodeURIComponent(`/select?plan=${planSlug||''}`)}`}>Sign in</a></div></section><SiteFooter/></main>;
  if(!plan||!catalog||!rule) return <main className="siteShell"><SiteHeader/><section className="contentWidth sectionBlock"><div className="formCard"><h2>Package not found.</h2><a className="button buttonPrimary" href="/#plans">Back to plans</a></div></section><SiteFooter/></main>;

  return <main className="siteShell"><SiteHeader/>
    <section className="contentWidth selectionHero"><div><span className="eyebrow">Live package menu</span><h1>Choose your first week of {plan.name} meals.</h1><p className="lead">Only meals assigned to the {plan.name} package appear below. The database also enforces the package quantities when you save.</p></div><div className="selectionPlanSummary"><span>{plan.duration_days}-day plan</span><strong>QAR {Number(plan.price_qar).toLocaleString()}</strong><small>{qty('breakfast')} breakfast • {qty('main')} main • {qty('snack')} snack / delivery day</small></div></section>
    <form onSubmit={save} className="contentWidth sectionBlock">
      <div className="selectionToolbar"><label className="field"><span>Package start date</span><input type="date" value={startDate} disabled={Boolean(orderId)} onChange={e=>{setStartDate(e.target.value);setSelected({});}}/></label><div className="selectionNote">{orderId ? 'Editing an existing order' : 'A pending order will be created when you save. Payment remains pending until QIIB is connected.'}</div></div>
      <div className="selectionDays">{dates.map(date=><article className="selectionDay" key={date}><div className="selectionDayHead"><span>{prettyDate(date)}</span><small>{qty('breakfast')+qty('main')+qty('snack')} selections</small></div>{(['breakfast','main','snack'] as const).map(slot=>Array.from({length:qty(slot)}).map((_,index)=>{const key=`${date}:${slot}:${index}`;return <label className="mealSelect" key={key}><span>{slot==='main'&&qty(slot)>1?`Main meal ${index+1}`:`${slot.charAt(0).toUpperCase()+slot.slice(1)}`}</span><select value={selected[key]||''} onChange={e=>setSelected(prev=>({...prev,[key]:e.target.value}))} required><option value="">Choose a meal</option>{eligible(slot).map(item=><option value={item.id} key={item.id}>{item.name} • {item.calories} kcal • {Number(item.protein_g)}g protein</option>)}</select></label>}))}</article>)}</div>
      {error&&<div className="selectionError">{error}</div>}
      <div className="selectionSaveBar"><div><strong>{Object.values(selected).filter(Boolean).length}</strong><span> meals selected for this week</span></div><button className="button buttonPrimary" type="submit" disabled={saving}>{saving?'Saving selections…':orderId?'Update meal schedule':'Save meals & create order'}</button></div>
    </form><SiteFooter/></main>;
}
