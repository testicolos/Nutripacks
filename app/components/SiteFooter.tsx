import Link from 'next/link';

export default function SiteFooter() {
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
        <div><h4>Explore</h4><Link href="/#plans">Meal plans</Link><Link href="/menu">Menu</Link><Link href="/#how">How it works</Link></div>
        <div><h4>Support</h4><Link href="/#faq">FAQ</Link><a href="mailto:support@nutripacks.qa">support@nutripacks.qa</a><span>Doha, Qatar</span></div>
        <div><h4>Account</h4><Link href="/signup">Create account</Link><Link href="/signup">Sign in</Link><Link href="/admin">Admin access</Link></div>
      </div>
      <div className="footerBottom"><span>© 2026 Nutripacks. All rights reserved.</span><span>Built for Qatar • QIIB card gateway integration pending</span></div>
    </footer>
  );
}
