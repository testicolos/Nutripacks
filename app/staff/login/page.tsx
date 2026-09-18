'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import BrandLogo from '../../components/BrandLogo';

export default function StaffLoginPage(){
  const router=useRouter();
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault(); setLoading(true); setError('');
    const form=new FormData(event.currentTarget);
    const response=await fetch('/api/staff/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:form.get('username'),password:form.get('password')})});
    const data=await response.json(); setLoading(false);
    if(!response.ok){setError(data.error||'Unable to sign in.');return;}
    router.push(data.role==='admin'?'/admin':'/staff'); router.refresh();
  }
  return <main className="staffLoginShell"><div className="staffLoginCard"><a className="brandLockup staffBrand" href="/"><BrandLogo/><span><strong>Nutripacks</strong><small>operations portal</small></span></a><span className="eyebrow">Staff access</span><h1>Chef, sales & admin sign in.</h1><p>Use your assigned Nutripacks staff account. Customer accounts cannot sign in here.</p><form className="formGrid" onSubmit={submit}><label className="field full"><span>Username</span><input name="username" autoComplete="username" required/></label><label className="field full"><span>Password</span><input name="password" type="password" autoComplete="current-password" required/></label>{error&&<p className="selectionError full">{error}</p>}<button className="button buttonPrimary fullButton" disabled={loading}>{loading?'Signing in…':'Sign in to operations'}</button></form><a className="staffBackLink" href="/">← Back to customer website</a></div></main>;
}
