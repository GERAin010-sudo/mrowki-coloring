/* ============================================
   MRÓWKI COLORING — Animations Controller
   ============================================ */

class AnimationsController {
  constructor() {
    this.observer = null;
    this.scrollProgress = null;
    this.countersAnimated = false;
    this.init();
  }

  init() {
    this.setupScrollReveal();
    this.setupScrollProgress();
    this.setupParallax();
    this.setupCounters();
  }

  /* Scroll reveal using IntersectionObserver */
  setupScrollReveal() {
    const options = {
      root: null,
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Unobserve after reveal to save resources
          if (!entry.target.dataset.keepObserving) {
            this.observer.unobserve(entry.target);
          }
        }
      });
    }, options);

    // Observe all revealable elements
    this.observeElements();
  }

  observeElements() {
    const selectors = [
      '.reveal',
      '.reveal-left',
      '.reveal-right',
      '.reveal-scale',
      '.stagger-children'
    ];
    
    document.querySelectorAll(selectors.join(',')).forEach(el => {
      this.observer.observe(el);
    });
  }

  /* Re-observe after page navigation */
  refresh() {
    requestAnimationFrame(() => {
      this.observeElements();
      this.countersAnimated = false;
      this.setupCounters();
    });
  }

  /* Scroll progress bar */
  setupScrollProgress() {
    this.scrollProgress = document.querySelector('.scroll-progress');
    if (!this.scrollProgress) return;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      this.scrollProgress.style.width = `${progress}%`;
    }, { passive: true });
  }

  /* Simple parallax on hero background */
  setupParallax() {
    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg) return;

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    }, { passive: true });
  }

  /* Animated counters */
  setupCounters() {
    const counterEls = document.querySelectorAll('[data-count]');
    if (counterEls.length === 0) return;

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          this.animateCounter(entry.target);
          entry.target.dataset.counted = 'true';
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counterEls.forEach(el => counterObserver.observe(el));
  }

  animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 2000;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      el.textContent = `${prefix}${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = `${prefix}${target}${suffix}`;
      }
    };

    requestAnimationFrame(update);
  }
}

// Export for use in app.js
window.AnimationsController = AnimationsController;
