// Load variants data from JSON
async function loadVariantsData() {
  try {
    const response = await fetch('/variants.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading variants data:', error);
    return null;
  }
}

// Parse variant codes to extract meaningful information
function parseVariantCode(variantCode, displayValue) {
  const parts = displayValue.split(' ');
  const fuelType = parts.includes('D') ? 'DIESEL' : parts.includes('P') ? 'PETROL' : 'DIESEL';
  const transmission = parts.includes('MT') ? 'MANUAL' : parts.includes('AT') ? 'AUTOMATIC' : 'MANUAL';
  const driveType = parts.includes('4WD') ? '4WD' : parts.includes('2WD') ? '2WD' : '4WD';
  const variantLevel = parts[0]; // LX, AX OPT, etc.
  const seater = '4'; // Default to 4 seater
  
  return {
    fuelType,
    transmission,
    driveType,
    variantLevel,
    seater,
    fullName: displayValue
  };
}

// Extract price from variant card HTML
function extractPriceFromHTML(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const priceElement = doc.querySelector('.approx-price');
  return priceElement ? priceElement.textContent.trim() : '₹ 0';
}

// Create filter buttons
function createFilterSection(container, filterData) {
  const filtersContainer = document.createElement('div');
  filtersContainer.className = 'variants-filters';

  // Variant Level Filter (LX, AX OPT)
  const variantLevelFilter = document.createElement('div');
  variantLevelFilter.className = 'filter-group variant-level-filter';
  
  const variantLevels = [...new Set(filterData.map(item => item.variantLevel))];
  variantLevels.forEach((level, index) => {
    const button = document.createElement('button');
    button.className = `filter-btn variant-level-btn ${index === 0 ? 'active' : ''}`;
    button.textContent = level;
    button.dataset.filter = level;
    variantLevelFilter.appendChild(button);
  });

  // Fuel Filter
  const fuelFilter = document.createElement('div');
  fuelFilter.className = 'filter-group fuel-filter';
  fuelFilter.innerHTML = `
    <span class="filter-label">Fuel</span>
    <div class="filter-buttons">
      <button class="filter-btn fuel-btn active" data-filter="ALL">ALL</button>
      <button class="filter-btn fuel-btn" data-filter="DIESEL">DIESEL</button>
      <button class="filter-btn fuel-btn" data-filter="PETROL">PETROL</button>
    </div>
  `;

  // Transmission Filter
  const transmissionFilter = document.createElement('div');
  transmissionFilter.className = 'filter-group transmission-filter';
  transmissionFilter.innerHTML = `
    <span class="filter-label">Transmission</span>
    <div class="filter-buttons">
      <button class="filter-btn transmission-btn active" data-filter="ALL">ALL</button>
      <button class="filter-btn transmission-btn" data-filter="MANUAL">MANUAL</button>
      <button class="filter-btn transmission-btn" data-filter="AUTOMATIC">AUTOMATIC</button>
    </div>
  `;

  filtersContainer.appendChild(variantLevelFilter);
  filtersContainer.appendChild(fuelFilter);
  filtersContainer.appendChild(transmissionFilter);
  
  container.appendChild(filtersContainer);
}

