'use client';

import { useEffect } from 'react';

export default function MotionEnhancer() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const selectors = [
      '[data-reveal]',
      '.pageHero > .contentWidth',
      '.planDetailHero',
      '.onboardingIntro',
      '.checkoutMain > h1',
      '.accountHero',
      '.staffHero',
      '.staffStats > div',
      '.staffPanel',
      '.formCard',
      '.dashboardPanel',
      '.adminMain > .card',
      '.menuPageGrid .mealCard'
    ].join(',');

    const targets = Array.from(document.querySelectorAll<HTMLElement>(selectors));
    const unique = Array.from(new Set(targets));

    unique.forEach((el, index) => {
      el.classList.add('reveal-ready');
      el.style.setProperty('--reveal-delay', `${Math.min((index % 4) * 55, 165)}ms`);
    });

    if (reduced || !('IntersectionObserver' in window)) {
      unique.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.02, rootMargin: '0px 0px -3% 0px' }
    );

    unique.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
