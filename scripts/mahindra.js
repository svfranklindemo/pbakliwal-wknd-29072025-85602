/**
 * In-Page Navigation Smooth Scroll
 * Handles smooth scrolling with proper offset for in-page navigation buttons
 */
function initSmoothScroll() {
  const inPageNav = document.querySelector('.inpage-nav');
  if (!inPageNav) return;

  const navButtons = inPageNav.querySelectorAll('.button[href^="#"]');

  navButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const href = this.getAttribute('href');
      const targetId = href.substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        // Calculate scroll position with 200px offset
        const targetPosition = targetSection.offsetTop - 200;
        
        // Smooth scroll to target position
        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: 'smooth'
        });
        
        // Add active class to clicked button
        navButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSmoothScroll);
} else {
  initSmoothScroll();
}

// Reinitialize if content changes
document.addEventListener('helix:content-loaded', initSmoothScroll);
