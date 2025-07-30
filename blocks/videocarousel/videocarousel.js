import { fetchPlaceholders } from '../../scripts/placeholders.js';

function createVideoElement(videoUrl) {
  const video = document.createElement('video');
  video.setAttribute('muted', 'muted');
  video.setAttribute('playsinline', 'true');
  video.setAttribute('preload', 'none');
  video.muted = true; // Ensure muted property is set
  video.volume = 0; // Set volume to 0 as additional safeguard
  video.classList.add('video-element', 'lazy-load');
  
  const source = document.createElement('source');
  source.setAttribute('data-src', videoUrl);
  source.setAttribute('type', 'video/mp4');
  
  video.appendChild(source);
  return video;
}

function loadVideo(video) {
  const source = video.querySelector('source[data-src]');
  if (source) {
    const videoUrl = source.getAttribute('data-src');
    source.setAttribute('src', videoUrl);
    source.removeAttribute('data-src');
    video.load();
    return true;
  }
  return false;
}

function createProgressBar() {
  const progressContainer = document.createElement('div');
  progressContainer.classList.add('progress-bar-container');
  
  const progressBar = document.createElement('div');
  progressBar.classList.add('progress', 'progress-bar');
  
  progressContainer.appendChild(progressBar);
  return progressContainer;
}

function updateProgress(video, progressBar) {
  if (video.duration) {
    const progress = (video.currentTime / video.duration) * 100;
    progressBar.style.width = `${progress}%`;
  }
}

function createShowMoreLess(textElement) {
  const showMoreContainer = document.createElement('div');
  showMoreContainer.classList.add('show-more-container');
  
  const showMoreBtn = document.createElement('span');
  showMoreBtn.classList.add('show-more');
  showMoreBtn.textContent = 'Show more';
  showMoreBtn.style.display = 'inline';
  
  const showLessBtn = document.createElement('span');
  showLessBtn.classList.add('show-less');
  showLessBtn.textContent = 'Show less';
  showLessBtn.style.display = 'none';
  
  showMoreContainer.appendChild(showMoreBtn);
  showMoreContainer.appendChild(showLessBtn);
  
  // Add clamp functionality
  textElement.classList.add('clamp-text');
  
  showMoreBtn.addEventListener('click', () => {
    textElement.classList.remove('clamp-text');
    showMoreBtn.style.display = 'none';
    showLessBtn.style.display = 'inline';
  });
  
  showLessBtn.addEventListener('click', () => {
    textElement.classList.add('clamp-text');
    showMoreBtn.style.display = 'inline';
    showLessBtn.style.display = 'none';
  });
  
  return showMoreContainer;
}

function setActiveSlide(allSlides, activeSlideIndex) {
  // Stop all videos and remove active state
  allSlides.forEach((slide, index) => {
    slide.classList.remove('active-slide');
    const video = slide.querySelector('video');
    const progressBar = slide.querySelector('.progress-bar');
    
    if (video) {
      video.pause();
      video.currentTime = 0;
      // Remove existing event listeners to prevent duplicates
      video.removeEventListener('timeupdate', video._progressHandler);
      if (progressBar) {
        progressBar.style.width = '0%';
      }
    }
  });
  
  // Set the specific slide as active
  const activeSlide = allSlides[activeSlideIndex];
  if (activeSlide) {
    activeSlide.classList.add('active-slide');
    const video = activeSlide.querySelector('video');
    const progressBar = activeSlide.querySelector('.progress-bar');
    
    if (video) {
      // Load video if not already loaded
      const wasLoaded = loadVideo(video);
      
      // Create progress handler function
      if (progressBar) {
        video._progressHandler = () => updateProgress(video, progressBar);
        video.addEventListener('timeupdate', video._progressHandler);
      }
      
      // Add event listener to enforce muted state
      video.addEventListener('volumechange', () => {
        if (!video.muted || video.volume > 0) {
          video.muted = true;
          video.volume = 0;
        }
      });
      
      // Play the video
      const playVideo = () => {
        // Ensure video is always muted before playing
        video.muted = true;
        video.volume = 0;
        
        video.play().catch(e => {
          console.log('Video autoplay failed:', e);
          // Try to play again after a short delay
          setTimeout(() => {
            // Ensure muted state on retry as well
            video.muted = true;
            video.volume = 0;
            video.play().catch(err => console.log('Video play retry failed:', err));
          }, 100);
        });
      };
      
      if (wasLoaded) {
        video.addEventListener('loadeddata', playVideo, { once: true });
      } else {
        // Video already loaded, play immediately
        playVideo();
      }
    }
  }
}

