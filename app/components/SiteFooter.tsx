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
    <footer className="siteFooter">
      <div className="footerGrid">
        <div className="footerBrand">
          <Link className="brandLockup footerLockup" href="/">
            <BrandLogo/>
            <span><strong>Nutripacks</strong><small>smart nutrition, delivered</small></span>
          </Link>
          <p>Fresh meals, clear nutrition and flexible delivery planning for a healthier routine.</p>
        </div>

        <div>
          <h4>Explore</h4>
          <Link href="/#plans">Meal plans</Link>
          <Link href="/menu">Menu</Link>
          <Link href="/#how">How it works</Link>
        </div>

        <div>
          <h4>Support</h4>
          <Link href="/#faq">FAQ</Link>
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
        <span>© 2026 Nutripacks. All rights reserved.</span>
        <span>Built for Qatar • QIIB card gateway integration pending</span>
      </div>

      <style jsx>{`
        .footerLinkButton {
          width: fit-content;
          padding: 0;
          border: 0;
          background: transparent;
          color: #5b716c;
          font: inherit;
          text-align: left;
          cursor: pointer;
          transition: color .18s ease;
        }
        .footerLinkButton:hover { color: #a92f2b; }
      `}</style>
    </footer>
  );
}
