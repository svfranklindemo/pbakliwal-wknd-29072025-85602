// Gallery Block Component
export default function decorate(block) {
    // Create the gallery structure
    const galleryContainer = document.createElement('div');
    galleryContainer.className = 'gallery-block outdoor-night'; // Default to outdoor night
    
    // Create header
    const header = document.createElement('div');
    header.className = 'gallery-header';
    
    // Mode selection
    const modeSelection = document.createElement('div');
    modeSelection.className = 'mode-selection';
    
    const studioBtn = document.createElement('button');
    studioBtn.className = 'mode-option';
    studioBtn.textContent = 'Studio';
    studioBtn.dataset.mode = 'studio';
    
    const outdoorBtn = document.createElement('button');
    outdoorBtn.className = 'mode-option active';
    outdoorBtn.textContent = 'Outdoor';
    outdoorBtn.dataset.mode = 'outdoor';
    
    modeSelection.appendChild(studioBtn);
    modeSelection.appendChild(outdoorBtn);
    
    // Day/Night toggle
    const dayNightToggle = document.createElement('div');
    dayNightToggle.className = 'day-night-toggle show'; // Show by default for outdoor
    
    const toggleLabel = document.createElement('span');
    toggleLabel.className = 'toggle-label';
    toggleLabel.textContent = 'Night'; // Default to Night since switch starts inactive
    
    const toggleSwitch = document.createElement('div');
    toggleSwitch.className = 'toggle-switch'; // Night is default
    
    const toggleKnob = document.createElement('div');
    toggleKnob.className = 'toggle-knob';
    toggleSwitch.appendChild(toggleKnob);
    
    dayNightToggle.appendChild(toggleLabel);
    dayNightToggle.appendChild(toggleSwitch);
    
    header.appendChild(modeSelection);
    header.appendChild(dayNightToggle);
    
    // Background display area (contains the background image and car)
    const backgroundDisplay = document.createElement('div');
    backgroundDisplay.className = 'background-display';
    
    // Car display area
    const carDisplay = document.createElement('div');
    carDisplay.className = 'car-display';
    
    const carImage = document.createElement('img');
    carImage.className = 'car-image';
    carImage.alt = 'Car Image';
    
    carDisplay.appendChild(carImage);
    backgroundDisplay.appendChild(carDisplay);
    
    // Color selection
    const colorSelection = document.createElement('div');
    colorSelection.className = 'color-selection';
    
    const colorName = document.createElement('div');
    colorName.className = 'color-name';
    colorName.textContent = 'DEEP FOREST'; // Default color name
    
    const colorOptions = document.createElement('div');
    colorOptions.className = 'color-options';
    
    colorSelection.appendChild(colorName);
    colorSelection.appendChild(colorOptions);
    
    // Assemble the gallery
    galleryContainer.appendChild(backgroundDisplay);
    galleryContainer.appendChild(header);
    galleryContainer.appendChild(colorSelection);
    
    // Replace block content
    block.innerHTML = '';
    block.appendChild(galleryContainer);
    
    // Initialize gallery data and functionality
    initializeGallery(galleryContainer);
}

// Gallery state management
let galleryData = {};
let currentState = {
    mode: 'outdoor',
    timeOfDay: 'night',
    selectedColor: 'DEEP FOREST'
};

// Load gallery data
async function loadGalleryData() {
    try {
        const response = await fetch('/gallery.json');
        if (!response.ok) {
            throw new Error('Failed to load gallery data');
        }
        const jsonData = await response.json();
        
        // Transform the data structure to match our component expectations
        galleryData = {
            colors: jsonData.data || []
        };
        
        return galleryData;
    } catch (error) {
        console.warn('Gallery data not found, using default data:', error);
        // Fallback data structure matching the new format
        return {
            colors: [
                {
                    colorName: "DEEP FOREST",
                    colorHex: "#282d22",
                    imageLink: "https://main--pbakliwal-wknd-29072025-85602--svfranklindemo.aem.live/images/media_1eee56723585143994c93b618e324acb7d528b8a1.png"
                },
                {
                    colorName: "RED RAGE",
                    colorHex: "#c20d0e",
                    imageLink: "https://main--pbakliwal-wknd-29072025-85602--svfranklindemo.aem.live/images/media_18ed05c2a07304cddbc405322d401d97343a28418.png"
                },
                {
                    colorName: "EVEREST WHITE",
                    colorHex: "#cfcdcd",
                    imageLink: "https://main--pbakliwal-wknd-29072025-85602--svfranklindemo.aem.live/images/media_1176d77174f3af2b0556355930f1272692f3d253e.png"
                },
                {
                    colorName: "STEALTH BLACK",
                    colorHex: "#060505",
                    imageLink: "https://main--pbakliwal-wknd-29072025-85602--svfranklindemo.aem.live/images/media_1645f5991e3dffbdd06df9f6cf636d408f9402c5e.png"
                },
                {
                    colorName: "DEEP GREY",
                    colorHex: "#575a63",
                    imageLink: "https://main--pbakliwal-wknd-29072025-85602--svfranklindemo.aem.live/images/media_1a20f4b130086ec3924123473f1c79d77e740915e.png"
                }
            ]
        };
    }
}

