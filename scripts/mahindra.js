/**
 * In-Page Navigation Functionality
 * Highlights active section links and provides smooth scrolling
 */
function initInPageNavigation() {
  const inPageNav = document.querySelector('.inpage-nav');
  if (!inPageNav) return;

  const navLinks = inPageNav.querySelectorAll('.button[href^="#"]');
  const sections = [];
  let isScrolling = false;

  // Build sections array
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const sectionId = href.substring(1);
    const section = document.getElementById(sectionId);
    
    if (section) {
      sections.push({
        id: sectionId,
        element: section,
        link: link
      });
    }
  });

  // Remove active class from all links
  function clearActiveLinks() {
    navLinks.forEach(link => link.classList.remove('active'));
  }

  // Add active class to specific link
  function setActiveLink(activeLink) {
    clearActiveLinks();
    activeLink.classList.add('active');
  }

  // Smooth scroll to section
  function scrollToSection(targetSection, targetLink) {
    const headerHeight = 68; // Main nav height
    const inPageNavHeight = inPageNav.offsetHeight;
    const totalOffset = headerHeight + inPageNavHeight + 20; // Extra padding
    
    const targetPosition = targetSection.offsetTop - totalOffset;
    
    isScrolling = true;
    setActiveLink(targetLink);
    
    window.scrollTo({
      top: Math.max(0, targetPosition),
      behavior: 'smooth'
    });

    // Reset scrolling flag after animation
    setTimeout(() => {
      isScrolling = false;
    }, 1000);
  }

  // Check which section is currently in view
  function updateActiveSection() {
    if (isScrolling) return; // Don't update during programmatic scroll

    const scrollPosition = window.scrollY;
    const headerHeight = 68;
    const inPageNavHeight = inPageNav.offsetHeight;
    const offset = headerHeight + inPageNavHeight;
    const viewportHeight = window.innerHeight;
    
    let activeSection = null;

    // Check each section to see which one should be active
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const sectionTop = section.element.offsetTop;
      const sectionHeight = section.element.offsetHeight;
      const sectionBottom = sectionTop + sectionHeight;
      
      // Current scroll position relative to section
      const scrollPosInSection = scrollPosition + offset;
      
      // Section is active if:
      // 1. We've scrolled past the section start
      // 2. We haven't scrolled past the section end
      if (scrollPosInSection >= sectionTop - 50 && scrollPosInSection < sectionBottom + 50) {
        activeSection = section;
        break; // Take the first matching section (from top to bottom)
      }
    }

    // If no section found using the above logic, find the section that's most visible
    if (!activeSection) {
      let maxVisibleArea = 0;
      
      sections.forEach(section => {
        const sectionTop = section.element.offsetTop;
        const sectionHeight = section.element.offsetHeight;
        const sectionBottom = sectionTop + sectionHeight;
        
        // Calculate visible area of this section
        const visibleTop = Math.max(scrollPosition + offset, sectionTop);
        const visibleBottom = Math.min(scrollPosition + offset + viewportHeight, sectionBottom);
        const visibleArea = Math.max(0, visibleBottom - visibleTop);
        
        if (visibleArea > maxVisibleArea) {
          maxVisibleArea = visibleArea;
          activeSection = section;
        }
      });
    }

    // Special case: if we're at the very bottom of the page, activate the last section
    if (window.scrollY + viewportHeight >= document.documentElement.scrollHeight - 10) {
      activeSection = sections[sections.length - 1];
    }

    // Update active link only if we have a clear active section
    if (activeSection) {
      setActiveLink(activeSection.link);
    }
  }

  // Handle click events on navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const href = this.getAttribute('href');
      const sectionId = href.substring(1);
      const targetSection = document.getElementById(sectionId);
      
      if (targetSection) {
        scrollToSection(targetSection, this);
      }
    });
  });

  // Handle scroll events with throttling
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = setTimeout(updateActiveSection, 50);
  });

  // Initial check
  setTimeout(updateActiveSection, 100);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInPageNavigation);
} else {
  initInPageNavigation();
}

// Reinitialize if content changes
document.addEventListener('helix:content-loaded', initInPageNavigation);
