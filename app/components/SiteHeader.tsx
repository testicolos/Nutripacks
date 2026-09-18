'use client';

import Link from 'next/link';
import BrandLogo from './BrandLogo';
import { signOutCustomer, useCustomerAuth } from './useCustomerAuth';

function UserIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/></svg>;
}

export default function SiteHeader() {
  const authState = useCustomerAuth();

  async function signOut() {
    await signOutCustomer();
    window.location.href = '/';
  }

  return (
    <header className="siteHeader referenceHeader">
      <Link className="brandLockup referenceBrand" href="/#top" aria-label="Nutri Packs home">
        <div className="brandLogoHost" aria-hidden="true">
          <BrandLogo />
        </div>
      </Link>

      <nav className="siteNav referenceNav" aria-label="Main navigation">
        <Link href="/#top">Home</Link>
        <Link href="/#plans">Our Plans</Link>
        <Link href="/menu">Menu</Link>
        <Link href="/#about">About Us</Link>
        <Link href="/#how">How It Works</Link>
        <Link href="/#contact">Contact</Link>
      </nav>

      <div className="headerActions referenceHeaderActions">
        {authState === 'in' ? (
          <>
            <button className="headerIconLink signOutLink" type="button" onClick={signOut}>
              <UserIcon />
              <span>Sign out</span>
            </button>
            <Link className="button buttonPrimary buttonSmall" href="/account">My Account →</Link>
          </>
        ) : (
          <>
            <Link className="headerIconLink" href="/login">
              <UserIcon />
              <span>Sign In</span>
            </Link>
            <Link className="button buttonPrimary buttonSmall" href="/signup">Get Started →</Link>
          </>
        )}
      </div>
    </header>
  );
}
