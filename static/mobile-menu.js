// Mobile menu handler
document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.querySelector('.sidebar');
  
  // Create hamburger button if on mobile
  const createMobileMenu = () => {
    if (window.innerWidth <= 768) {
      if (!document.querySelector('.mobile-menu-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mobile-menu-toggle';
        toggleBtn.innerHTML = '☰';
        toggleBtn.setAttribute('aria-label', 'Toggle menu');
        
        // Insert after logo in header-top
        const headerTop = document.querySelector('.header-top');
        if (headerTop) {
          headerTop.insertBefore(toggleBtn, headerTop.lastChild);
        }
        
        // Add click handler
        toggleBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          sidebar.classList.toggle('active');
          toggleBtn.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
          if (!e.target.closest('.sidebar') && !e.target.closest('.mobile-menu-toggle')) {
            sidebar.classList.remove('active');
            toggleBtn.classList.remove('active');
          }
        });
        
        // Close menu when clicking on sidebar links
        const sidebarLinks = sidebar.querySelectorAll('a');
        sidebarLinks.forEach(link => {
          link.addEventListener('click', function() {
            sidebar.classList.remove('active');
            toggleBtn.classList.remove('active');
          });
        });
      }
    }
  };
  
  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      // Remove hamburger if screen is larger than 768px
      if (window.innerWidth > 768) {
        const toggleBtn = document.querySelector('.mobile-menu-toggle');
        if (toggleBtn) {
          toggleBtn.remove();
        }
        if (sidebar) {
          sidebar.classList.remove('active');
        }
      } else {
        createMobileMenu();
      }
    }, 250);
  });
  
  // Initial setup
  createMobileMenu();
  
  // Close sidebar on orientation change
  window.addEventListener('orientationchange', function() {
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    if (sidebar) {
      sidebar.classList.remove('active');
    }
    if (toggleBtn) {
      toggleBtn.classList.remove('active');
    }
  });
  
  // Prevent body scroll when mobile menu is open
  const observer = new MutationObserver(function() {
    if (sidebar && sidebar.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
  
  if (sidebar) {
    observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
  }
});
