'use client';

import Link from 'next/link';
import BrandLogo from './BrandLogo';
import { signOutCustomer, useCustomerAuth } from './useCustomerAuth';

export default function SiteFooter() {
  const authState = useCustomerAuth();

  async function signOut() {
    await signOutCustomer();
    window.location.href = '/';
  }

  return (
    <footer className="siteFooter" id="contact">
      <div className="footerGrid">
        <div className="footerBrand">
          <Link className="brandLockup footerLockup" href="/" aria-label="Nutri Packs home">
            <div className="brandLogoHost" aria-hidden="true">
              <BrandLogo/>
            </div>
            <span className="footerBrandText"><strong>Nutri Packs</strong><small>fresh meals • brighter days</small></span>
          </Link>
          <p>Healthy meals, happier routines and a simpler way to plan nutrition in Qatar.</p>
          <strong className="footerTagline">Good Food.<br/>Brighter Days ♡</strong>
        </div>

        <div>
          <h4>Quick Links</h4>
          <Link href="/#top">Home</Link>
          <Link href="/#plans">Our Plans</Link>
          <Link href="/menu">Menu</Link>
          <Link href="/#about">About Us</Link>
          <Link href="/#how">How It Works</Link>
        </div>

        <div>
          <h4>Contact Us</h4>
          <a href="mailto:support@nutripacks.qa">support@nutripacks.qa</a>
          <span>Doha, Qatar</span>
          <Link href="/staff/login">Staff portal</Link>
        </div>

        <div>
          <h4>Account</h4>
          {authState === 'out' && <>
            <Link href="/login">Sign in</Link>
            <Link href="/signup">Create account</Link>
          </>}
          {authState === 'in' && <>
            <Link href="/account">My account</Link>
            <button className="footerLinkButton" type="button" onClick={signOut}>Sign out</button>
          </>}
        </div>
      </div>

      <div className="footerBottom">
        <span>© 2026 Nutri Packs. All rights reserved.</span>
        <span>Made for healthier routines in Qatar ♥</span>
      </div>
    </footer>
  );
}
