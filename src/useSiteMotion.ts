import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Progressive enhancement: content stays readable when animations are unavailable. */
export function useSiteMotion() {
  const { pathname } = useLocation();
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let dispose = () => {};
    function start() {
      dispose();
      if (preference.matches || !('IntersectionObserver' in window)) return;
      const seen = new WeakSet<Element>();
      const animations = new Set<Animation>();
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          const element = entry.target as HTMLElement;
          const siblings = element.parentElement?.children;
          const index = siblings ? Array.from(siblings).indexOf(element) : 0;
          const stagger = element.matches('.product-card, .category-card, .world-card') ? Math.min(index % 4, 3) * 85 : 0;
          const animation = element.animate([
            { opacity: 0, transform: 'translateY(18px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ], { duration: 600, delay: stagger, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        }
      }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
      function scan() {
        document.querySelectorAll('#main .section-heading, #main .category-card, #main .product-card, #main .editorial-image, #main .editorial-copy, #main .local-section > div, #main .world-card, #main .story-copy, #main .service-title, #main .service-list > div, #main .selection-note, .contact-strip > div').forEach(element => {
          if (!seen.has(element)) { seen.add(element); observer.observe(element); }
        });
      }
      scan();
      const mutations = new MutationObserver(scan);
      const main = document.getElementById('main');
      if (main) mutations.observe(main, { childList: true, subtree: true });
      dispose = () => {
        observer.disconnect();
        mutations.disconnect();
        animations.forEach(animation => animation.cancel());
        animations.clear();
      };
    }
    start();
    preference.addEventListener('change', start);
    return () => { dispose(); preference.removeEventListener('change', start); };
  }, [pathname]);
}
