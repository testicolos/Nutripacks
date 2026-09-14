'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError('');
    const form = new FormData(event.currentTarget);
    if (form.get('password') !== form.get('confirmPassword')) {
      setLoading(false); return setError('Passwords do not match.');
    }
    const response = await fetch('/api/customer/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: form.get('fullName'), email: form.get('email'), phone: form.get('phone'), password: form.get('password') })
    });
    const result = await response.json(); setLoading(false);
    if (!response.ok) return setError(result.error || 'Unable to create account.');
    setStep(2);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>, nextStep: number) {
    event.preventDefault(); setLoading(true); setError('');
    const form = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = {};
    if (step === 2) { payload.goal = form.get('goal'); payload.caloriePreference = form.get('caloriePreference'); }
    if (step === 3) {
      payload.dietaryPreferences = String(form.get('dietaryPreferences') || '').split(',').map(v => v.trim()).filter(Boolean);
      payload.allergies = String(form.get('allergies') || '').split(',').map(v => v.trim()).filter(Boolean);
    }
    if (step === 4) { payload.deliveryAddress = form.get('deliveryAddress'); payload.deliveryZone = form.get('deliveryZone'); payload.deliverySlot = form.get('deliverySlot'); }
    const response = await fetch('/api/customer/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json(); setLoading(false);
    if (!response.ok) return setError(result.error || 'Unable to save your profile.');
    if (nextStep > 4) { router.push('/account'); router.refresh(); } else setStep(nextStep);
  }

  const titles = ['Account details', 'Nutrition goals', 'Preferences', 'Delivery'];

  return (
    <main className="siteShell">
      <SiteHeader />
      <section className="onboardingWrap contentWidth">
        <div className="onboardingIntro">
          <span className="eyebrow">Create your account</span>
          <h1>Tell us what works for you.</h1>
          <p className="lead">Your profile controls the nutrition and delivery experience around your plan.</p>
          <div className="onboardingSteps">
            {titles.map((title, index) => <div className={`step ${step === index + 1 ? 'active' : ''}`} key={title}><span>{index + 1}</span><div><strong>{title}</strong><small>{index === 0 ? 'Name, email and mobile' : index === 1 ? 'Goal and calories' : index === 2 ? 'Diet and allergies' : 'Address and preferred slot'}</small></div></div>)}
          </div>
        </div>
        <div className="formCard">
          <div className="formHeader"><div><span className="eyebrow">Step {step} of 4</span><h2>{titles[step - 1]}</h2></div><span className="secureBadge">Secure profile</span></div>

          {step === 1 && <form className="formGrid" onSubmit={register}>
            <label className="field full"><span>Full name</span><input name="fullName" type="text" placeholder="Your full name" required /></label>
            <label className="field full"><span>Email address</span><input name="email" type="email" placeholder="you@example.com" required /></label>
            <label className="field full"><span>Mobile number</span><div className="phoneField"><span>+974</span><input name="phone" type="tel" placeholder="XXXX XXXX" required /></div></label>
            <label className="field"><span>Password</span><input name="password" type="password" placeholder="Minimum 8 characters" minLength={8} required /></label>
            <label className="field"><span>Confirm password</span><input name="confirmPassword" type="password" placeholder="Repeat password" minLength={8} required /></label>
            <label className="checkboxField full"><input type="checkbox" required /><span>I agree to the Nutripacks terms and privacy policy.</span></label>
            {error && <p className="formNote full" style={{ color: '#a33' }}>{error}</p>}
            <button className="button buttonPrimary fullButton" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Continue to goals →'}</button>
          </form>}

          {step === 2 && <form className="formGrid" onSubmit={(e) => saveProfile(e, 3)}>
            <label className="field full"><span>Main goal</span><select name="goal" defaultValue="balanced"><option value="balanced">Balanced nutrition</option><option value="fat_loss">Fat loss</option><option value="performance">Performance</option><option value="muscle_gain">Muscle gain</option></select></label>
            <label className="field full"><span>Daily calorie preference</span><input name="caloriePreference" type="number" min="1000" max="5000" placeholder="e.g. 2000" /></label>
            {error && <p className="formNote full" style={{ color: '#a33' }}>{error}</p>}
            <button className="button buttonPrimary fullButton" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Continue to preferences →'}</button>
          </form>}

          {step === 3 && <form className="formGrid" onSubmit={(e) => saveProfile(e, 4)}>
            <label className="field full"><span>Dietary preferences</span><input name="dietaryPreferences" type="text" placeholder="e.g. high protein, low carb (comma separated)" /></label>
            <label className="field full"><span>Allergies</span><input name="allergies" type="text" placeholder="e.g. nuts, dairy (comma separated)" /></label>
            {error && <p className="formNote full" style={{ color: '#a33' }}>{error}</p>}
            <button className="button buttonPrimary fullButton" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Continue to delivery →'}</button>
          </form>}

          {step === 4 && <form className="formGrid" onSubmit={(e) => saveProfile(e, 5)}>
            <label className="field full"><span>Delivery address</span><input name="deliveryAddress" type="text" placeholder="Building, street, area" required /></label>
            <label className="field"><span>Delivery zone</span><input name="deliveryZone" type="text" placeholder="Doha / Lusail / etc." required /></label>
            <label className="field"><span>Preferred slot</span><select name="deliverySlot" defaultValue="evening"><option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option></select></label>
            {error && <p className="formNote full" style={{ color: '#a33' }}>{error}</p>}
            <button className="button buttonPrimary fullButton" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Finish setup →'}</button>
          </form>}

          <p className="formNote">Already have an account? <a href="/login">Sign in</a></p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
