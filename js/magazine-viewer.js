/**
 * Simple Magazine PDF Viewer
 * A reliable, straightforward PDF viewer for magazine display
 */

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// State variables
let pdfDoc = null;
let currentPage = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;
let canvas = null;
let ctx = null;

/**
 * Opens a magazine PDF in the modal
 */
function openMagazine(pdfPath) {
  console.log('Opening magazine:', pdfPath);
  
  const modal = document.getElementById('magazine-modal');
  if (!modal) {
    console.error('Magazine modal not found');
    return;
  }
  
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
          <canvas id="pdf-canvas"></canvas>
        </div>
        
        <div class="pdf-controls">
          <button id="prev-button" class="nav-button">&lt; Previous</button>
          <span id="page-info" class="page-info">Page <span id="page-num">1</span> / <span id="page-count">?</span></span>
          <button id="next-button" class="nav-button">Next &gt;</button>
          
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
  
  // Get canvas reference after DOM update
  canvas = document.getElementById('pdf-canvas');
  ctx = canvas.getContext('2d');
  
  // Set up event listeners
  document.getElementById('prev-button').addEventListener('click', onPrevPage);
  document.getElementById('next-button').addEventListener('click', onNextPage);
  document.getElementById('zoom-in').addEventListener('click', onZoomIn);
  document.getElementById('zoom-out').addEventListener('click', onZoomOut);
  
  // Add keyboard navigation
  window.addEventListener('keydown', handleKeyPress);
  
  // Load the PDF
  loadPdf(pdfPath);
}

/**
 * Load a PDF document
 */
function loadPdf(pdfPath) {
  document.getElementById('loading-indicator').style.display = 'flex';
  document.getElementById('error-message').style.display = 'none';
  
  // Load the PDF document
  pdfjsLib.getDocument(pdfPath).promise
    .then(function(pdf) {
      pdfDoc = pdf;
      
      // Update page count
      document.getElementById('page-count').textContent = pdf.numPages;
      document.getElementById('loading-indicator').style.display = 'none';
      
      // Render first page
      renderPage(currentPage);
    })
    .catch(function(error) {
      // Handle errors
      console.error('Error loading PDF:', error);
      document.getElementById('loading-indicator').style.display = 'none';
      document.getElementById('error-message').textContent = 'Error loading PDF: ' + error.message;
      document.getElementById('error-message').style.display = 'block';
    });
}

/**
 * Render a page of the PDF
 */
function renderPage(pageNumber) {
  pageRendering = true;
  
  // Update page status
  document.getElementById('page-num').textContent = pageNumber;
  
  // Get the page
  pdfDoc.getPage(pageNumber).then(function(page) {
    // Calculate viewport to fit container width
    const viewport = page.getViewport({ scale: scale });
    
    // Set canvas dimensions
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // Render the page
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    
    const renderTask = page.render(renderContext);
    
    // Wait for rendering to finish
    renderTask.promise.then(function() {
      pageRendering = false;
      
      // Check if there's another page rendering queued
      if (pageNumPending !== null) {
        // New page rendering is pending
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });
}

/**
 * Queue rendering a page if already rendering
 */
function queueRenderPage(pageNum) {
  if (pageRendering) {
    pageNumPending = pageNum;
  } else {
    renderPage(pageNum);
  }
}

/**
 * Go to previous page
 */
function onPrevPage() {
  if (currentPage <= 1) {
    return;
  }
  currentPage--;
  queueRenderPage(currentPage);
}

/**
 * Go to next page
 */
function onNextPage() {
  if (currentPage >= pdfDoc.numPages) {
    return;
  }
  currentPage++;
  queueRenderPage(currentPage);
}

/**
 * Handle keyboard navigation
 */
function handleKeyPress(event) {
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
  renderPage(currentPage);
}

/**
 * Zoom out
 */
function onZoomOut() {
  if (scale <= 0.5) return;
  scale -= 0.25;
  renderPage(currentPage);
}

/**
 * Close the modal
 */
function closeModal() {
  const modal = document.getElementById('magazine-modal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  
  // Remove keyboard listener
  window.removeEventListener('keydown', handleKeyPress);
  
  // Clear PDF data
  pdfDoc = null;
  pageRendering = false;
  pageNumPending = null;
  currentPage = 1;
}

// Close modal when clicking outside the content
window.onclick = function(event) {
  const modal = document.getElementById('magazine-modal');
  if (event.target === modal) {
    closeModal();
  }
};