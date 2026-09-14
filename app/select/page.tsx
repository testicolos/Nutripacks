'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

type PackageItem={id:string;name:string;slug:string;price_qar:number|string;duration_days:number;meals_per_day:number;calories_min?:number|null;calories_max?:number|null;protein_target?:number|null;tagline?:string|null;description?:string|null};
type Rule={package_id:string;breakfast_qty:number;main_qty:number;snack_qty:number;days_per_week:number};
type MenuItem={id:string;name:string;category:string;calories:number;protein_g:number|string;image_url?:string|null};
type Mapping={package_id:string;menu_item_id:string;meal_slot:string};
type Catalog={packages:PackageItem[];rules:Rule[];menu:MenuItem[];mappings:Mapping[]};
type Customer={full_name:string;delivery_address?:string|null;delivery_slot?:string|null;delivery_zone?:string|null};
type Order={id:string;package_id:string;package_slug:string;package_name:string;start_date?:string|null;delivery_address?:string|null;delivery_slot?:string|null;selection_count?:number;meal_change_count?:number;meal_change_remaining?:number};
type ExistingSelection={delivery_date:string;meal_slot:string;menu_item_id:string;quantity:number};

function isoDate(date:Date){const y=date.getFullYear();const m=String(date.getMonth()+1).padStart(2,'0');const d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`;}
function prettyDate(value:string){return new Intl.DateTimeFormat('en-QA',{weekday:'short',month:'short',day:'numeric'}).format(new Date(`${value}T12:00:00`));}
function qatarToday(){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Qatar',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const get=(type:string)=>parts.find(p=>p.type===type)?.value||'';return `${get('year')}-${get('month')}-${get('day')}`;}
function addDays(value:string,days:number){const [y,m,d]=value.split('-').map(Number);const date=new Date(Date.UTC(y,m-1,d+days));return `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}-${String(date.getUTCDate()).padStart(2,'0')}`;}

export default function MealSelectionPage(){
  const router=useRouter();
  const [planSlug,setPlanSlug]=useState<string|null>(null); const [catalog,setCatalog]=useState<Catalog|null>(null); const [customer,setCustomer]=useState<Customer|null>(null); const [orders,setOrders]=useState<Order[]>([]);
  const [plan,setPlan]=useState<PackageItem|null>(null); const [editingOrder,setEditingOrder]=useState<Order|null>(null); const [orderId,setOrderId]=useState<string|null>(null); const [startDate,setStartDate]=useState(''); const [selected,setSelected]=useState<Record<string,string>>({});
  const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [error,setError]=useState(''); const [policyAccepted,setPolicyAccepted]=useState(false);

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search); const requestedPlan=params.get('plan'); const requestedOrder=params.get('order'); setPlanSlug(requestedPlan); setOrderId(requestedOrder);
    (async()=>{
      const [catalogRes,meRes]=await Promise.all([fetch('/api/catalog',{cache:'no-store'}),fetch('/api/customer/me',{cache:'no-store'})]);
      if(!catalogRes.ok){setError('Unable to load the Nutripacks menu.');setLoading(false);return;} const cat=await catalogRes.json() as Catalog; setCatalog(cat);
      if(!meRes.ok){setLoading(false);return;} const me=await meRes.json(); setCustomer(me.customer); setOrders(me.orders||[]);
      const editing:Order|undefined=requestedOrder?(me.orders||[]).find((o:Order)=>o.id===requestedOrder):undefined; setEditingOrder(editing||null);
      const resolved=editing?cat.packages.find(p=>p.id===editing.package_id):cat.packages.find(p=>p.slug===(requestedPlan||cat.packages[0]?.slug)); setPlan(resolved||null);
      const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);setStartDate(editing?.start_date||isoDate(tomorrow));
      if(editing){const selRes=await fetch(`/api/customer/selections?orderId=${encodeURIComponent(editing.id)}`,{cache:'no-store'});if(selRes.ok){const existing=await selRes.json() as ExistingSelection[];const values:Record<string,string>={};existing.forEach(s=>{for(let i=0;i<Number(s.quantity||1);i++)values[`${s.delivery_date}:${s.meal_slot}:${i}`]=s.menu_item_id;});setSelected(values);}}
      setLoading(false);
    })();
  },[]);

  const rule=useMemo(()=>catalog&&plan?catalog.rules.find(r=>r.package_id===plan.id)||null:null,[catalog,plan]);
  const dates=useMemo(()=>{if(!startDate||!rule)return[];const start=new Date(`${startDate}T12:00:00`);const list:string[]=[];for(let i=0;i<Math.max(1,rule.days_per_week);i++){const d=new Date(start);d.setDate(start.getDate()+i);list.push(isoDate(d));}return list;},[startDate,rule]);
  const hasExistingSchedule=Boolean(orderId&&Number(editingOrder?.selection_count||0)>0);
  const changesRemaining=editingOrder?.meal_change_remaining??1;
  const readOnly=hasExistingSchedule&&changesRemaining<=0;
  const lockedThrough=addDays(qatarToday(),1);
  function editDateLocked(date:string){return hasExistingSchedule&&date<=lockedThrough;}
  function eligible(slot:string){if(!catalog||!plan)return[] as MenuItem[];const ids=new Set(catalog.mappings.filter(m=>m.package_id===plan.id&&m.meal_slot===slot).map(m=>m.menu_item_id));return catalog.menu.filter(m=>ids.has(m.id));}
  function qty(slot:string){if(!rule)return 0;if(slot==='breakfast')return rule.breakfast_qty;if(slot==='main')return rule.main_qty;return rule.snack_qty;}

  async function save(event:FormEvent){
    event.preventDefault();if(!catalog||!plan||!rule||!customer)return;
    if(readOnly){setError('Your one meal-selection change for this plan cycle has already been used.');return;}
    if(!policyAccepted){setError('Please confirm that you understand the meal-selection change policy before saving.');return;}
    setSaving(true);setError('');
    if(!customer.delivery_address||!customer.delivery_slot){setSaving(false);setError('Please complete your delivery address and preferred slot in your account first.');return;}
    const expected=dates.reduce(n=>n+qty('breakfast')+qty('main')+qty('snack'),0);const chosen=Object.values(selected).filter(Boolean).length;
    if(chosen<expected){setSaving(false);setError('Please choose every meal for the first delivery week before saving.');return;}
    let currentOrder=orderId;
    if(!currentOrder){const orderRes=await fetch('/api/customer/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({packageId:plan.id,startDate,deliveryAddress:customer.delivery_address,deliverySlot:customer.delivery_slot})});const orderData=await orderRes.json();if(!orderRes.ok){setSaving(false);setError(orderData.error||'Unable to create order.');return;}currentOrder=orderData.id;setOrderId(currentOrder);}
    const grouped=new Map<string,{delivery_date:string;meal_slot:string;menu_item_id:string;quantity:number}>();
    Object.entries(selected).forEach(([key,itemId])=>{if(!itemId)return;const [delivery_date,meal_slot]=key.split(':');const g=`${delivery_date}:${meal_slot}:${itemId}`;const row=grouped.get(g);if(row)row.quantity+=1;else grouped.set(g,{delivery_date,meal_slot,menu_item_id:itemId,quantity:1});});
    const saveRes=await fetch('/api/customer/selections',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:currentOrder,selections:Array.from(grouped.values())})});const saveData=await saveRes.json();setSaving(false);if(!saveRes.ok){setError(saveData.error||'Unable to save meal selections.');return;}router.push('/account?meals=saved');router.refresh();
  }

  if(loading)return <main className="siteShell"><SiteHeader/><section className="contentWidth sectionBlock"><div className="formCard"><h2>Loading live package rules…</h2></div></section><SiteFooter/></main>;
  if(!customer){const nextPath=`/select?plan=${planSlug||''}`;return <main className="siteShell"><SiteHeader/><section className="contentWidth sectionBlock"><div className="formCard"><span className="eyebrow">Meal selection</span><h1 className="selectionTitle">Create an account or sign in first.</h1><p className="lead">Your selected package is preserved, so you can return directly to meal selection after onboarding.</p><div className="heroActions"><a className="button buttonPrimary" href={`/signup?plan=${encodeURIComponent(planSlug||'')}`}>Create account</a><a className="button buttonSecondary" href={`/login?next=${encodeURIComponent(nextPath)}`}>Sign in</a></div></div></section><SiteFooter/></main>;}
  if(!plan||!catalog||!rule)return <main className="siteShell"><SiteHeader/><section className="contentWidth sectionBlock"><div className="formCard"><h2>Package not found.</h2><p className="lead">This package may have been archived or removed from the live catalog.</p><a className="button buttonPrimary" href="/#plans">Back to plans</a></div></section><SiteFooter/></main>;

  const today=isoDate(new Date());
  return <main className="siteShell"><SiteHeader/><section className="contentWidth selectionHero"><div><span className="eyebrow">Live package menu</span><h1>{hasExistingSchedule?'Review your weekly meal schedule.':`Choose your first week of ${plan.name} meals.`}</h1><p className="lead">Only meals assigned to the {plan.name} package appear below. Package quantities and change limits are validated again by the backend when you save.</p></div><div className="selectionPlanSummary"><span>{plan.duration_days}-day plan</span><strong>QAR {Number(plan.price_qar).toLocaleString()}</strong><small>{qty('breakfast')} breakfast • {qty('main')} main • {qty('snack')} snack / delivery day</small>{hasExistingSchedule&&<small>Meal changes remaining until renewal: {changesRemaining}</small>}</div></section>
  <section className="contentWidth"><div className="testingBanner"><strong>Meal-selection policy</strong><span>{readOnly?'Your one allowed meal-selection change for this plan cycle has already been used. This schedule is view-only until renewal.':hasExistingSchedule?'You may change the weekly meal selection only once during this plan cycle. Today and tomorrow are locked, so only later delivery days can be changed. Saving a real change uses your one allowance.':'Once you confirm this weekly schedule, you may change it only one time during this plan cycle (once per renewal). Any later change cannot affect today or tomorrow.'}</span></div></section>
  <form onSubmit={save} className="contentWidth sectionBlock"><div className="selectionToolbar"><label className="field"><span>Package start date</span><input type="date" min={today} value={startDate} disabled={Boolean(orderId)} onChange={e=>{setStartDate(e.target.value);setSelected({});}}/></label><div className="selectionNote">{readOnly?'View-only schedule. Your next meal-selection change becomes available after plan renewal.':hasExistingSchedule?'You have one change for the whole weekly schedule. Dates today and tomorrow cannot be edited.':'Choose every required meal for the first delivery week. Please review carefully before confirming.'}</div></div><div className="selectionDays">{dates.map(date=>{const dayLocked=readOnly||editDateLocked(date);return <article className="selectionDay" key={date}><div className="selectionDayHead"><span>{prettyDate(date)}</span><small>{dayLocked&&hasExistingSchedule?'Locked':`${qty('breakfast')+qty('main')+qty('snack')} selections`}</small></div>{(['breakfast','main','snack'] as const).map(slot=>Array.from({length:qty(slot)}).map((_,index)=>{const key=`${date}:${slot}:${index}`;return <label className="mealSelect" key={key}><span>{slot==='main'&&qty(slot)>1?`Main meal ${index+1}`:slot.charAt(0).toUpperCase()+slot.slice(1)}</span><select value={selected[key]||''} disabled={dayLocked} onChange={e=>setSelected(prev=>({...prev,[key]:e.target.value}))} required={!dayLocked}><option value="">Choose a meal</option>{eligible(slot).map(item=><option value={item.id} key={item.id}>{item.name} • {item.calories} kcal • {Number(item.protein_g)}g protein</option>)}</select></label>}))}{dayLocked&&hasExistingSchedule&&<p className="formNote">{readOnly?'No more meal changes are available this cycle.':'Today and tomorrow cannot be changed.'}</p>}</article>})}</div>{error&&<div className="selectionError">{error}</div>}{!readOnly&&<label className="checkboxField" style={{marginTop:20}}><input type="checkbox" checked={policyAccepted} onChange={e=>setPolicyAccepted(e.target.checked)}/><span>{hasExistingSchedule?'I understand that saving a changed schedule uses my one meal-selection change until the plan renews.':'I understand that after this initial selection I can change the weekly meal selection only once until the plan renews.'}</span></label>}<div className="selectionSaveBar"><div><strong>{Object.values(selected).filter(Boolean).length}</strong><span> meals selected for this week</span></div>{readOnly?<a className="button buttonSecondary" href="/account">Back to account</a>:<button className="button buttonPrimary" type="submit" disabled={saving||!policyAccepted}>{saving?'Saving selections…':hasExistingSchedule?'Use meal change & save':'Confirm meals & save'}</button>}</div></form><SiteFooter/></main>;
}
