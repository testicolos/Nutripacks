import Link from 'next/link';

export default function SiteHeader() {
  return (
    <>
      <div className="announcement">Fresh meal plans built for Doha • Card payments coming via QIIB</div>
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
          <Link className="textLink" href="/signup">Sign in</Link>
          <Link className="button buttonPrimary buttonSmall" href="/signup">Get started</Link>
        </div>
      </header>
    </>
  );
}
