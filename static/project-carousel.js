document.addEventListener('DOMContentLoaded', function () {
    // Initialize carousel for each project card
    var projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(function(card) {
        var images = card.querySelectorAll('.carousel-image');
        if (images.length <= 1) return; // Skip if only one image
        
        var currentIndex = 0;
        var autoplayIntervalId = null;
        var autoplayDelay = 4000;
        var carousel = card.querySelector('.project-carousel');
        var prevBtn = card.querySelector('.carousel-btn-prev');
        var nextBtn = card.querySelector('.carousel-btn-next');
        
        function showImage(idx) {
            images.forEach(function(img) {
                img.classList.remove('active');
            });
            images[idx].classList.add('active');
            currentIndex = idx;
            updateDots();
        }
        
        function updateDots() {
            var dots = card.querySelectorAll('.carousel-dot');
            dots.forEach(function(dot, idx) {
                dot.classList.toggle('active', idx === currentIndex);
            });
        }
        
        function nextImage() {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        }
        
        function prevImage() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
        }
        
        function startAutoplay() {
            if (autoplayIntervalId) return;
            autoplayIntervalId = setInterval(nextImage, autoplayDelay);
        }
        
        function stopAutoplay() {
            if (autoplayIntervalId) {
                clearInterval(autoplayIntervalId);
                autoplayIntervalId = null;
            }
        }
        
        function resetAutoplay() {
            stopAutoplay();
            startAutoplay();
        }
        
        // Event listeners for navigation buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                prevImage();
                resetAutoplay();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                nextImage();
                resetAutoplay();
            });
        }
        
        // Dot navigation
        var dots = card.querySelectorAll('.carousel-dot');
        dots.forEach(function(dot, idx) {
            dot.addEventListener('click', function(e) {
                e.stopPropagation();
                currentIndex = idx;
                showImage(currentIndex);
                resetAutoplay();
            });
        });
        
        // Pause autoplay on hover, resume on leave
        if (carousel) {
            carousel.addEventListener('mouseenter', stopAutoplay);
            carousel.addEventListener('mouseleave', startAutoplay);
        }
        
        // Initialize
        showImage(0);
        startAutoplay();
    });
});
