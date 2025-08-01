import { fetchPlaceholders } from '../../scripts/aem.js';

function updateActiveSlide(slide) {
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

    // Handle video lazy loading
    if (idx === slideIndex) {
      loadSlideMedia(aSlide);
    } else {
      // Pause videos on inactive slides
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

function loadSlideMedia(slide) {
  // Load and play videos when slide becomes active
  const video = slide.querySelector('video[data-src]');
  if (video) {
    const src = video.getAttribute('data-src');
    video.src = src;
    video.removeAttribute('data-src');
    // Wait for video to load before playing
    video.addEventListener('loadeddata', () => {
      video.play().catch(() => {
        // Handle autoplay failure silently
      });
    });
  }
}

function showSlide(block, slideIndex = 0) {
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

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function isVideoUrl(url) {
  return url && url.toLowerCase().endsWith('.mp4');
}

function createVideoElement(src) {
  const video = document.createElement('video');
  video.setAttribute('data-src', src); // Use data-src for lazy loading
  video.setAttribute('autoplay', '');
  video.setAttribute('muted', '');
  video.setAttribute('loop', '');
  video.setAttribute('playsinline', '');
  video.style.height = '100%';
  video.style.width = '100%';
  video.style.objectFit = 'cover';
  return video;
}

function processSlideMedia(slide) {
  // Find anchor elements that contain video URLs
  const links = slide.querySelectorAll('a');
  
  links.forEach((link) => {
    const href = link.getAttribute('href');
    const linkText = link.textContent.trim();
    
    // Check if the link href or text content is a video URL
    if ((href && isVideoUrl(href)) || (linkText && isVideoUrl(linkText))) {
      const videoUrl = href && isVideoUrl(href) ? href : linkText;
      const video = createVideoElement(videoUrl);
      
      // Replace the entire parent div containing the link with video
      const parentDiv = link.closest('div');
      if (parentDiv) {
        // Create a new div to contain the video (to maintain structure)
        const videoContainer = document.createElement('div');
        videoContainer.appendChild(video);
        parentDiv.replaceWith(videoContainer);
      } else {
        // Fallback: replace just the link
        link.replaceWith(video);
      }
    }
  });

  // Also handle existing picture/img elements (keep existing functionality)
  const pictures = slide.querySelectorAll('picture');
  
  pictures.forEach((picture) => {
    const img = picture.querySelector('img');
    if (img && img.src && isVideoUrl(img.src)) {
      // Replace img with video element
      const video = createVideoElement(img.src);
      img.replaceWith(video);
    }
    
    // Also check source elements for different breakpoints
    const sources = picture.querySelectorAll('source');
    sources.forEach((source) => {
      if (source.srcset && isVideoUrl(source.srcset)) {
        // If we find a video source, replace the entire picture with video
        const video = createVideoElement(source.srcset);
        picture.replaceWith(video);
      }
    });
  });

  // Also handle direct img elements (not inside picture)
  const directImages = slide.querySelectorAll('img:not(picture *)');
  directImages.forEach((img) => {
    if (img.src && isVideoUrl(img.src)) {
      const video = createVideoElement(img.src);
      img.replaceWith(video);
    }
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  // Process media after adding columns to slide
  processSlideMedia(slide);

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button"><span>${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}</span></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
    // Load media for the first slide initially
    const firstSlide = block.querySelector('.carousel-slide');
    if (firstSlide) {
      loadSlideMedia(firstSlide);
    }
  } else {
    // For single slides, load media immediately
    const singleSlide = block.querySelector('.carousel-slide');
    if (singleSlide) {
      loadSlideMedia(singleSlide);
    }
  }
}