// Create variant card
function createVariantCard(variant, variantsData, colors) {
  const card = document.createElement('div');
  card.className = 'variant-card';
  card.dataset.fuel = variant.fuelType;
  card.dataset.transmission = variant.transmission;
  card.dataset.variantLevel = variant.variantLevel;

  // Extract colors for this variant from the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(variant.html, 'text/html');
  const colorElements = doc.querySelectorAll('.variant-colors li');
  const availableColors = Array.from(colorElements).map(li => {
    const bgColor = li.style.background;
    const matchingColor = colors.find(color => color.hexCode.toLowerCase() === bgColor.toLowerCase());
    return matchingColor || { hexCode: bgColor, displayValue: 'Unknown' };
  });

  card.innerHTML = `
    <div class="variant-header">
      <h3 class="variant-name">${variant.fullName}</h3>
      <div class="compare-checkbox">
        <label>
          <input type="checkbox" class="compare-input" data-variant-id="${variant.id}">
          <span>Compare</span>
        </label>
      </div>
    </div>
    
    <div class="variant-content">
      <div class="variant-price">
        <span class="price-amount">${variant.price}</span>
        <span class="price-label">Ex showroom price</span>
      </div>
      
      <div class="variant-specs">
        <div class="spec-item">
          <span class="spec-label">${variant.fuelType}</span>
          <span class="spec-sublabel">Fuel</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">${variant.transmission}</span>
          <span class="spec-sublabel">Transmission</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">${variant.seater}</span>
          <span class="spec-sublabel">Seater</span>
        </div>
      </div>
      
      <div class="variant-colors">
        <span class="colors-label">Colour</span>
        <div class="color-options">
          ${availableColors.map(color => `
            <div class="color-option" 
                 style="background-color: ${color.hexCode}" 
                 title="${color.displayValue}">
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="variant-actions">
        <a href="#" class="specifications-link">View all specifications</a>
        <button class="book-now-btn">Book Now</button>
      </div>
    </div>
  `;

  return card;
}

// Filter variants based on active filters
function filterVariants(variants, activeFilters) {
  return variants.filter(variant => {
    const fuelMatch = activeFilters.fuel === 'ALL' || variant.fuelType === activeFilters.fuel;
    const transmissionMatch = activeFilters.transmission === 'ALL' || variant.transmission === activeFilters.transmission;
    const variantLevelMatch = !activeFilters.variantLevel || variant.variantLevel === activeFilters.variantLevel;
    
    return fuelMatch && transmissionMatch && variantLevelMatch;
  });
}

// Comparison state management
const comparisonState = {
  selectedVariants: [],
  maxComparisons: 3
};

// Update comparison panel UI
function updateComparisonPanel(container) {
  const comparePanel = container.querySelector('.variant-compare-panel');
  const compareList = container.querySelector('.compare-variants-list');
  const compareCount = container.querySelector('.compare-count');
  const compareBtn = container.querySelector('.compare-vehicles-btn');
  const mainContainer = container.closest('.variantspricing');
  
  if (comparisonState.selectedVariants.length === 0) {
    comparePanel.style.display = 'none';
    mainContainer.classList.remove('has-comparison');
    return;
  }
  
  comparePanel.style.display = 'block';
  mainContainer.classList.add('has-comparison');
  compareCount.textContent = comparisonState.selectedVariants.length;
  
  // Update comparison list
  compareList.innerHTML = '';
  comparisonState.selectedVariants.forEach(variant => {
    const compareCard = document.createElement('div');
    compareCard.className = 'compare-variant-card';
    compareCard.innerHTML = `
      <button class="remove-variant-btn" data-variant-id="${variant.id}">×</button>
      <div class="compare-variant-name">${variant.fullName}</div>
      <div class="compare-variant-price">${variant.price}</div>
      <div class="compare-variant-label">Ex showroom price</div>
    `;
    compareList.appendChild(compareCard);
  });
  
  // Add event listeners to remove buttons
  compareList.querySelectorAll('.remove-variant-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const variantId = e.target.dataset.variantId;
      removeFromComparison(container, variantId);
    });
  });
}

// Add variant to comparison
function addToComparison(container, variant) {
  if (comparisonState.selectedVariants.length >= comparisonState.maxComparisons) {
    alert(`You can compare maximum ${comparisonState.maxComparisons} variants at a time.`);
    return false;
  }
  
  if (!comparisonState.selectedVariants.find(v => v.id === variant.id)) {
    comparisonState.selectedVariants.push(variant);
    updateComparisonPanel(container);
    return true;
  }
  return false;
}

// Remove variant from comparison
function removeFromComparison(container, variantId) {
  comparisonState.selectedVariants = comparisonState.selectedVariants.filter(v => v.id !== variantId);
  
  // Uncheck the corresponding checkbox
  const checkbox = container.querySelector(`input[data-variant-id="${variantId}"]`);
  if (checkbox) {
    checkbox.checked = false;
  }
  
  updateComparisonPanel(container);
}

// Clear all comparisons
function clearAllComparisons(container) {
  comparisonState.selectedVariants = [];
  
  // Uncheck all checkboxes
  container.querySelectorAll('.compare-input').forEach(checkbox => {
    checkbox.checked = false;
  });
  
  updateComparisonPanel(container);
}

// Setup filter event listeners
function setupFilterEventListeners(container, variants, colors, carImage) {
  const activeFilters = {
    fuel: 'ALL',
    transmission: 'ALL',
    variantLevel: variants.length > 0 ? variants[0].variantLevel : ''
  };

  function updateVariantDisplay() {
    const filteredVariants = filterVariants(variants, activeFilters);
    const variantsContainer = container.querySelector('.variants-grid');
    
    // Clear existing variants
    variantsContainer.innerHTML = '';
    
    // Add filtered variants
    filteredVariants.forEach(variant => {
      const card = createVariantCard(variant, variants, colors);
      variantsContainer.appendChild(card);
    });
    
    // Setup comparison checkboxes
    setupComparisonListeners(container, filteredVariants);
  }

  // Variant level filter
  container.querySelectorAll('.variant-level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.variant-level-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilters.variantLevel = btn.dataset.filter;
      updateVariantDisplay();
    });
  });

  // Fuel filter
  container.querySelectorAll('.fuel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.fuel-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilters.fuel = btn.dataset.filter;
      updateVariantDisplay();
    });
  });

  // Transmission filter
  container.querySelectorAll('.transmission-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.transmission-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilters.transmission = btn.dataset.filter;
      updateVariantDisplay();
    });
  });

  // Initial display
  updateVariantDisplay();
  
  // Setup comparison panel listeners
  setupComparisonPanelListeners(container);
}

// Setup comparison checkbox listeners
function setupComparisonListeners(container, variants) {
  container.querySelectorAll('.compare-input').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const variantId = e.target.dataset.variantId;
      const variant = variants.find(v => v.id === variantId);
      
      if (e.target.checked) {
        const added = addToComparison(container, variant);
        if (!added) {
          e.target.checked = false;
        }
      } else {
        removeFromComparison(container, variantId);
      }
    });
  });
}

// Setup comparison panel event listeners
function setupComparisonPanelListeners(container) {
  // Remove all button
  const removeAllBtn = container.querySelector('.remove-all-btn');
  if (removeAllBtn) {
    removeAllBtn.addEventListener('click', () => {
      clearAllComparisons(container);
    });
  }
  
  // Compare vehicles button
  const compareBtn = container.querySelector('.compare-vehicles-btn');
  if (compareBtn) {
    compareBtn.addEventListener('click', () => {
      if (comparisonState.selectedVariants.length < 2) {
        alert('Please select at least 2 variants to compare.');
        return;
      }
      
      // Handle comparison action (could redirect to comparison page)
      console.log('Comparing variants:', comparisonState.selectedVariants);
      alert(`Comparing ${comparisonState.selectedVariants.length} variants. This would redirect to comparison page.`);
    });
  }
}

// Main decorate function
export default async function decorate(block) {
  const variantsData = await loadVariantsData();
  
  if (!variantsData) {
    block.innerHTML = '<p>Error loading variants data</p>';
    return;
  }

  // Parse variant data
  const colors = variantsData.product.variationAttributes
    .find(attr => attr.id === 'colorCode')?.values || [];
  
  const variantCodes = variantsData.product.variationAttributes
    .find(attr => attr.id === 'variantCode')?.values || [];

  const variants = variantCodes.map(variant => {
    const parsed = parseVariantCode(variant.id, variant.displayValue);
    const html = variantsData.product.variantCardHtml
      .find(card => card.includes(variant.id)) || '';
    const price = extractPriceFromHTML(html);
    
    return {
      ...parsed,
      id: variant.id,
      price,
      html
    };
  });

  // Create main structure
  block.innerHTML = `
    <div class="variants-pricing-container">
      <div class="variants-header">
        <div class="header-content">
          <h2>Here is where the impossible begins</h2>
          <p>An enduring icon that just keeps on giving, The All-New Thar comes equipped with the iconic design and all new interiors to help you Explore The Impossible.</p>
          <div class="header-actions">
            <h3>VARIANTS & PRICING</h3>
            <button class="accessories-btn">
              <span class="download-icon">↓</span>
              Accessories Brochure
            </button>
          </div>
        </div>
      </div>
      
      <div class="variants-content">
        <div class="variants-left">
          <div class="variants-filters-container"></div>
          <div class="car-image-container">
            <img src="https://main--pbakliwal-wknd-29072025-85602--svfranklindemo.aem.live/images/media_18ed05c2a07304cddbc405322d401d97343a28418.png" 
                 alt="${variantsData.product.productName}" 
                 class="car-image">
            <p class="disclaimer">*See Disclaimer</p>
          </div>
        </div>
        
        <div class="variants-right">
          <div class="variants-grid"></div>
        </div>
      </div>
      
      <!-- Comparison Panel -->
      <div class="variant-compare-panel" style="display: none;">
        <div class="compare-panel-content">
          <div class="compare-header">
            <h3>VARIANT COMPARE</h3>
            <button class="remove-all-btn">Remove all</button>
          </div>
          <div class="compare-variants-container">
            <div class="compare-variants-list"></div>
            <button class="compare-vehicles-btn">
              <span class="compare-icon">⚖</span>
              <span class="compare-text">Compare Vehicles</span>
              <span class="compare-count">0</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Create and setup filters
  const filtersContainer = block.querySelector('.variants-filters-container');
  createFilterSection(filtersContainer, variants);
  
  // Setup event listeners and initial display
  setupFilterEventListeners(block, variants, colors, variantsData.product.images.large[0].absURL);
}
