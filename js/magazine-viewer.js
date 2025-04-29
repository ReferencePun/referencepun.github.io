/**
 * Transmission Magazine PDF Viewer - Enhanced Version
 * Features: Sleek UI, animations, minimalist controls, improved UX
 */

// PDF.js worker configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// State variables
let pdfDoc = null;
let currentPage = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;
let canvas = null;
let ctx = null;
let secondPageCanvas = null;
let viewMode = 'double'; // 'single' or 'double'
let isFullscreen = false;
let controlsVisible = true;
let controlsTimeout = null;
let isTransitioning = false; // Flag to prevent multiple transitions

/**
 * Opens a magazine PDF in the modal with enhanced UI
 */
function openMagazine(pdfPath) {
  console.log('Opening magazine:', pdfPath);
  
  // Fix for spaces in filenames and path issues
  const encodedPath = pdfPath.replace(/ /g, '%20');
  
  const modal = document.getElementById('magazine-modal');
  if (!modal) {
    console.error('Magazine modal not found');
    return;
  }
  
  try {
    // Set up the modal content with improved UI
    // In the openMagazine function, modify the modal content HTML
    modal.innerHTML = `
      <div class="modal-content">
        <div class="magazine-viewer">
          <div class="pdf-status">
            <div id="loading-indicator" class="loading-indicator">
              <div class="spinner"></div>
              <span>Loading magazine...</span>
            </div>
            <div id="error-message" class="error-message" style="display:none;"></div>
          </div>
          
          <div class="pdf-container">
            <div id="page-container" class="page-container">
              <canvas id="pdf-canvas"></canvas>
              <canvas id="second-pdf-canvas" style="display: none;"></canvas>
            </div>
          </div>
          
          <!-- Move controls outside the container -->
          <div class="pdf-controls-fixed" id="pdf-controls">
            <button id="prev-button" class="nav-button" aria-label="Previous page">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            
            <span id="page-info" class="page-info">Page <span id="page-num">1</span> / <span id="page-count">?</span></span>
            
            <button id="next-button" class="nav-button" aria-label="Next page">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            
            <div class="controls-spacer"></div>
            
            <div class="view-controls">
              <button id="view-toggle" class="view-button" aria-label="Toggle view mode">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect></svg>
              </button>
              
              <button id="fullscreen-toggle" class="view-button" aria-label="Toggle fullscreen">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
              </button>
              
              <button id="zoom-out" class="view-button" aria-label="Zoom out">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              </button>
              
              <button id="zoom-in" class="view-button" aria-label="Zoom in">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              </button>
            </div>
            
            <button id="close-button" class="close-button" aria-label="Close viewer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Make modal visible with fade-in effect
    modal.classList.add('fade-in');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Get canvas references after DOM update
    canvas = document.getElementById('pdf-canvas');
    ctx = canvas.getContext('2d');
    secondPageCanvas = document.getElementById('second-pdf-canvas');
    const secondCtx = secondPageCanvas.getContext('2d');
    
    // Set up event listeners
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const zoomInButton = document.getElementById('zoom-in');
    const zoomOutButton = document.getElementById('zoom-out');
    const viewToggleButton = document.getElementById('view-toggle');
    const fullscreenToggleButton = document.getElementById('fullscreen-toggle');
    const closeButton = document.getElementById('close-button');
    const pdfContainer = document.querySelector('.pdf-container');
    const controls = document.getElementById('pdf-controls');
    
    if (prevButton) prevButton.addEventListener('click', onPrevPage);
    if (nextButton) nextButton.addEventListener('click', onNextPage);
    if (zoomInButton) zoomInButton.addEventListener('click', onZoomIn);
    if (zoomOutButton) zoomOutButton.addEventListener('click', onZoomOut);
    if (viewToggleButton) viewToggleButton.addEventListener('click', toggleViewMode);
    if (fullscreenToggleButton) fullscreenToggleButton.addEventListener('click', toggleFullscreen);
    if (closeButton) closeButton.addEventListener('click', closeModal);
    
    // Add keyboard navigation
    window.addEventListener('keydown', handleKeyPress);
    
    // Add touch swipe navigation
    setupTouchNavigation(pdfContainer);
    
    // Load the PDF using the encoded path
    loadPdf(encodedPath);
  } catch (error) {
    console.error('Error setting up magazine viewer:', error);
    modal.innerHTML = `
      <div class="modal-content">
        <button class="close-button" onclick="closeModal()">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div style="padding: 20px; color: #c00;">
          <h3>Unable to open magazine</h3>
          <p>${error.message}</p>
        </div>
      </div>
    `;
    modal.style.display = 'block';
  }
}

/**
 * Set up touch navigation for swiping between pages
 */
function setupTouchNavigation(element) {
  let touchStartX = 0;
  let touchEndX = 0;
  
  element.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  element.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const swipeThreshold = 50; // Minimum distance to trigger swipe
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swiped left - next page
      onNextPage();
    } else if (touchEndX > touchStartX + swipeThreshold) {
      // Swiped right - previous page
      onPrevPage();
    }
  }
}

/**
 * Load a PDF document with enhanced error handling
 */
function loadPdf(pdfPath) {
  try {
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    
    if (loadingIndicator) loadingIndicator.style.display = 'flex';
    if (errorMessage) errorMessage.style.display = 'none';
    
    // Check if we're using file:// protocol (which has CORS issues)
    const isFileProtocol = window.location.protocol === 'file:';
    if (isFileProtocol) {
      console.warn('Using file:// protocol may cause PDF loading issues due to security restrictions.');
    }
    
    // Create options for PDF.js
    const loadingOptions = {
      url: pdfPath,
      disableStream: isFileProtocol, 
      disableRange: isFileProtocol,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/cmaps/',
      cMapPacked: true
    };
    
    // Load the PDF document with options
    pdfjsLib.getDocument(loadingOptions).promise
      .then(function(pdf) {
        pdfDoc = pdf;
        const pageCount = document.getElementById('page-count');
        if (pageCount) pageCount.textContent = pdf.numPages;
        
        if (loadingIndicator) {
          // Add fade-out animation to loading indicator
          loadingIndicator.classList.add('fade-out');
          setTimeout(() => {
            loadingIndicator.style.display = 'none';
            loadingIndicator.classList.remove('fade-out');
          }, 500);
        }
        
        // Render pages with animation
        setTimeout(() => {
          renderCurrentPages();
        }, 100);
      })
      .catch(function(error) {
        console.error('Error loading PDF:', error);
        
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        
        // Show detailed error message
        if (errorMessage) {
          errorMessage.innerHTML = `
            <div class="error-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <h3>Unable to load magazine</h3>
              <p>${error.message}</p>
              <p class="error-path">Path: ${pdfPath}</p>
            </div>
          `;
          errorMessage.style.display = 'flex';
        }
      });
  } catch (error) {
    console.error('Exception during PDF loading:', error);
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
      errorMessage.innerHTML = `
        <div class="error-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <h3>Error</h3>
          <p>${error.message}</p>
        </div>
      `;
      errorMessage.style.display = 'flex';
      
      const loadingIndicator = document.getElementById('loading-indicator');
      if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
  }
}

/**
 * Toggle between single and double-page views with smooth transition
 */
function toggleViewMode() {
  if (isTransitioning) return;
  isTransitioning = true;
  
  const viewToggleButton = document.getElementById('view-toggle');
  const pageContainer = document.getElementById('page-container');
  
  if (pageContainer) {
    pageContainer.classList.add('page-transition');
    
    setTimeout(() => {
      viewMode = viewMode === 'single' ? 'double' : 'single';
      
      if (viewToggleButton) {
        // Update initial icon based on view mode being 'double' by default
        viewToggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect></svg>`;
        viewToggleButton.setAttribute('aria-label', 'Switch to single page view');
      }
      
      // Render pages before transition completes
      renderCurrentPages();
      
      // Remove transition class after animation
      setTimeout(() => {
        if (pageContainer) pageContainer.classList.remove('page-transition');
        isTransitioning = false;
      }, 250);
    }, 100); // Shorter delay before switching modes
  } else {
    viewMode = viewMode === 'single' ? 'double' : 'single';
    renderCurrentPages();
    isTransitioning = false;
  }
}