// Initialize gallery functionality
async function initializeGallery(container) {
    const data = await loadGalleryData();
    
    // Set default to DEEP FOREST
    currentState.selectedColor = 'DEEP FOREST';
    
    // Create color options
    createColorOptions(container, data.colors);
    
    // Set up event listeners
    setupEventListeners(container);
    
    // Update initial display
    updateCarImage(container);
    updateBackgroundMode(container);
}

// Create color option buttons
function createColorOptions(container, colors) {
    const colorOptions = container.querySelector('.color-options');
    colorOptions.innerHTML = '';
    
    colors.forEach((color, index) => {
        const colorOption = document.createElement('div');
        colorOption.className = `color-option${index === 0 ? ' active' : ''}`;
        colorOption.style.backgroundColor = color.colorHex;
        colorOption.dataset.colorName = color.colorName;
        colorOption.title = color.colorName;
        
        colorOptions.appendChild(colorOption);
    });
}

// Set up event listeners
function setupEventListeners(container) {
    // Mode selection (Studio/Outdoor)
    const modeOptions = container.querySelectorAll('.mode-option');
    modeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const mode = option.dataset.mode;
            if (mode !== currentState.mode) {
                // Update active state
                modeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Update current state
                currentState.mode = mode;
                
                // Show/hide day/night toggle
                const dayNightToggle = container.querySelector('.day-night-toggle');
                if (mode === 'outdoor') {
                    dayNightToggle.classList.add('show');
                } else {
                    dayNightToggle.classList.remove('show');
                }
                
                // Update display
                updateBackgroundMode(container);
                updateCarImage(container);
            }
        });
    });
    
    // Day/Night toggle
    const toggleSwitch = container.querySelector('.toggle-switch');
    const toggleLabel = container.querySelector('.toggle-label');
    toggleSwitch.addEventListener('click', () => {
        const isDay = toggleSwitch.classList.contains('active');
        
        if (isDay) {
            // Switch to night
            toggleSwitch.classList.remove('active');
            toggleLabel.textContent = 'Night';
            currentState.timeOfDay = 'night';
        } else {
            // Switch to day
            toggleSwitch.classList.add('active');
            toggleLabel.textContent = 'Day';
            currentState.timeOfDay = 'day';
        }
        
        updateBackgroundMode(container);
        updateCarImage(container);
    });
    
    // Color selection
    const colorOptions = container.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Update active state
            colorOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Update current state
            currentState.selectedColor = option.dataset.colorName;
            
            // Update color name display
            const colorName = container.querySelector('.color-name');
            colorName.textContent = currentState.selectedColor.toUpperCase();
            
            // Update car image
            updateCarImage(container);
        });
    });
}

// Update background mode
function updateBackgroundMode(container) {
    // Remove all mode classes
    container.classList.remove('studio', 'outdoor-day', 'outdoor-night');
    
    // Add appropriate class
    if (currentState.mode === 'studio') {
        container.classList.add('studio');
    } else {
        if (currentState.timeOfDay === 'day') {
            container.classList.add('outdoor-day');
        } else {
            container.classList.add('outdoor-night');
        }
    }
}

// Update car image based on current state
function updateCarImage(container) {
    const carImage = container.querySelector('.car-image');
    
    if (!galleryData.colors) return;
    
    // Find selected color data
    const selectedColorData = galleryData.colors.find(
        color => color.colorName === currentState.selectedColor
    );
    
    if (!selectedColorData) return;
    
    // Use the single imageLink for all modes (studio/outdoor/day/night)
    const newImageSrc = selectedColorData.imageLink;
    
    if (newImageSrc) {
        carImage.classList.add('loading');
        
        // Preload image
        const img = new Image();
        img.onload = () => {
            carImage.src = newImageSrc;
            carImage.classList.remove('loading');
        };
        img.onerror = () => {
            console.warn('Failed to load car image:', newImageSrc);
            carImage.classList.remove('loading');
        };
        img.src = newImageSrc;
    }
}

// Helper function to get current car image URL (for external use)
export function getCurrentCarImage() {
    const selectedColorData = galleryData.colors?.find(
        color => color.colorName === currentState.selectedColor
    );
    
    if (!selectedColorData) return null;
    
    return selectedColorData.imageLink;
}

// Helper function to get current state (for external use)
export function getCurrentState() {
    return { ...currentState };
}
