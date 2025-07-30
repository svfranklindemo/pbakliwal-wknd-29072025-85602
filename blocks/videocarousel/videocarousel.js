import { fetchPlaceholders } from '../../scripts/placeholders.js';

function createVideoElement(videoUrl) {
  const video = document.createElement('video');
  video.setAttribute('muted', 'muted');
  video.setAttribute('playsinline', 'true');
  video.setAttribute('preload', 'none');
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
    source.setAttribute('src', source.getAttribute('data-src'));
    source.removeAttribute('data-src');
    video.load();
  }
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
  showMoreBtn.style.display = 'none';
  
  const showLessBtn = document.createElement('span');
  showLessBtn.classList.add('show-less');
  showLessBtn.textContent = 'Show less';
  showLessBtn.style.display = 'inline';
  
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

function setActiveSlide(slides, activeIndex) {
  slides.forEach((slide, index) => {
    slide.classList.remove('active-slide');
    const video = slide.querySelector('video');
    const progressBar = slide.querySelector('.progress-bar');
    
    if (video) {
      video.pause();
      video.currentTime = 0;
      if (progressBar) {
        progressBar.style.width = '0%';
      }
    }
    
    if (index === activeIndex) {
      slide.classList.add('active-slide');
      if (video) {
        loadVideo(video);
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(e => console.log('Video autoplay failed:', e));
        });
        
        if (progressBar) {
          video.addEventListener('timeupdate', () => {
            updateProgress(video, progressBar);
          });
        }
      }
    }
  });
}

function showSlideGroup(block, groupIndex = 0) {
  const slides = block.querySelectorAll('.video-slide');
  const slidesPerGroup = 4;
  const totalGroups = Math.ceil(slides.length / slidesPerGroup);
  
  // Ensure groupIndex is within bounds
  if (groupIndex >= totalGroups) groupIndex = 0;
  if (groupIndex < 0) groupIndex = totalGroups - 1;
  
  block.setAttribute('data-active-group', groupIndex);
  
  const startIndex = groupIndex * slidesPerGroup;
  const endIndex = Math.min(startIndex + slidesPerGroup, slides.length);
  
  // Hide all slides
  slides.forEach(slide => {
    slide.style.display = 'none';
    slide.classList.remove('active-slide');
  });
  
  // Show current group of slides
  for (let i = startIndex; i < endIndex; i++) {
    slides[i].style.display = 'block';
  }
  
  // Set first slide of the group as active
  if (slides[startIndex]) {
    setActiveSlide(Array.from(slides).slice(startIndex, endIndex), 0);
  }
}

function bindEvents(block) {
  const slides = block.querySelectorAll('.video-slide');
  const prevBtn = block.querySelector('.slide-prev');
  const nextBtn = block.querySelector('.slide-next');
  
  // Navigation buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const currentGroup = parseInt(block.getAttribute('data-active-group') || '0');
      showSlideGroup(block, currentGroup - 1);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const currentGroup = parseInt(block.getAttribute('data-active-group') || '0');
      showSlideGroup(block, currentGroup + 1);
    });
  }
  
  // Click on slides to make them active
  slides.forEach((slide, index) => {
    slide.addEventListener('click', () => {
      const currentGroup = parseInt(block.getAttribute('data-active-group') || '0');
      const startIndex = currentGroup * 4;
      const endIndex = Math.min(startIndex + 4, slides.length);
      const visibleSlides = Array.from(slides).slice(startIndex, endIndex);
      const slideIndexInGroup = visibleSlides.indexOf(slide);
      
      if (slideIndexInGroup !== -1) {
        setActiveSlide(visibleSlides, slideIndexInGroup);
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
  navButtons.classList.add('carousel-navigation-buttons');
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
  
  // Initialize carousel
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
