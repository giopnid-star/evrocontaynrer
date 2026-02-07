document.addEventListener('DOMContentLoaded', function () {
    var section = document.getElementById('why-us');
    if (!section) return;

    var slider = section.querySelector('.why-slider');
    var slides = Array.prototype.slice.call(section.querySelectorAll('.why-slide'));
    var timeouts = [];
    var intervalId = null;
    var current = -1;
    var autoplayDelay = 5000;
    var isIntersecting = false;

    function clearPending() {
        timeouts.forEach(clearTimeout);
        timeouts = [];
    }

    function startAutoplay() {
        if (intervalId) return;
        // ensure one slide is active to start
        if (current === -1) current = 0;
        slides.forEach(function (s) {
            s.classList.remove('active');
            var bar = s.querySelector('.why-progress__bar'); if (bar) { bar.style.animation = 'none'; bar.style.width = '0%'; }
        });
        var s0 = slides[current];
        if (s0) {
            s0.classList.add('active');
            s0.style.setProperty('--progress-duration', (autoplayDelay / 1000) + 's');
            var bar0 = s0.querySelector('.why-progress__bar');
            if (bar0) { bar0.style.animation = 'none'; void bar0.offsetWidth; bar0.style.animation = 'progressFill ' + (autoplayDelay / 1000) + 's linear forwards'; }
        }
        intervalId = setInterval(function () {
            slides.forEach(function (s) { s.classList.remove('active'); var bar = s.querySelector('.why-progress__bar'); if (bar) { bar.style.animation = 'none'; bar.style.width = '0%'; } });
            current = (current + 1) % slides.length;
            var s = slides[current];
            if (s) {
                s.classList.add('active');
                s.style.setProperty('--progress-duration', (autoplayDelay / 1000) + 's');
                var bar = s.querySelector('.why-progress__bar');
                if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = 'progressFill ' + (autoplayDelay / 1000) + 's linear forwards'; }
            }
        }, autoplayDelay);
    }

    function stopAutoplay() {
        if (intervalId) { clearInterval(intervalId); intervalId = null; }
        slides.forEach(function (s) { s.classList.remove('active'); var bar = s.querySelector('.why-progress__bar'); if (bar) bar.style.animation = 'none'; });
        current = -1;
    }

    function pauseAutoplay() {
        if (intervalId) { clearInterval(intervalId); intervalId = null; }
        slides.forEach(function (s) { var bar = s.querySelector('.why-progress__bar'); if (bar) { bar.style.animation = 'none'; bar.style.width = '0%'; } });
    }

    function resumeAutoplay() {
        if (intervalId) return;
        if (current === -1) {
            var existing = slides.findIndex(function (s) { return s.classList.contains('active'); });
            current = existing >= 0 ? existing : 0;
        }
        slides.forEach(function (s) { var bar = s.querySelector('.why-progress__bar'); if (bar) { bar.style.animation = 'none'; bar.style.width = '0%'; } });
        var s = slides[current];
        if (s) {
            s.classList.add('active');
            s.style.setProperty('--progress-duration', (autoplayDelay / 1000) + 's');
            var bar = s.querySelector('.why-progress__bar');
            if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = 'progressFill ' + (autoplayDelay / 1000) + 's linear forwards'; }
        }
        intervalId = setInterval(function () {
            slides.forEach(function (ss) { ss.classList.remove('active'); var bar = ss.querySelector('.why-progress__bar'); if (bar) { bar.style.animation = 'none'; bar.style.width = '0%'; } });
            current = (current + 1) % slides.length;
            var s2 = slides[current];
            if (s2) {
                s2.classList.add('active');
                s2.style.setProperty('--progress-duration', (autoplayDelay / 1000) + 's');
                var bar2 = s2.querySelector('.why-progress__bar');
                if (bar2) { bar2.style.animation = 'none'; void bar2.offsetWidth; bar2.style.animation = 'progressFill ' + (autoplayDelay / 1000) + 's linear forwards'; }
            }
        }, autoplayDelay);
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                isIntersecting = true;
                slider.setAttribute('aria-hidden', 'false');
                slider.classList.add('in-view');
                clearPending();
                slides.forEach(function (slide, i) {
                    var t = setTimeout(function () {
                        slide.classList.add('in-view');
                    }, i * 180);
                    timeouts.push(t);
                });
                // start autoplay after initial reveal completes
                var startDelay = slides.length * 180 + 300;
                setTimeout(function () { if (isIntersecting) startAutoplay(); }, startDelay);
            } else {
                isIntersecting = false;
                slider.setAttribute('aria-hidden', 'true');
                slider.classList.remove('in-view');
                clearPending();
                slides.forEach(function (slide) {
                    slide.classList.remove('in-view');
                    slide.classList.remove('active');
                    void slide.offsetHeight; // force reflow
                });
                stopAutoplay();
            }
        });
    }, { threshold: 0.35 });

    // pause/resume when user hovers/focuses a specific slide
    slides.forEach(function (slide, idx) {
        slide.addEventListener('mouseenter', function () {
            slides.forEach(function (s) { s.classList.remove('active'); });
            slide.classList.add('active');
            current = idx;
            pauseAutoplay();
        });
        slide.addEventListener('mouseleave', function () { if (isIntersecting) resumeAutoplay(); });
        slide.addEventListener('focusin', function () { slides.forEach(function (s) { s.classList.remove('active'); }); slide.classList.add('active'); current = idx; pauseAutoplay(); });
        slide.addEventListener('focusout', function () { if (isIntersecting) resumeAutoplay(); });
    });

    observer.observe(section);
});