/**
 * Toggle fullscreen mode with improved handling
 */
function toggleFullscreen() {
  const modalContent = document.querySelector('.modal-content');
  const fullscreenButton = document.getElementById('fullscreen-toggle');
  
  if (!isFullscreen) {
    // Enter fullscreen
    if (modalContent.requestFullscreen) {
      modalContent.requestFullscreen();
    } else if (modalContent.webkitRequestFullscreen) {
      modalContent.webkitRequestFullscreen();
    } else if (modalContent.msRequestFullscreen) {
      modalContent.msRequestFullscreen();
    }
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
  
  // Update fullscreen state
  isFullscreen = !isFullscreen;
  
  // Update icon
  if (fullscreenButton) {
    if (isFullscreen) {
      fullscreenButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>`;
      fullscreenButton.setAttribute('aria-label', 'Exit fullscreen');
    } else {
      fullscreenButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`;
      fullscreenButton.setAttribute('aria-label', 'Enter fullscreen');
    }
  }
  
  // Listen for fullscreen change events
  document.addEventListener('fullscreenchange', updateFullscreenState);
  document.addEventListener('webkitfullscreenchange', updateFullscreenState);
  document.addEventListener('mozfullscreenchange', updateFullscreenState);
  document.addEventListener('MSFullscreenChange', updateFullscreenState);
}

/**
 * Update fullscreen state based on system events
 */
function updateFullscreenState() {
  const fullscreenButton = document.getElementById('fullscreen-toggle');
  
  // Check if actually in fullscreen mode (handles Escape key exit)
  isFullscreen = !!document.fullscreenElement || 
                 !!document.webkitFullscreenElement || 
                 !!document.mozFullScreenElement ||
                 !!document.msFullscreenElement;
  
  // Update icon
  if (fullscreenButton) {
    if (isFullscreen) {
      fullscreenButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>`;
      fullscreenButton.setAttribute('aria-label', 'Exit fullscreen');
    } else {
      fullscreenButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`;
      fullscreenButton.setAttribute('aria-label', 'Enter fullscreen');
    }
  }
}

/**
 * Render pages based on current view mode
 */
function renderCurrentPages() {
  if (!pdfDoc) return;
  
  if (viewMode === 'single') {
    // Single page mode
    secondPageCanvas.style.display = 'none';
    renderPage(currentPage);
  } else {
    // Double page mode
    // Handle special cases for cover and back cover
    if (currentPage === 1) {
      // First page (cover) is always shown alone
      secondPageCanvas.style.display = 'none';
      renderPage(currentPage);
    } else if (currentPage === pdfDoc.numPages) {
      // Last page (back cover) is shown alone if total pages is odd
      secondPageCanvas.style.display = 'none';
      renderPage(currentPage);
    } else {
      // Regular spread - show two pages side by side
      // For even pages, show current page on left and next page on right
      // For odd pages, show previous page on left and current page on right
      let leftPage, rightPage;
      
      if (currentPage % 2 === 0) {
        // Even page number
        leftPage = currentPage;
        rightPage = Math.min(currentPage + 1, pdfDoc.numPages);
      } else {
        // Odd page number
        leftPage = Math.max(currentPage - 1, 1);
        rightPage = currentPage;
      }
      
      secondPageCanvas.style.display = 'block';
      
      // Render left page
      renderPageToCanvas(leftPage, canvas, ctx);
      
      // Render right page (if not the last page)
      if (rightPage <= pdfDoc.numPages) {
        renderPageToCanvas(rightPage, secondPageCanvas, secondPageCanvas.getContext('2d'));
      }
      
      // Update page display number
      const pageNum = document.getElementById('page-num');
      if (pageNum) {
        pageNum.textContent = leftPage === rightPage ? leftPage : `${leftPage}-${rightPage}`;
      }
    }
  }
  
  // Update navigation button states
  updateNavigationState();
}

/**
 * Update the state of navigation buttons
 */
function updateNavigationState() {
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');
  
  if (prevButton) {
    if (currentPage <= 1) {
      prevButton.classList.add('disabled');
      prevButton.setAttribute('disabled', 'disabled');
    } else {
      prevButton.classList.remove('disabled');
      prevButton.removeAttribute('disabled');
    }
  }
  
  if (nextButton) {
    if (currentPage >= pdfDoc.numPages) {
      nextButton.classList.add('disabled');
      nextButton.setAttribute('disabled', 'disabled');
    } else {
      nextButton.classList.remove('disabled');
      nextButton.removeAttribute('disabled');
    }
  }
}

/**
 * Render a page to a specific canvas with improved rendering
 */
function renderPageToCanvas(pageNumber, targetCanvas, targetCtx) {
  if (!pdfDoc) return;
  
  pageRendering = true;
  
  // Make sure canvas is visible during rendering
  targetCanvas.style.opacity = "1";
  
  pdfDoc.getPage(pageNumber).then(function(page) {
    const viewport = page.getViewport({ scale: scale });
    
    targetCanvas.height = viewport.height;
    targetCanvas.width = viewport.width;
    
    // Add rendering styles for better quality
    targetCtx.imageSmoothingEnabled = true;
    targetCtx.imageSmoothingQuality = 'high';
    
    const renderContext = {
      canvasContext: targetCtx,
      viewport: viewport,
      intent: 'display'
    };
    
    const renderTask = page.render(renderContext);
    
    renderTask.promise.then(function() {
      pageRendering = false;
      
      if (pageNumPending !== null) {
        renderCurrentPages();
        pageNumPending = null;
      }
      
      // Add subtle fade-in effect to rendered page
      targetCanvas.classList.add('page-loaded');
      setTimeout(() => {
        targetCanvas.classList.remove('page-loaded');
      }, 300);
    });
  }).catch(function(error) {
    console.error('Error rendering page:', error);
    pageRendering = false;
  });
}

/**
 * Render a single page (used in single page mode)
 */
function renderPage(pageNumber) {
  if (!pdfDoc) return;
  
  pageRendering = true;
  
  // Update page status
  const pageNum = document.getElementById('page-num');
  if (pageNum) pageNum.textContent = pageNumber;
  
  // Render to the main canvas
  renderPageToCanvas(pageNumber, canvas, ctx);
}

/**
 * Queue rendering pages if already rendering
 */
function queueRenderPage(pageNum) {
  if (pageRendering) {
    pageNumPending = pageNum;
  } else {
    renderCurrentPages();
  }
}

/**
 * Go to previous page with improved animation
 */
function onPrevPage() {
  if (!pdfDoc || currentPage <= 1 || isTransitioning) return;
  
  isTransitioning = true;
  
  const pageContainer = document.getElementById('page-container');
  if (pageContainer) pageContainer.classList.add('turn-right');
  
  // Shorter delay for better responsiveness
  setTimeout(() => {
    // Remove transition class first to prevent stacking animations
    if (pageContainer) pageContainer.classList.remove('turn-right');
    
    if (viewMode === 'single') {
      currentPage--;
    } else {
      // In double mode, move back two pages (except for special cases)
      if (currentPage === pdfDoc.numPages && pdfDoc.numPages % 2 === 1) {
        // If on last page and total pages is odd, go back to the spread
        currentPage = Math.max(1, currentPage - 1);
      } else {
        currentPage = Math.max(1, currentPage - 2);
      }
    }
    
    // Render new page immediately
    renderCurrentPages();
    isTransitioning = false;
  }, 150);
}

/**
 * Go to next page with improved animation
 */
function onNextPage() {
  if (!pdfDoc || currentPage >= pdfDoc.numPages || isTransitioning) return;
  
  isTransitioning = true;
  
  const pageContainer = document.getElementById('page-container');
  if (pageContainer) pageContainer.classList.add('turn-left');
  
  // Shorter delay for better responsiveness
  setTimeout(() => {
    // Remove transition class first to prevent stacking animations
    if (pageContainer) pageContainer.classList.remove('turn-left');
    
    if (viewMode === 'single') {
      currentPage++;
    } else {
      // In double mode, move forward two pages (except for special cases)
      if (currentPage === 1) {
        // If on cover, go to first spread
        currentPage = 2;
      } else {
        currentPage = Math.min(pdfDoc.numPages, currentPage + 2);
      }
    }
    
    // Render new page immediately
    renderCurrentPages();
    isTransitioning = false;
  }, 150);
}

/**
 * Handle keyboard navigation
 */
function handleKeyPress(event) {
  if (!pdfDoc) return;
  
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    onPrevPage();
    event.preventDefault();
  } else if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
    onNextPage();
    event.preventDefault();
  } else if (event.key === 'Home') {
    currentPage = 1;
    queueRenderPage(currentPage);
    event.preventDefault();
  } else if (event.key === 'End') {
    currentPage = pdfDoc.numPages;
    queueRenderPage(currentPage);
    event.preventDefault();
  } else if (event.key === 'Escape' && !isFullscreen) {
    closeModal();
  } else if (event.key === 'f') {
    toggleFullscreen();
    event.preventDefault();
  } else if (event.key === 'v') {
    toggleViewMode();
    event.preventDefault();
  } else if (event.key === '+' || event.key === '=') {
    onZoomIn();
    event.preventDefault();
  } else if (event.key === '-') {
    onZoomOut();
    event.preventDefault();
  }
}

