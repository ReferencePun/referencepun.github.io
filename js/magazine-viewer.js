/**
 * Transmission Magazine PDF Viewer - Enhanced Version
 * Features: Sleek UI, responsive design, consistent sizing, improved UX
 * Last updated: April 2025
 */

//=============================================================================
// 1. CONFIGURATION AND INITIALIZATION
//=============================================================================

// PDF.js worker configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// State variables
let pdfDoc = null;
let currentPage = 1;
let pageRendering = false;
let pageCache = {};
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
 * Calculate appropriate scale based on screen size
 */
function calculateResponsiveScale() {
  const viewportWidth = window.innerWidth;
  
  // Base scale on viewport dimensions
  if (viewportWidth < 480) {
    return 0.8; // Mobile
  } else if (viewportWidth < 768) {
    return 1.0; // Small tablet
  } else if (viewportWidth < 1024) {
    return 1.2; // Large tablet
  } else if (viewportWidth < 1400) {
    return 1.3; // Small desktop
  } else {
    return 1.5; // Large desktop
  }
}

//=============================================================================
// 2. MAGAZINE OPENING AND PDF LOADING
//=============================================================================

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
          
          <!-- Controls container -->
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
              <button id="fullscreen-toggle" class="view-button" aria-label="Toggle fullscreen">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
              </button>
              
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
    
    // Set initial scale based on screen size
    scale = calculateResponsiveScale();
    
    // Set up event listeners
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const zoomInButton = document.getElementById('zoom-in');
    const zoomOutButton = document.getElementById('zoom-out');
    const viewToggleButton = document.getElementById('view-toggle');
    const fullscreenToggleButton = document.getElementById('fullscreen-toggle');
    const closeButton = document.getElementById('close-button');
    const pdfContainer = document.querySelector('.pdf-container');
    
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
    
    // Add responsive handling
    window.addEventListener('resize', adjustForMobileViewing);
    adjustForMobileViewing();
    
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
    
    // Create options for PDF.js with enhanced preloading
    const loadingOptions = {
      url: pdfPath,
      disableStream: isFileProtocol, 
      disableRange: isFileProtocol,
      disableAutoFetch: false,  // Enable auto fetching of pages
      rangeChunkSize: 65536,    // Optimal chunk size for faster fetching
      maxImageSize: 4096 * 4096, // Allow larger images for high-quality PDFs
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

//=============================================================================
// 3. PAGE RENDERING FUNCTIONS
//=============================================================================

/**
 * Render pages based on current view mode with optimizations
 */
function renderCurrentPages() {
  if (!pdfDoc) return;
  
  // Show loading placeholder
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(canvas.width/4, canvas.height/2 - 1, canvas.width/2, 2);
  }
  
  if (viewMode === 'single') {
    // Single page mode
    secondPageCanvas.style.display = 'none';
    renderPage(currentPage);
    // Preload adjacent pages for faster navigation
    preloadAdjacentPages(currentPage);
  } else {
    // Double page mode
    // Handle special cases for cover and back cover
    if (currentPage === 1) {
      // First page (cover) is always shown alone
      secondPageCanvas.style.display = 'none';
      renderPage(currentPage);
      // Preload next page
      if (currentPage + 1 <= pdfDoc.numPages) {
        pdfDoc.getPage(currentPage + 1);
      }
    } else if (currentPage === pdfDoc.numPages) {
      // Last page (back cover) is shown alone if total pages is odd
      secondPageCanvas.style.display = 'none';
      renderPage(currentPage);
      // Preload previous page
      if (currentPage - 1 >= 1) {
        pdfDoc.getPage(currentPage - 1);
      }
    } else {
      // Regular spread - show two pages side by side
      let leftPage, rightPage;
      
      // Explicitly set second canvas to be visible
      secondPageCanvas.style.display = 'block';
      
      if (currentPage % 2 === 0) {
        // Even page number
        leftPage = currentPage;
        rightPage = Math.min(currentPage + 1, pdfDoc.numPages);
      } else {
        // Odd page number
        leftPage = Math.max(currentPage - 1, 1);
        rightPage = currentPage;
      }
      
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
      
      // Preload next spread
      if (currentPage + 2 <= pdfDoc.numPages) {
        pdfDoc.getPage(currentPage + 2);
      }
    }
  }
  
  // Update navigation button states
  updateNavigationState();
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
  
  // Render to the main canvas with consistent sizing
  renderPageToCanvas(pageNumber, canvas, ctx);
}

/**
 * Render a page to a specific canvas with caching
 */
