document.addEventListener('DOMContentLoaded', function () {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var carousel = hero.querySelector('.hero-carousel');
    var wrappers = Array.prototype.slice.call(hero.querySelectorAll('.hero-img-wrapper'));
    var buttons = Array.prototype.slice.call(hero.querySelectorAll('.hero-btn'));
    var paginationDot = hero.querySelector('.pagination-dot');
    var intervalId = null;
    var current = 0;
    var autoplayDelay = 5000;

    function activateImage(idx) {
        wrappers.forEach(function (w) { w.classList.remove('active'); var bar = w.querySelector('.hero-progress__bar'); if (bar) { bar.style.animation = 'none'; bar.style.width = '0%'; } });
        buttons.forEach(function (b) { b.classList.remove('active'); });
        if (paginationDot) paginationDot.classList.remove('active');

        var w = wrappers[idx];
        if (w) {
            w.classList.add('active');
            w.style.setProperty('--progress-duration', (autoplayDelay / 1000) + 's');
            var bar = w.querySelector('.hero-progress__bar');
            if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = 'heroProgressFill ' + (autoplayDelay / 1000) + 's linear forwards'; }
        }

        var btn = buttons[idx];
        if (btn) btn.classList.add('active');
        if (paginationDot) paginationDot.classList.add('active');
    }

    function startAutoplay() {
        if (intervalId) return;
        wrappers.forEach(function (w) { w.classList.remove('active'); var bar = w.querySelector('.hero-progress__bar'); if (bar) { bar.style.animation = 'none'; bar.style.width = '0%'; } });
        activateImage(current);
        intervalId = setInterval(function () {
            current = (current + 1) % wrappers.length;
            activateImage(current);
        }, autoplayDelay);
    }

    function pauseAutoplay() {
        if (intervalId) { clearInterval(intervalId); intervalId = null; }
        wrappers.forEach(function (w) { var bar = w.querySelector('.hero-progress__bar'); if (bar) { bar.style.animation = 'none'; bar.style.width = '0%'; } });
    }

    function resumeAutoplay() {
        if (intervalId) return;
        wrappers.forEach(function (w) { var bar = w.querySelector('.hero-progress__bar'); if (bar) { bar.style.animation = 'none'; bar.style.width = '0%'; } });
        activateImage(current);
        intervalId = setInterval(function () {
            current = (current + 1) % wrappers.length;
            activateImage(current);
        }, autoplayDelay);
    }

    // Event listeners for manual navigation buttons
    buttons.forEach(function (btn, idx) {
        btn.addEventListener('click', function () {
            current = idx;
            pauseAutoplay();
            activateImage(current);
            resumeAutoplay();
        });
    });

    // Start on page load
    startAutoplay();
});
