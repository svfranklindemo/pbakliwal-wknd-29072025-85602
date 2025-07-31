// EMI Calculation function
function calculateEMI(principal, rate, tenure) {
  const monthlyRate = rate / (12 * 100);
  const numberOfPayments = tenure * 12;
  
  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }
  
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
              (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  return Math.round(emi * 100) / 100;
}

// Format currency for display
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format number for display
function formatNumber(num) {
  return new Intl.NumberFormat('en-IN').format(num);
}

// Create range slider
function createRangeSlider(container, config) {
  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'slider-container';
  
  const label = document.createElement('label');
  label.className = 'slider-label';
  label.textContent = config.label;
  
  const inputContainer = document.createElement('div');
  inputContainer.className = 'input-container';
  
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'range-slider';
  slider.min = config.min;
  slider.max = config.max;
  slider.step = config.step || 1;
  slider.value = config.value;
  
  const display = document.createElement('div');
  display.className = 'slider-display';
  display.textContent = config.format ? config.format(config.value) : config.value;
  
  // Update display when slider changes
  slider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    display.textContent = config.format ? config.format(value) : value;
    if (config.onChange) {
      config.onChange(value);
    }
  });
  
  inputContainer.appendChild(slider);
  sliderContainer.appendChild(label);
  sliderContainer.appendChild(inputContainer);
  sliderContainer.appendChild(display);
  
  container.appendChild(sliderContainer);
  
  return {
    slider,
    display,
    getValue: () => parseFloat(slider.value),
    setValue: (value) => {
      slider.value = value;
      display.textContent = config.format ? config.format(value) : value;
    }
  };
}

// Create EMI Calculator Modal
function createEMICalculatorModal() {
  const modal = document.createElement('div');
  modal.className = 'emi-modal';
  modal.innerHTML = `
    <div class="emi-modal-overlay">
      <div class="emi-modal-content">
        <div class="emi-header">
          <h2>EMI CALCULATOR</h2>
          <button class="emi-close-btn">×</button>
        </div>
        
        <div class="emi-calculator-form">
          <div class="emi-inputs">
            <div class="emi-input-row">
              <div class="emi-input-group"></div>
              <div class="emi-input-group"></div>
            </div>
            <div class="emi-input-row">
              <div class="emi-input-group"></div>
              <div class="emi-input-group"></div>
            </div>
          </div>
          
          <div class="emi-result">
            <div class="emi-result-container">
              <div class="emi-amount-label">Monthly EMI</div>
              <div class="emi-amount">₹ <span class="emi-value">0</span></div>
              <button class="explore-finance-btn">
                <span>→</span>
                Explore finance options
              </button>
            </div>
          </div>
        </div>
        
        <div class="emi-disclaimer">
          Disclaimer: The above calculation is just for the reference only. Terms & Conditions Apply.
        </div>
      </div>
    </div>
  `;
  
  return modal;
}

// Initialize EMI Calculator
function initializeEMICalculator(modal) {
  const inputGroups = modal.querySelectorAll('.emi-input-group');
  const emiValueElement = modal.querySelector('.emi-value');
  
  // Default values
  const defaults = {
    loanAmount: 832168,
    interestRate: 6.5,
    downPayment: 200000,
    tenure: 7
  };
  
  // Create sliders
  const loanAmountSlider = createRangeSlider(inputGroups[0], {
    label: 'Loan Amount',
    min: 100000,
    max: 2000000,
    step: 1000,
    value: defaults.loanAmount,
    format: (val) => `₹ ${formatNumber(val)}`,
    onChange: updateEMI
  });
  
  const interestRateSlider = createRangeSlider(inputGroups[1], {
    label: 'Rate of Interest',
    min: 5,
    max: 20,
    step: 0.1,
    value: defaults.interestRate,
    format: (val) => `${val} %`,
    onChange: updateEMI
  });
  
  const downPaymentSlider = createRangeSlider(inputGroups[2], {
    label: 'Down Payment',
    min: 0,
    max: 500000,
    step: 1000,
    value: defaults.downPayment,
    format: (val) => `₹ ${formatNumber(val)}`,
    onChange: updateEMI
  });
  
  const tenureSlider = createRangeSlider(inputGroups[3], {
    label: 'Loan Tenure',
    min: 1,
    max: 10,
    step: 1,
    value: defaults.tenure,
    format: (val) => `${val} yrs.`,
    onChange: updateEMI
  });
  
  // Update EMI calculation
  function updateEMI() {
    const loanAmount = loanAmountSlider.getValue() - downPaymentSlider.getValue();
    const interestRate = interestRateSlider.getValue();
    const tenure = tenureSlider.getValue();
    
    if (loanAmount <= 0) {
      emiValueElement.textContent = '0';
      return;
    }
    
    const emi = calculateEMI(loanAmount, interestRate, tenure);
    emiValueElement.textContent = formatNumber(emi);
  }
  
  // Initial calculation
  updateEMI();
  
  // Close modal functionality
  const closeBtn = modal.querySelector('.emi-close-btn');
  const overlay = modal.querySelector('.emi-modal-overlay');
  
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
  
  // Explore finance button
  const exploreBtn = modal.querySelector('.explore-finance-btn');
  exploreBtn.addEventListener('click', () => {
    console.log('Explore finance options clicked');
    // Add your finance exploration logic here
    alert('Redirecting to finance options...');
  });
}

// Main decorate function
export default function decorate(block) {
  // Create the finance section HTML
  block.innerHTML = `
    <div class="finance-container">
      <div class="finance-content">
        <div class="finance-header">
          <span class="finance-label">FINANCE</span>
        </div>
        
        <h2 class="finance-title">Good deals. Best financiers.</h2>
        <p class="finance-subtitle">Get easy finance options personalized to your needs.</p>
        
        <div class="finance-stats">
          <div class="stat-item">
            <div class="stat-label">Happy Customers</div>
            <div class="stat-value">3.5L+</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Finance Partners</div>
            <div class="stat-value">8+</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Starting Interest Rate</div>
            <div class="stat-value">8.99%</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Application Process</div>
            <div class="stat-value">&lt;10 Min</div>
          </div>
        </div>
        
        <div class="finance-actions">
          <button class="calculate-emi-btn">
            <span>→</span>
            Calculate EMI
          </button>
          <a href="#" class="explore-link">Explore</a>
        </div>
      </div>
    </div>
  `;
  
  // Create and append EMI calculator modal
  const modal = createEMICalculatorModal();
  document.body.appendChild(modal);
  
  // Initialize the EMI calculator
  initializeEMICalculator(modal);
  
  // Add event listener to Calculate EMI button
  const calculateBtn = block.querySelector('.calculate-emi-btn');
  calculateBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  });
  
  // Add event listener to Explore link
  const exploreLink = block.querySelector('.explore-link');
  exploreLink.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Explore finance clicked');
    // Add your explore logic here
    alert('Exploring finance options...');
  });
}
