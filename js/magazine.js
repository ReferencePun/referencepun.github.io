/**
 * Transmission Magazine functionality
 */

// Set current year in footer
document.addEventListener('DOMContentLoaded', function() {
    console.log('Magazine script loaded');
    
    // Update year in footer
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
});

/**
 * Opens a magazine in a modal
 */
function openMagazine(pdfPath) {
    console.log('Opening magazine:', pdfPath);
    
    const modal = document.getElementById('magazine-modal');
    
    if (!modal) {
      console.error('Magazine modal not found');
      return;
    }
    
    // Display the modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Initialize the magazine viewer
    if (typeof initMagazineViewer === 'function') {
      // Get the modal content element
      const modalContent = document.querySelector('#magazine-modal .modal-content');
      
      // Setup viewer HTML
      modalContent.innerHTML = `
        <button class="close-button" onclick="closeModal()">&times;</button>
        
        <div class="magazine-viewer">
          <div id="magazine-loading" class="magazine-loading">
            <div class="loading-spinner"></div>
            <div class="loading-text">Loading magazine...</div>
          </div>
          
          <div id="magazine-error" class="magazine-error"></div>
          
          <div id="magazine-wrapper" class="magazine-wrapper">
            <div id="magazine-container" class="magazine-container"></div>
          </div>
          
          <div class="magazine-controls">
            <div class="nav-buttons">
              <button id="first-page" class="control-button" title="First Page">
                <span>&#171;</span>
              </button>
              <button id="prev-page" class="control-button" title="Previous Page">
                <span>&lt;</span>
              </button>
              <div class="page-info">
                <span>Page <span id="current-page">1</span> of <span id="total-pages">-</span></span>
              </div>
              <button id="next-page" class="control-button" title="Next Page">
                <span>&gt;</span>
              </button>
              <button id="last-page" class="control-button" title="Last Page">
                <span>&#187;</span>
              </button>
            </div>
            
            <div class="view-controls">
              <button id="zoom-out" class="control-button" title="Zoom Out">−</button>
              <button id="zoom-reset" class="control-button" title="Reset Zoom">100%</button>
              <button id="zoom-in" class="control-button" title="Zoom In">+</button>
              <button id="view-toggle" class="control-button" title="Toggle View Mode">Single Page</button>
            </div>
          </div>
        </div>
      `;
      
      // Initialize the magazine viewer with a slight delay to ensure DOM is ready
      setTimeout(() => {
        initMagazineViewer(pdfPath);
      }, 100);
    } else {
      console.error('Magazine viewer not initialized - missing magazine-viewer.js');
      alert('Error: Magazine viewer not available. Check console for details.');
    }
}

/**
 * Handle keyboard navigation
 */
function handleKeyNavigation(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
}

/**
 * Closes the magazine modal
 */
function closeModal() {
    console.log('Closing modal');
    
    const modal = document.getElementById('magazine-modal');
    const embedContainer = document.getElementById('embed-container');
    
    if (!modal) {
        console.error('Modal not found when trying to close');
        return;
    }
    
    // Hide the modal
    modal.style.display = 'none';
    
    // Clear the embed
    if (embedContainer) {
        embedContainer.innerHTML = '';
    }
    
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
    
    // Remove event listener
    window.removeEventListener('keydown', handleKeyNavigation);
}

// Global click handler to close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('magazine-modal');
    if (event.target === modal) {
        closeModal();
    }
};