function renderPageToCanvas(pageNumber, targetCanvas, targetCtx) {
  if (!pdfDoc) return;
  
  pageRendering = true;
  
  // Check if page is in cache
  const cacheKey = `page_${pageNumber}_${scale}`;
  if (pageCache[cacheKey]) {
    // Reuse cached image data
    targetCanvas.width = pageCache[cacheKey].width;
    targetCanvas.height = pageCache[cacheKey].height;
    targetCtx.putImageData(pageCache[cacheKey].imageData, 0, 0);
    pageRendering = false;
    return;
  }
  
  // Render at full quality 
  pdfDoc.getPage(pageNumber).then(function(page) {
    const viewport = page.getViewport({ scale: scale });
    
    targetCanvas.height = viewport.height;
    targetCanvas.width = viewport.width;
    
    // Configure rendering for best quality
    targetCtx.imageSmoothingEnabled = true;
    targetCtx.imageSmoothingQuality = 'high';
    
    const renderContext = {
      canvasContext: targetCtx,
      viewport: viewport,
      intent: 'display'
    };
    
    const renderTask = page.render(renderContext);
    
    renderTask.promise.then(function() {
      // Cache the rendered page
      pageCache[cacheKey] = {
        width: targetCanvas.width,
        height: targetCanvas.height,
        imageData: targetCtx.getImageData(0, 0, targetCanvas.width, targetCanvas.height)
      };
      
      // Limit cache size to prevent memory issues
      const cacheKeys = Object.keys(pageCache);
      if (cacheKeys.length > 10) {
        delete pageCache[cacheKeys[0]];
      }
      
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
 * Preload adjacent pages for faster navigation - enhanced version
 */
function preloadAdjacentPages(currentPageNum) {
  if (!pdfDoc) return;
  
  // Keep track of pages being preloaded
  if (!window.preloadingPages) {
    window.preloadingPages = {};
  }
  
  // Function to preload a single page more thoroughly
  const preloadPage = (pageNum) => {
    // Skip if already preloaded or currently visible
    if (window.preloadingPages[pageNum] || pageNum === currentPage) return;
    
    // Mark as being preloaded
    window.preloadingPages[pageNum] = true;
    
    // Actually preload the page by going through full rendering preparation
    pdfDoc.getPage(pageNum).then(page => {
      // Generate the viewport (this forces PDF.js to prepare the page)
      const viewport = page.getViewport({ scale: scale });
      
      // Create cache key
      const cacheKey = `page_${pageNum}_${scale}`;
      
      // Skip further processing if already in cache
      if (pageCache[cacheKey]) {
        window.preloadingPages[pageNum] = false;
        return;
      }
      
      // Create temporary canvas for off-screen rendering
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = viewport.width;
      tempCanvas.height = viewport.height;
      const tempCtx = tempCanvas.getContext('2d', { alpha: false });
      
      // Pre-render to the temporary canvas
      page.render({
        canvasContext: tempCtx,
        viewport: viewport
      }).promise.then(() => {
        // Cache the rendered page
        pageCache[cacheKey] = {
          width: tempCanvas.width,
          height: tempCanvas.height,
          imageData: tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
        };
        
        // Cleanup
        window.preloadingPages[pageNum] = false;
      });
    }).catch(error => {
      console.error(`Error preloading page ${pageNum}:`, error);
      window.preloadingPages[pageNum] = false;
    });
  };
  
  // Preload next few pages
  for (let i = 1; i <= 2; i++) {
    const nextPage = currentPageNum + i;
    if (nextPage <= pdfDoc.numPages) {
      preloadPage(nextPage);
    }
  }
  
  // Preload previous page
  if (currentPageNum > 1) {
    preloadPage(currentPageNum - 1);
  }
}

//=============================================================================
// 4. NAVIGATION FUNCTIONS
//=============================================================================

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

//=============================================================================
// 5. VIEW MODE CONTROLS
//=============================================================================

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
      
      // Update container class based on view mode
      if (viewMode === 'single') {
        pageContainer.classList.add('single-view');
      } else {
        pageContainer.classList.remove('single-view');
      }
      
      if (viewToggleButton) {
        // Update icon based on current view mode
        if (viewMode === 'single') {
          viewToggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="6" height="16"></rect><rect x="14" y="4" width="6" height="16"></rect></svg>`;
          viewToggleButton.setAttribute('aria-label', 'Switch to double page view');
        } else {
          viewToggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect></svg>`;
          viewToggleButton.setAttribute('aria-label', 'Switch to single page view');
        }
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
 * Adjust viewer for responsive viewing while preserving layout
 */
function adjustForMobileViewing() {
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  
  // Adjust scale based on screen size but don't change view mode
  if (isMobile) {
    // Smaller scale for mobile, but don't change page mode
    scale = Math.min(0.8, scale);
  } else if (isTablet) {
    scale = Math.min(1.2, scale);
  } else {
    // On desktop, restore default scale if it was lowered
    if (scale < 1.3) scale = 1.5;
  }
  
  // Adjust buttons and controls for better touch targets
  const buttons = document.querySelectorAll('.nav-button, .view-button');
  buttons.forEach(btn => {
    btn.style.padding = isMobile ? '10px' : '8px';
  });
  
  // Adjust PDF container size
  const pdfContainer = document.querySelector('.pdf-container');
  if (pdfContainer) {
    // Set max-width to ensure content fits
    pdfContainer.style.maxWidth = '100%';
  }
  
  // Make both canvases visible when in double mode
  if (viewMode === 'double') {
    const secondCanvas = document.getElementById('second-pdf-canvas');
    if (secondCanvas) {
      secondCanvas.style.display = 'block';
    }
  }
  
  // Re-render with new settings if PDF is loaded
  if (pdfDoc) {
    renderCurrentPages();
  }
}

/**
 * Toggle fullscreen mode with improved mobile support
 */
function toggleFullscreen() {
  const modalContent = document.querySelector('.modal-content');
  const fullscreenButton = document.getElementById('fullscreen-toggle');
  
  // Check if currently in fullscreen
  const isCurrentlyFullscreen = !!document.fullscreenElement || 
                               !!document.webkitFullscreenElement || 
                               !!document.mozFullScreenElement ||
                               !!document.msFullscreenElement;
  
  try {
    if (!isCurrentlyFullscreen) {
      // Enter fullscreen - with all vendor prefixes for mobile support
      if (modalContent.requestFullscreen) {
        modalContent.requestFullscreen();
      } else if (modalContent.webkitRequestFullscreen) {
        // Safari & Chrome
        modalContent.webkitRequestFullscreen();
      } else if (modalContent.mozRequestFullScreen) {
        // Firefox
        modalContent.mozRequestFullScreen();
      } else if (modalContent.msRequestFullscreen) {
        // IE/Edge
        modalContent.msRequestFullscreen();
      } else if (document.body.webkitEnterFullscreen) {
        // iOS Safari
        document.body.webkitEnterFullscreen();
      }
    } else {
      // Exit fullscreen - with all vendor prefixes
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    
    // Update button immediately for better responsiveness
    if (fullscreenButton) {
      setTimeout(() => {
        // Check again after a short delay to ensure accurate state
        const isInFullscreen = !!document.fullscreenElement || 
                              !!document.webkitFullscreenElement || 
                              !!document.mozFullScreenElement ||
                              !!document.msFullscreenElement;
                              
        if (isInFullscreen) {
          fullscreenButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>`;
          fullscreenButton.setAttribute('aria-label', 'Exit fullscreen');
        } else {
          fullscreenButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`;
          fullscreenButton.setAttribute('aria-label', 'Enter fullscreen');
        }
      }, 300);
    }
  } catch (error) {
    console.error('Fullscreen error:', error);
    // Fallback for devices that don't support fullscreen
    const magazineViewer = document.querySelector('.magazine-viewer');
    if (magazineViewer) {
      magazineViewer.classList.toggle('simulated-fullscreen');
    }
  }
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

//=============================================================================
// 6. ZOOM CONTROLS
//=============================================================================

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

//=============================================================================
// 7. EVENT HANDLERS
//=============================================================================

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

//=============================================================================
// 8. MODAL CLOSING
//=============================================================================

/**
 * Close the modal with fade-out effect and proper cleanup
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
        
        // Clear the modal content to prevent caching issues
        modal.innerHTML = '';
      }, 300);
    }
    
    // Remove keyboard listener
    window.removeEventListener('keydown', handleKeyPress);
    
    // IMPORTANT: Clear PDF data and cache
    pdfDoc = null;
    pageRendering = false;
    pageNumPending = null;
    currentPage = 1;
    isFullscreen = false;
    viewMode = 'double';
    isTransitioning = false;
    scale = 1.5;
    
    // Clear canvas references
    canvas = null;
    ctx = null;
    secondPageCanvas = null;
    
    // Clear page cache completely
    pageCache = {};
    
    // Clear preloading tracking
    if (window.preloadingPages) {
      window.preloadingPages = {};
    }
    
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
      modal.innerHTML = ''; // Clear content in fallback as well
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