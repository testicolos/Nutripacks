import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export default function CheckoutPage(){
  return <main className="siteShell"><SiteHeader/>
    <section className="contentWidth checkoutWrap">
      <div className="checkoutMain">
        <div className="testingBanner"><strong>Testing environment</strong><span>Payment is disabled. Orders activate after a complete meal schedule is saved.</span></div>
        <span className="eyebrow">Order flow</span><h1>No checkout step is required right now.</h1>
        <div className="checkoutSection"><div className="checkoutSectionHeading"><h2>How to place a test order</h2><span>1</span></div><div className="featureList"><div className="featureListItem"><span className="checkIcon">1</span><span>Create or sign in to your customer account.</span></div><div className="featureListItem"><span className="checkIcon">2</span><span>Choose a package from the homepage.</span></div><div className="featureListItem"><span className="checkIcon">3</span><span>Select every required meal for the delivery week.</span></div><div className="featureListItem"><span className="checkIcon">4</span><span>Save the schedule. The order becomes active immediately.</span></div></div></div>
        <div className="heroActions"><a className="button buttonPrimary" href="/#plans">Choose a package</a><a className="button buttonSecondary" href="/account">Open my account</a></div>
      </div>
      <aside className="orderSummary"><span className="eyebrow">Testing mode</span><h2>Payment removed</h2><p className="lead" style={{fontSize:15}}>The payment gateway, card form and payment status controls are intentionally hidden until production payment integration is ready.</p><div className="summaryDivider"/><div className="summaryLine"><span>Customer flow</span><strong>Active</strong></div><div className="summaryLine"><span>Meal selection</span><strong>Active</strong></div><div className="summaryLine"><span>Chef / Sales schedule</span><strong>Active</strong></div></aside>
    </section><SiteFooter/></main>;
}
