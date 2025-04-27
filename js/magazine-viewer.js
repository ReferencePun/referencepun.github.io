/**
 * Transmission Magazine PDF Viewer
 * Features: Single/Double page view, Fullscreen mode, Navigation controls
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
let viewMode = 'single'; // 'single' or 'double'
let isFullscreen = false;

/**
 * Opens a magazine PDF in the modal
 */
function openMagazine(pdfPath) {
  console.log('Opening magazine:', pdfPath);
  
  // Fix for spaces in filenames and path issues
  const encodedPath = pdfPath.replace(/ /g, '%20');
  console.log('Encoded path:', encodedPath);
  
  const modal = document.getElementById('magazine-modal');
  if (!modal) {
    console.error('Magazine modal not found');
    return;
  }
  
  try {
    // Set up the modal content
    modal.innerHTML = `
      <div class="modal-content">
        <button class="close-button" onclick="closeModal()">&times;</button>
        
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
          
          <div class="pdf-controls">
            <button id="prev-button" class="nav-button">&lt; Previous</button>
            <span id="page-info" class="page-info">Page <span id="page-num">1</span> / <span id="page-count">?</span></span>
            <button id="next-button" class="nav-button">Next &gt;</button>
            
            <div class="view-controls">
              <button id="view-toggle" class="view-button">View: Single Page</button>
              <button id="fullscreen-toggle" class="view-button">Fullscreen</button>
            </div>
            
            <div class="zoom-controls">
              <button id="zoom-out" class="zoom-button">-</button>
              <button id="zoom-in" class="zoom-button">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Make modal visible
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
    
    if (prevButton) prevButton.addEventListener('click', onPrevPage);
    if (nextButton) nextButton.addEventListener('click', onNextPage);
    if (zoomInButton) zoomInButton.addEventListener('click', onZoomIn);
    if (zoomOutButton) zoomOutButton.addEventListener('click', onZoomOut);
    if (viewToggleButton) viewToggleButton.addEventListener('click', toggleViewMode);
    if (fullscreenToggleButton) fullscreenToggleButton.addEventListener('click', toggleFullscreen);
    
    // Add keyboard navigation
    window.addEventListener('keydown', handleKeyPress);
    
    // Load the PDF using the encoded path
    loadPdf(encodedPath);
  } catch (error) {
    console.error('Error setting up magazine viewer:', error);
    modal.innerHTML = `
      <div class="modal-content">
        <button class="close-button" onclick="closeModal()">&times;</button>
        <div style="padding: 20px; color: red;">
          <h3>Error setting up the magazine viewer</h3>
          <p>${error.message}</p>
        </div>
      </div>
    `;
    modal.style.display = 'block';
  }
}

/**
 * Load a PDF document
 */
function loadPdf(pdfPath) {
  try {
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    
    if (loadingIndicator) loadingIndicator.style.display = 'flex';
    if (errorMessage) errorMessage.style.display = 'none';
    
    console.log('Attempting to load PDF from:', pdfPath);
    
    // Check if we're using file:// protocol (which has CORS issues)
    const isFileProtocol = window.location.protocol === 'file:';
    if (isFileProtocol) {
      console.warn('Using file:// protocol may cause PDF loading issues due to security restrictions.');
    }
    
    // Create options for PDF.js
    const loadingOptions = {
      url: pdfPath,
      disableStream: isFileProtocol, // Disable streaming for file:// protocol
      disableRange: isFileProtocol,  // Disable range requests for file:// protocol
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/cmaps/',
      cMapPacked: true
    };
    
    // Load the PDF document with options
    pdfjsLib.getDocument(loadingOptions).promise
      .then(function(pdf) {
        pdfDoc = pdf;
        const pageCount = document.getElementById('page-count');
        if (pageCount) pageCount.textContent = pdf.numPages;
        
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        renderCurrentPages();
      })
      .catch(function(error) {
        console.error('Error loading PDF:', error);
        
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        
        // Show detailed error message
        if (errorMessage) {
          errorMessage.innerHTML = `
            <p>Error loading PDF: ${error.message}</p>
            <p>Attempted to load: ${pdfPath}</p>
            <hr>
            <p>Troubleshooting tips:</p>
            <ul>
              <li>If using file:// URLs, try a web server instead</li>
              <li>Check if the PDF exists at this location</li>
              <li>Try using relative paths (./pdfs/filename.pdf)</li>
            </ul>
          `;
          errorMessage.style.display = 'block';
        }
      });
  } catch (error) {
    console.error('Exception during PDF loading:', error);
    const modal = document.getElementById('magazine-modal');
    if (modal) {
      modal.innerHTML = `
        <div class="modal-content">
          <button class="close-button" onclick="closeModal()">&times;</button>
          <div style="padding: 20px; color: red;">
            <h3>Error loading PDF</h3>
            <p>${error.message}</p>
          </div>
        </div>
      `;
    }
  }
}

/**
 * Toggle between single and double-page views
 */
function toggleViewMode() {
  viewMode = viewMode === 'single' ? 'double' : 'single';
  const toggleButton = document.getElementById('view-toggle');
  if (toggleButton) {
    toggleButton.textContent = `View: ${viewMode === 'single' ? 'Single Page' : 'Double Pages'}`;
  }
  renderCurrentPages();
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
  const modalContent = document.querySelector('.modal-content');
  
  if (!isFullscreen) {
    // Enter fullscreen
    if (modalContent.requestFullscreen) {
      modalContent.requestFullscreen();
    } else if (modalContent.webkitRequestFullscreen) { /* Safari */
      modalContent.webkitRequestFullscreen();
    } else if (modalContent.msRequestFullscreen) { /* IE11 */
      modalContent.msRequestFullscreen();
    }
    isFullscreen = true;
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
    }
    isFullscreen = false;
  }
  
  // Listen for fullscreen change events
  document.addEventListener('fullscreenchange', updateFullscreenButtonText);
  document.addEventListener('webkitfullscreenchange', updateFullscreenButtonText);
  document.addEventListener('mozfullscreenchange', updateFullscreenButtonText);
  document.addEventListener('MSFullscreenChange', updateFullscreenButtonText);
}

/**
 * Update fullscreen button text based on current state
 */
function updateFullscreenButtonText() {
  const fullscreenButton = document.getElementById('fullscreen-toggle');
  if (fullscreenButton) {
    isFullscreen = !!document.fullscreenElement || !!document.webkitFullscreenElement;
    fullscreenButton.textContent = isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
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
        renderPageToCanvas(rightPage, secondPageCanvas, secondCtx);
      }
      
      // Update page display number
      const pageNum = document.getElementById('page-num');
      if (pageNum) {
        pageNum.textContent = leftPage === rightPage ? leftPage : `${leftPage}-${rightPage}`;
      }
    }
  }
}

/**
 * Render a page to a specific canvas
 */
function renderPageToCanvas(pageNumber, targetCanvas, targetCtx) {
  if (!pdfDoc) return;
  
  pageRendering = true;
  
  pdfDoc.getPage(pageNumber).then(function(page) {
    const viewport = page.getViewport({ scale: scale });
    
    targetCanvas.height = viewport.height;
    targetCanvas.width = viewport.width;
    
    const renderContext = {
      canvasContext: targetCtx,
      viewport: viewport
    };
    
    const renderTask = page.render(renderContext);
    
    renderTask.promise.then(function() {
      pageRendering = false;
      
      if (pageNumPending !== null) {
        renderCurrentPages();
        pageNumPending = null;
      }
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
 * Go to previous page
 */
function onPrevPage() {
  if (!pdfDoc || currentPage <= 1) return;
  
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
  
  queueRenderPage(currentPage);
}

/**
 * Go to next page
 */
function onNextPage() {
  if (!pdfDoc || currentPage >= pdfDoc.numPages) return;
  
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
  
  queueRenderPage(currentPage);
}

/**
 * Handle keyboard navigation
 */
function handleKeyPress(event) {
  if (!pdfDoc) return;
  
  if (event.key === 'ArrowLeft') {
    onPrevPage();
    event.preventDefault();
  } else if (event.key === 'ArrowRight') {
    onNextPage();
    event.preventDefault();
  } else if (event.key === 'Escape') {
    closeModal();
  }
}

/**
 * Zoom in
 */
function onZoomIn() {
  scale += 0.25;
  if (pdfDoc) renderCurrentPages();
}

/**
 * Zoom out
 */
function onZoomOut() {
  if (scale <= 0.5) return;
  scale -= 0.25;
  if (pdfDoc) renderCurrentPages();
}

/**
 * Close the modal
 */
function closeModal() {
  try {
    // Exit fullscreen if active
    if (isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
    
    // Remove fullscreen listeners
    document.removeEventListener('fullscreenchange', updateFullscreenButtonText);
    document.removeEventListener('webkitfullscreenchange', updateFullscreenButtonText);
    document.removeEventListener('mozfullscreenchange', updateFullscreenButtonText);
    document.removeEventListener('MSFullscreenChange', updateFullscreenButtonText);
    
    const modal = document.getElementById('magazine-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
    
    // Remove keyboard listener
    window.removeEventListener('keydown', handleKeyPress);
    
    // Clear PDF data
    pdfDoc = null;
    pageRendering = false;
    pageNumPending = null;
    currentPage = 1;
    isFullscreen = false;
    viewMode = 'single'; // Reset to single page view for next time
  } catch (error) {
    console.error('Error closing modal:', error);
  }
}

// Close modal when clicking outside the content
window.onclick = function(event) {
  const modal = document.getElementById('magazine-modal');
  if (event.target === modal) {
    closeModal();
  }
};