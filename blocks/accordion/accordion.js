/*
 * Accordion Block
 * Recreate an accordion with smooth transitions
 * https://www.hlx.live/developer/block-collection/accordion
 */

function hasWrapper(el) {
  return !!el.firstElementChild && window.getComputedStyle(el.firstElementChild).display === 'block';
}

function setAccordionHeight(details, isOpen) {
  const body = details.querySelector('.accordion-item-body');
  if (!body) return;

  if (isOpen) {
    // Calculate the actual height of the content
    const contentHeight = body.scrollHeight;
    body.style.maxHeight = `${contentHeight}px`;
  } else {
    body.style.maxHeight = '0px';
  }
}

function handleAccordionToggle(details) {
  const isOpen = details.hasAttribute('open');
  
  if (isOpen) {
    // Closing - set height to 0
    setAccordionHeight(details, false);
    // Remove open attribute after animation
    setTimeout(() => {
      details.removeAttribute('open');
    }, 300);
  } else {
    // Opening - add open attribute first, then set height
    details.setAttribute('open', '');
    // Use requestAnimationFrame to ensure the open state is applied
    requestAnimationFrame(() => {
      setAccordionHeight(details, true);
    });
  }
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    if (!hasWrapper(summary)) {
      summary.innerHTML = `<p>${summary.innerHTML}</p>`;
    }
    
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';
    if (!hasWrapper(body)) {
      body.innerHTML = `<p>${body.innerHTML}</p>`;
    }
    
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    
    // Add click handler for smooth transitions
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      handleAccordionToggle(details);
    });
    
    // Initialize closed state
    setAccordionHeight(details, false);
    
    row.replaceWith(details);
  });
  
  // Handle window resize to recalculate heights
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const openAccordions = block.querySelectorAll('details[open]');
      openAccordions.forEach(details => {
        setAccordionHeight(details, true);
      });
    }, 100);
  });
}