/**
 * Zoom in with smooth transition
 */
function onZoomIn() {
  if (isTransitioning) return;
  
  const oldScale = scale;
  scale += 0.25;
  applyZoomTransition(oldScale, scale);
}

/**
 * Zoom out with smooth transition
 */
function onZoomOut() {
  if (scale <= 0.5 || isTransitioning) return;
  
  const oldScale = scale;
  scale -= 0.25;
  applyZoomTransition(oldScale, scale);
}

/**
 * Apply smooth zoom transition
 */
function applyZoomTransition(oldScale, newScale) {
  isTransitioning = true;
  
  const pageContainer = document.getElementById('page-container');
  if (!pageContainer || !pdfDoc) return;
  
  // Apply subtle zoom animation
  pageContainer.style.transition = 'transform 0.25s ease-out';
  pageContainer.style.transform = `scale(${newScale / oldScale})`;
  
  // Reset transform after transition
  setTimeout(() => {
    pageContainer.style.transition = '';
    pageContainer.style.transform = '';
    renderCurrentPages();
    isTransitioning = false;
  }, 250);
}

/**
 * Close the modal with fade-out effect
 */
function closeModal() {
  try {
    // Exit fullscreen if active
    if (isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    
    // Remove fullscreen listeners
    document.removeEventListener('fullscreenchange', updateFullscreenState);
    document.removeEventListener('webkitfullscreenchange', updateFullscreenState);
    document.removeEventListener('mozfullscreenchange', updateFullscreenState);
    document.removeEventListener('MSFullscreenChange', updateFullscreenState);
    
    const modal = document.getElementById('magazine-modal');
    if (modal) {
      // Add fade-out animation
      modal.classList.add('fade-out');
      
      // Close after animation completes
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('fade-out');
        modal.classList.remove('fade-in');
        document.body.style.overflow = 'auto';
      }, 300);
    }
    
    // Remove keyboard listener
    window.removeEventListener('keydown', handleKeyPress);
    
    // Clear PDF data
    pdfDoc = null;
    pageRendering = false;
    pageNumPending = null;
    currentPage = 1;
    isFullscreen = false;
    viewMode = 'double'; // Reset to single page view for next time
    isTransitioning = false;
    
    // Clear controls timeout
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
      controlsTimeout = null;
    }
  } catch (error) {
    console.error('Error closing modal:', error);
    
    // Fallback close if animation fails
    const modal = document.getElementById('magazine-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }
}

// Close modal when clicking outside the content
window.onclick = function(event) {
  const modal = document.getElementById('magazine-modal');
  if (event.target === modal) {
    closeModal();
  }
};