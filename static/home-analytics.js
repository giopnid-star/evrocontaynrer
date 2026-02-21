(() => {
  const fired = {
    scroll50: false,
    scroll90: false,
    trustVisible: false
  };

  const track = (eventName, params = {}) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        page_path: window.location.pathname,
        ...params
      });
    }
  };

  const handleClickTracking = (event) => {
    const target = event.target.closest('[data-track], a, button');
    if (!target) return;

    const explicitTrack = target.getAttribute('data-track');
    if (explicitTrack) {
      track(explicitTrack);
    }

    if (target.tagName === 'A') {
      const href = target.getAttribute('href') || '';
      if (href.startsWith('tel:')) {
        track('phone_click', { href });
      }
      if (href.includes('wa.me') || href.toLowerCase().includes('whatsapp')) {
        track('whatsapp_click', { href });
      }
    }
  };

  const handleFormSubmitTracking = (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    const formId = form.id || form.getAttribute('name') || 'form';
    track('form_submit', { form_id: formId });
  };

  const handleScrollTracking = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const viewport = window.innerHeight;
    const height = document.documentElement.scrollHeight;

    if (!height) return;

    const depth = ((scrollTop + viewport) / height) * 100;

    if (!fired.scroll50 && depth >= 50) {
      fired.scroll50 = true;
      track('scroll_50');
    }

    if (!fired.scroll90 && depth >= 90) {
      fired.scroll90 = true;
      track('scroll_90');
    }
  };

  const observeTrustSection = () => {
    const trustSection = document.getElementById('trust-cases');
    if (!trustSection || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !fired.trustVisible) {
          fired.trustVisible = true;
          track('trust_cases_view');
          observer.disconnect();
        }
      });
    }, { threshold: 0.35 });

    observer.observe(trustSection);
  };

  document.addEventListener('click', handleClickTracking, true);
  document.addEventListener('submit', handleFormSubmitTracking, true);

  window.addEventListener('quiz:completed', (event) => {
    const detail = event.detail || {};
    track('quiz_completed', {
      quiz_type: detail.type || 'unknown',
      quiz_size: detail.size || 'unknown',
      quiz_budget: detail.budget || 'unknown',
      quiz_deadline: detail.deadline || 'unknown',
      quiz_estimate: detail.estimate || 0
    });
  });

  window.addEventListener('scroll', handleScrollTracking, { passive: true });
  window.addEventListener('load', () => {
    handleScrollTracking();
    observeTrustSection();
  });
})();
