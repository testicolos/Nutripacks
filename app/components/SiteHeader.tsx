'use client';

import Link from 'next/link';
import BrandLogo from './BrandLogo';
import { signOutCustomer, useCustomerAuth } from './useCustomerAuth';

export default function SiteHeader() {
  const authState = useCustomerAuth();

  async function signOut() {
    await signOutCustomer();
    window.location.href = '/';
  }

  return (
    <>
      <div className="announcement">Nutripacks testing environment • Orders activate immediately • No payment required</div>
      <header className="siteHeader">
        <Link className="brandLockup" href="/">
          <BrandLogo/>
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
          {authState === 'in' && <>
            <button className="textLink" type="button" onClick={signOut} style={{background:'transparent',border:0,padding:0,cursor:'pointer'}}>Sign out</button>
            <Link className="button buttonSecondary buttonSmall" href="/account">My account</Link>
          </>}
          {authState === 'out' && <>
            <Link className="textLink" href="/login">Sign in</Link>
            <Link className="button buttonPrimary buttonSmall" href="/signup">Get started</Link>
          </>}
        </div>
      </header>
    </>
  );
}
