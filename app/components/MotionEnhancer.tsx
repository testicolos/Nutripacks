'use client';

import { useEffect } from 'react';

const TESTIMONIAL_PORTRAITS = [
  {
    src: 'https://images.unsplash.com/photo-1750190321935-6cf17625b498?auto=format&fit=crop&w=320&h=320&q=88',
    alt: 'Customer portrait in Doha'
  },
  {
    src: 'https://images.pexels.com/photos/29492860/pexels-photo-29492860.jpeg?auto=compress&cs=tinysrgb&w=320&h=320',
    alt: 'Qatari customer in traditional attire'
  },
  {
    src: 'https://images.unsplash.com/photo-1750190321863-92fa844cf423?auto=format&fit=crop&w=320&h=320&q=88',
    alt: 'Customer portrait in Doha'
  }
];

export default function MotionEnhancer() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll<HTMLImageElement>('.finalCommunityGrid article img').forEach((image, index) => {
      const portrait = TESTIMONIAL_PORTRAITS[index];
      if (!portrait) return;
      image.src = portrait.src;
      image.alt = portrait.alt;
      image.loading = 'lazy';
      image.decoding = 'async';
    });

    const selectors = [
      '[data-reveal]',
      '.finalBenefitGrid article',
      '.finalHomeFilters span',
      '.finalCtaBenefits span',
      '.footerGrid > div',
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
      el.style.setProperty('--reveal-delay', `${Math.min((index % 5) * 58, 232)}ms`);
    });

    let observer: IntersectionObserver | null = null;

    if (reduced || !('IntersectionObserver' in window)) {
      unique.forEach(el => el.classList.add('is-visible'));
    } else {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            (entry.target as HTMLElement).classList.add('is-visible');
            observer?.unobserve(entry.target);
          });
        },
        { threshold: 0.04, rootMargin: '0px 0px -2% 0px' }
      );

      unique.forEach(el => observer?.observe(el));
    }

    const heroVisual = document.querySelector<HTMLElement>('.finalHeroVisual');
    let animationFrame = 0;

    const resetParallax = () => {
      if (!heroVisual) return;
      heroVisual.style.setProperty('--hero-shift-x', '0px');
      heroVisual.style.setProperty('--hero-shift-y', '0px');
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (reduced || !heroVisual) return;
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - 0.5) * 18;
        const y = (event.clientY / window.innerHeight - 0.5) * 12;
        heroVisual.style.setProperty('--hero-shift-x', `${x.toFixed(2)}px`);
        heroVisual.style.setProperty('--hero-shift-y', `${y.toFixed(2)}px`);
      });
    };

    const header = document.querySelector<HTMLElement>('.siteHeader');
    const handleScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 18);

    if (!reduced) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      document.documentElement.addEventListener('mouseleave', resetParallax);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('mouseleave', resetParallax);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return null;
}
