// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

// Function to reinitialize carousels when tabs become active
function reinitializeCarousels(tabpanel) {
  const carousels = tabpanel.querySelectorAll('.carousel');
  
  carousels.forEach((carousel) => {
    // Rebind carousel events
    rebindCarouselEvents(carousel);
    
    // Reset to first slide and update active slide
    const firstSlide = carousel.querySelector('.carousel-slide');
    if (firstSlide) {
      updateCarouselActiveSlide(firstSlide);
      // Scroll to first slide
      carousel.querySelector('.carousel-slides').scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }
  });
}

// Rebind carousel events (similar to carousel.js bindEvents function)
function rebindCarouselEvents(block) {
  // Remove existing event listeners to prevent duplicates
  const existingPrevBtn = block.querySelector('.slide-prev');
  const existingNextBtn = block.querySelector('.slide-next');
  
  if (existingPrevBtn) existingPrevBtn.replaceWith(existingPrevBtn.cloneNode(true));
  if (existingNextBtn) existingNextBtn.replaceWith(existingNextBtn.cloneNode(true));
  
  // Rebind navigation buttons
  const prevBtn = block.querySelector('.slide-prev');
  const nextBtn = block.querySelector('.slide-next');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      showCarouselSlide(block, parseInt(block.dataset.activeSlide || '0', 10) - 1);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showCarouselSlide(block, parseInt(block.dataset.activeSlide || '0', 10) + 1);
    });
  }
  
  // Rebind slide indicators
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (slideIndicators) {
    slideIndicators.querySelectorAll('button').forEach((button) => {
      const newButton = button.cloneNode(true);
      button.replaceWith(newButton);
      
      newButton.addEventListener('click', (e) => {
        const slideIndicator = e.currentTarget.parentElement;
        showCarouselSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
      });
    });
  }
  
  // Rebind intersection observer for slides
  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateCarouselActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  
  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

// Update active slide (similar to carousel.js updateActiveSlide function)
function updateCarouselActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');
  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
    
    // Handle video elements - pause videos on inactive slides
    if (idx !== slideIndex) {
      const video = aSlide.querySelector('video');
      if (video) {
        video.pause();
      }
    }
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

// Show carousel slide (similar to carousel.js showSlide function)
function showCarouselSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

export default async function decorate(block) {
  // Check if block has class starting with 'target-'
  let targetClass = [...block.classList].find(className => className.startsWith('target-'));
  let targetDivs = [];

  if (targetClass) {
    targetClass = targetClass.replace('target-', '') + '-wrapper';
    // Only consider siblings of the parent element of the tabs block
    const parent = block.parentElement;
    const grandParent = parent ? parent.parentElement : null;
    if (grandParent) {
      const siblingElements = Array.from(grandParent.children);
      siblingElements.forEach((sibling) => {
        if (
          sibling !== parent &&
          sibling.classList &&
          sibling.classList.contains(targetClass)
        ) {
          targetDivs.push(sibling);
          sibling.remove();
        }
      });
    }
  }

  

  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // Match tab text with targetDivs and insert matching content
    if (targetDivs.length > 0) {
      const tabText = tab.textContent.toLowerCase().trim();
      
      // Find targetDiv that has a child with class matching the tab text
      const matchingTargetDiv = targetDivs.find(targetDiv => {
        return targetDiv.querySelector(`.${tabText}`);
      });
      
      if (matchingTargetDiv) {
        // Clone the targetDiv to avoid moving the original
        const clonedDiv = matchingTargetDiv.cloneNode(true);
        tabpanel.appendChild(clonedDiv);
      }
    }

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
      
      // Reinitialize carousels in the newly active tab panel with small delay
      setTimeout(() => {
        reinitializeCarousels(tabpanel);
      }, 100);
    });
    tablist.append(button);
    tab.remove();
  });

  block.prepend(tablist);
  
  // Initialize carousels in the first (active) tab panel with small delay
  const firstTabPanel = block.querySelector('.tabs-panel[aria-hidden="false"]');
  if (firstTabPanel) {
    setTimeout(() => {
      reinitializeCarousels(firstTabPanel);
    }, 100);
  }
}
