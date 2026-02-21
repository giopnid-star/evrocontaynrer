document.addEventListener('DOMContentLoaded', function () {
  const slider = document.querySelector('.reviews-slider');
  if (!slider) return;
  const slides = Array.from(slider.querySelectorAll('.review-slide'));
  const btnPrev = slider.querySelector('.reviews-btn-prev');
  const btnNext = slider.querySelector('.reviews-btn-next');
  let current = slides.findIndex(s => s.classList.contains('active'));
  if (current < 0) current = 0;

  function showSlide(idx) {
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === idx);
    });
  }

  btnPrev && btnPrev.addEventListener('click', function () {
    current = (current - 1 + slides.length) % slides.length;
    showSlide(current);
  });

  btnNext && btnNext.addEventListener('click', function () {
    current = (current + 1) % slides.length;
    showSlide(current);
  });

  // Swipe support for mobile
  let startX = null;
  slider.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
  });
  slider.addEventListener('touchend', function (e) {
    if (startX === null) return;
    const endX = e.changedTouches[0].clientX;
    if (endX - startX > 40) {
      btnPrev && btnPrev.click();
    } else if (startX - endX > 40) {
      btnNext && btnNext.click();
    }
    startX = null;
  });
});
