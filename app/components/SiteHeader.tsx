'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SiteHeader() {
  const [authState,setAuthState]=useState<'loading'|'in'|'out'>('loading');

  useEffect(()=>{
    let mounted=true;
    fetch('/api/customer/me',{cache:'no-store'})
      .then(response=>{if(mounted)setAuthState(response.ok?'in':'out');})
      .catch(()=>{if(mounted)setAuthState('out');});
    return()=>{mounted=false;};
  },[]);

  async function signOut(){
    await fetch('/api/customer/logout',{method:'POST'});
    setAuthState('out');
    window.location.href='/';
  }

  return (
    <>
      <div className="announcement">Nutripacks testing environment • Orders activate immediately • No payment required</div>
      <header className="siteHeader">
        <Link className="brandLockup" href="/">
          <span className="brandMark">N</span>
          <span>
            <strong>Nutripacks</strong>
            <small>smart nutrition, delivered</small>
          </span>
        </Link>
        <nav className="siteNav" aria-label="Main navigation">
          <Link href="/#plans">Plans</Link>
          <Link href="/menu">Menu</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <div className="headerActions">
          {authState==='in'&&<>
            <button className="textLink" type="button" onClick={signOut}>Sign out</button>
            <Link className="button buttonSecondary buttonSmall" href="/account">My account</Link>
          </>}
          {authState==='out'&&<>
            <Link className="textLink" href="/login">Sign in</Link>
            <Link className="button buttonPrimary buttonSmall" href="/signup">Get started</Link>
          </>}
        </div>
      </header>
    </>
  );
}
