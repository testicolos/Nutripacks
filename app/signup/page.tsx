import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export default function SignupPage() {
  return (
    <main className="siteShell">
      <SiteHeader />
      <section className="onboardingWrap contentWidth">
        <div className="onboardingIntro">
          <span className="eyebrow">Create your account</span>
          <h1>Tell us what works for you.</h1>
          <p className="lead">This onboarding screen is ready for backend wiring. Your account, nutrition preferences and delivery profile will be stored securely once customer authentication is connected.</p>
          <div className="onboardingSteps">
            <div className="step active"><span>1</span><div><strong>Account details</strong><small>Name, email and mobile</small></div></div>
            <div className="step"><span>2</span><div><strong>Nutrition goals</strong><small>Goal and calorie preference</small></div></div>
            <div className="step"><span>3</span><div><strong>Preferences</strong><small>Allergies and meal types</small></div></div>
            <div className="step"><span>4</span><div><strong>Delivery</strong><small>Address and preferred slot</small></div></div>
          </div>
        </div>
        <div className="formCard">
          <div className="formHeader"><div><span className="eyebrow">Step 1 of 4</span><h2>Account details</h2></div><span className="secureBadge">Secure profile</span></div>
          <form className="formGrid" action="/checkout">
            <label className="field full"><span>Full name</span><input type="text" placeholder="Your full name" required /></label>
            <label className="field full"><span>Email address</span><input type="email" placeholder="you@example.com" required /></label>
            <label className="field full"><span>Mobile number</span><div className="phoneField"><span>+974</span><input type="tel" placeholder="XXXX XXXX" required /></div></label>
            <label className="field"><span>Password</span><input type="password" placeholder="Minimum 8 characters" minLength={8} required /></label>
            <label className="field"><span>Confirm password</span><input type="password" placeholder="Repeat password" minLength={8} required /></label>
            <label className="checkboxField full"><input type="checkbox" required /><span>I agree to the Nutripacks terms and privacy policy.</span></label>
            <button className="button buttonPrimary fullButton" type="submit">Continue to preferences →</button>
          </form>
          <p className="formNote">Already have an account? <a href="#">Sign in</a></p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