function showSlideGroup(block, activeSlideIndex = 0) {
  const slides = block.querySelectorAll('.video-slide');
  const totalSlides = slides.length;
  const slidesToShow = 4;
  
  // Ensure activeSlideIndex is within bounds (with looping)
  if (activeSlideIndex >= totalSlides) activeSlideIndex = activeSlideIndex % totalSlides;
  if (activeSlideIndex < 0) activeSlideIndex = ((activeSlideIndex % totalSlides) + totalSlides) % totalSlides;
  
  block.setAttribute('data-active-slide', activeSlideIndex);
  
  // Hide all slides first and reset order
  slides.forEach(slide => {
    slide.style.display = 'none';
    slide.style.transform = ''; // Clear any transforms
    slide.style.opacity = '';   // Clear any opacity changes
    slide.style.order = '';     // Clear any order changes
  });
  
  // Show 4 slides starting from activeSlideIndex (with looping) and set their visual order
  for (let i = 0; i < slidesToShow; i++) {
    const slideIndex = (activeSlideIndex + i) % totalSlides;
    const slide = slides[slideIndex];
    slide.style.display = 'block';
    slide.style.order = i; // Set visual order: active slide gets order 0 (first position)
  }
  
  // Set the first visible slide (activeSlideIndex) as active
  setActiveSlide(Array.from(slides), activeSlideIndex);
}

function bindEvents(block) {
  const slides = block.querySelectorAll('.video-slide');
  const prevBtn = block.querySelector('.slide-prev');
  const nextBtn = block.querySelector('.slide-next');
  
  // Navigation buttons - move one slide at a time
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const currentActiveSlide = parseInt(block.getAttribute('data-active-slide') || '0');
      const newActiveSlide = currentActiveSlide - 1;
      showSlideGroup(block, newActiveSlide);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const currentActiveSlide = parseInt(block.getAttribute('data-active-slide') || '0');
      const newActiveSlide = currentActiveSlide + 1;
      showSlideGroup(block, newActiveSlide);
    });
  }
  
  // Click on slides to make them active and shift to first position
  slides.forEach((slide, slideIndex) => {
    slide.addEventListener('click', () => {
      // Only respond to clicks on visible slides
      if (slide.style.display !== 'none') {
        showSlideGroup(block, slideIndex);
      }
    });
  });
}

export default async function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  const placeholders = await fetchPlaceholders();
  
  // Create main container
  const container = document.createElement('div');
  container.classList.add('video-carousel-container');
  
  // Create slides container
  const slidesContainer = document.createElement('div');
  slidesContainer.classList.add('video-slides-container');
  
  // Process each row to create video slides
  rows.forEach((row, index) => {
    const slide = document.createElement('div');
    slide.classList.add('video-slide');
    slide.setAttribute('data-slide-index', index);
    
    const columns = row.querySelectorAll(':scope > div');
    const videoColumn = columns[0];
    const contentColumn = columns[1];
    
    // Process video column
    if (videoColumn) {
      const videoContainer = document.createElement('div');
      videoContainer.classList.add('video-container');
      
      const videoLink = videoColumn.querySelector('a[href$=".mp4"]');
      if (videoLink) {
        const videoUrl = videoLink.getAttribute('href');
        const video = createVideoElement(videoUrl);
        const progressBar = createProgressBar();
        
        videoContainer.appendChild(video);
        videoContainer.appendChild(progressBar);
      }
      
      slide.appendChild(videoContainer);
    }
    
    // Process content column
    if (contentColumn) {
      const contentContainer = document.createElement('div');
      contentContainer.classList.add('video-content');
      
      const h4 = contentColumn.querySelector('h4');
      const p = contentColumn.querySelector('p');
      
      if (h4) {
        contentContainer.appendChild(h4.cloneNode(true));
      }
      
      if (p) {
        const clonedP = p.cloneNode(true);
        const showMoreLess = createShowMoreLess(clonedP);
        contentContainer.appendChild(clonedP);
        contentContainer.appendChild(showMoreLess);
      }
      
      slide.appendChild(contentContainer);
    }
    
    slidesContainer.appendChild(slide);
    row.remove();
  });
  
  // Create navigation buttons
  const navButtons = document.createElement('div');
  navButtons.classList.add('video-carousel-nav-buttons');
  navButtons.innerHTML = `
    <button type="button" class="slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slides'}">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slides'}">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  `;
  
  container.appendChild(slidesContainer);
  container.appendChild(navButtons);
  block.appendChild(container);
  
  // Initialize carousel - start with first slide active
  showSlideGroup(block, 0);
  bindEvents(block);
  
  // Set up intersection observer for lazy loading
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const video = entry.target;
        loadVideo(video);
        videoObserver.unobserve(video);
      }
    });
  }, { threshold: 0.1 });
  
  // Observe all videos for lazy loading
  block.querySelectorAll('video').forEach(video => {
    videoObserver.observe(video);
  });
}
