'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export default function LoginPage(){
 const router=useRouter(); const [loading,setLoading]=useState(false); const [error,setError]=useState('');
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setLoading(true);setError('');const form=new FormData(event.currentTarget);const response=await fetch('/api/customer/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:form.get('email'),password:form.get('password')})});const result=await response.json();setLoading(false);if(!response.ok){setError(result.error||'Unable to sign in.');return;}const next=new URLSearchParams(window.location.search).get('next');router.push(next&&next.startsWith('/')?next:'/account');router.refresh();}
 return <main className="siteShell"><SiteHeader/><section className="onboardingWrap contentWidth"><div className="onboardingIntro"><span className="eyebrow">Welcome back</span><h1>Sign in to manage your Nutripacks plan.</h1><p className="lead">Your package, delivery profile and live meal schedule stay together in one account.</p><div className="accountPlanCard"><span>Secure customer access</span><strong>30-day session</strong><small>Your session is stored in an HTTP-only cookie.</small></div></div><div className="formCard"><div className="formHeader"><div><span className="eyebrow">Customer login</span><h2>Sign in</h2></div><span className="secureBadge">Secure</span></div><form className="formGrid" onSubmit={submit}><label className="field full"><span>Email or username</span><input name="email" type="text" placeholder="you@example.com or basic" autoComplete="username" required/></label><label className="field full"><span>Password</span><input name="password" type="password" placeholder="Your password" autoComplete="current-password" required/></label>{error&&<p className="formNote full" style={{color:'#a33'}}>{error}</p>}<button className="button buttonPrimary fullButton" disabled={loading}>{loading?'Signing in…':'Sign in →'}</button></form><p className="formNote">New to Nutripacks? <a href="/signup">Create an account</a></p></div></section><SiteFooter/></main>;
}
