'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SiteFooter() {
  const [authState, setAuthState] = useState<'loading' | 'in' | 'out'>('loading');

  useEffect(() => {
    let mounted = true;
    fetch('/api/customer/me', { cache: 'no-store' })
      .then(response => { if (mounted) setAuthState(response.ok ? 'in' : 'out'); })
      .catch(() => { if (mounted) setAuthState('out'); });
    return () => { mounted = false; };
  }, []);

  async function signOut() {
    await fetch('/api/customer/logout', { method: 'POST' });
    setAuthState('out');
    window.location.href = '/';
  }

  return (
    <footer className="siteFooter">
      <div className="footerGrid">
        <div className="footerBrand">
          <Link className="brandLockup footerLockup" href="/">
            <span className="brandMark">N</span>
            <span><strong>Nutripacks</strong><small>smart nutrition, delivered</small></span>
          </Link>
          <p>Balanced meal plans with clear macros, flexible choices and simple delivery management.</p>
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
          <Link className="footerStaffLink" href="/staff/login">Staff portal</Link>
        </div>

        <div>
          <h4>Account</h4>
          {authState === 'loading' && <span className="footerAccountState">Checking account…</span>}
          {authState === 'out' && <>
            <Link href="/login">Sign in</Link>
            <Link href="/signup">Create account</Link>
          </>}
          {authState === 'in' && <>
            <Link href="/account">My account</Link>
            <Link href="/account">Manage plan & deliveries</Link>
            <button className="footerLinkButton" type="button" onClick={signOut}>Sign out</button>
          </>}
        </div>
      </div>

      <div className="footerBottom">
        <span>© 2026 Nutripacks. All rights reserved.</span>
        <span>Built for Qatar • QIIB card gateway integration pending</span>
      </div>
    </footer>
  );
}
