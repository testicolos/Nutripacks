import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export default function CheckoutPage() {
  return (
    <main className="siteShell">
      <SiteHeader />
      <section className="contentWidth checkoutWrap">
        <div className="checkoutMain">
          <div className="checkoutBanner"><strong>Card checkout preview</strong><span>QIIB merchant credentials are not connected yet. No card data is collected on this screen.</span></div>
          <span className="eyebrow">Checkout</span>
          <h1>Review your plan.</h1>
          <div className="checkoutSection">
            <div className="checkoutSectionHeading"><h2>Delivery details</h2><span>1</span></div>
            <div className="formGrid">
              <label className="field full"><span>Delivery address</span><input type="text" placeholder="Building, street, zone" /></label>
              <label className="field"><span>Start date</span><input type="date" /></label>
              <label className="field"><span>Preferred delivery slot</span><select defaultValue="evening"><option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option></select></label>
            </div>
          </div>
          <div className="checkoutSection">
            <div className="checkoutSectionHeading"><h2>Card payment</h2><span>2</span></div>
            <div className="cardPaymentMock">
              <div className="cardLogos"><span>VISA</span><span>Mastercard</span><span>Qatar Debit</span></div>
              <label className="field full"><span>Card number</span><input type="text" placeholder="Will be handled securely by QIIB" disabled /></label>
              <div className="formGrid"><label className="field"><span>Expiry</span><input type="text" placeholder="MM / YY" disabled /></label><label className="field"><span>CVV</span><input type="text" placeholder="•••" disabled /></label></div>
              <p className="paymentNote">When QIIB integration is live, card details will be entered through the bank&apos;s secure payment flow rather than stored by Nutripacks.</p>
            </div>
          </div>
        </div>
        <aside className="orderSummary">
          <span className="eyebrow">Order summary</span>
          <h2>Performance</h2>
          <div className="summaryImage"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85" alt="Performance meal" /></div>
          <div className="summaryLine"><span>30-day package</span><strong>QAR 2,700</strong></div>
          <div className="summaryLine"><span>Delivery</span><strong>Included</strong></div>
          <div className="summaryDivider" />
          <div className="summaryTotal"><span>Total</span><strong>QAR 2,700</strong></div>
          <button className="button buttonDisabled" disabled>QIIB payment setup pending</button>
          <small className="summaryHelp">No payment will be attempted until the bank gateway is connected and tested.</small>
        </aside>
      </section>
      <SiteFooter />
    </main>
  );
}
