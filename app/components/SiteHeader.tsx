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
    <header className="siteHeader">
      <Link className="brandLockup" href="/#top">
        <BrandLogo/>
        <span>
          <strong>Nutri Packs</strong>
          <small>fresh meals • brighter days</small>
        </span>
      </Link>

      <nav className="siteNav" aria-label="Main navigation">
        <Link href="/#top">Home</Link>
        <Link href="/#plans">Our Plans</Link>
        <Link href="/menu">Menu</Link>
        <Link href="/#about">About Us</Link>
        <Link href="/#how">How It Works</Link>
        <Link href="/#contact">Contact</Link>
      </nav>

      <div className="headerActions">
        {authState === 'in' && <>
          <button className="textLink" type="button" onClick={signOut} style={{background:'transparent',border:0,padding:0,cursor:'pointer'}}>Sign out</button>
          <Link className="button buttonSecondary buttonSmall" href="/account">My account</Link>
        </>}
        {authState === 'out' && <>
          <Link className="textLink" href="/login">Sign in</Link>
          <Link className="button buttonPrimary buttonSmall" href="/signup">Get Started →</Link>
        </>}
      </div>
    </header>
  );
}
