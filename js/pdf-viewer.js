/**
 * PDF Viewer for Transmission Magazine using PDF.js
 */

// The workerSrc property needs to be specified
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// Current state variables
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.2;
let canvas = null;
let ctx = null;

/**
 * Initialize the PDF viewer with a specific PDF
 */
function initPdfViewer(pdfPath) {
  console.log('Initializing PDF viewer for:', pdfPath);
  
  canvas = document.getElementById('pdf-canvas');
  ctx = canvas.getContext('2d');
  
  // Loading the PDF
  const loadingTask = pdfjsLib.getDocument(pdfPath);
  loadingTask.promise.then(function(pdf) {
    console.log('PDF loaded successfully');
    
    pdfDoc = pdf;
    document.getElementById('page-count').textContent = pdf.numPages;
    document.getElementById('current-page').textContent = pageNum;
    
    // Initial render of the first page
    renderPage(pageNum);
    
    // Set up navigation buttons
    document.getElementById('prev-page').addEventListener('click', onPrevPage);
    document.getElementById('next-page').addEventListener('click', onNextPage);
    
    // Set up zoom controls
    document.getElementById('zoom-in').addEventListener('click', onZoomIn);
    document.getElementById('zoom-out').addEventListener('click', onZoomOut);
  }).catch(function(reason) {
    console.error('Error loading PDF:', reason);
    document.getElementById('pdf-error').textContent = 'Could not load PDF: ' + reason;
    document.getElementById('pdf-error').style.display = 'block';
  });
}

/**
 * Render a specific page of the PDF
 */
function renderPage(num) {
  pageRendering = true;
  
  // Show loading indicator
  document.getElementById('pdf-loading').style.display = 'block';
  
  // Get the page
  pdfDoc.getPage(num).then(function(page) {
    const viewport = page.getViewport({ scale });
    
    // Set canvas dimensions to match the viewport
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // Render the PDF page
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    
    const renderTask = page.render(renderContext);
    
    // Wait for rendering to finish
    renderTask.promise.then(function() {
      pageRendering = false;
      document.getElementById('pdf-loading').style.display = 'none';
      
      // Check if there's a page queued
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });
  
  // Update UI
  document.getElementById('current-page').textContent = num;
}

/**
 * Queue a page rendering if another page is currently being rendered
 */
function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

/**
 * Navigate to previous page
 */
function onPrevPage() {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
}

/**
 * Navigate to next page
 */
function onNextPage() {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
}

/**
 * Zoom in
 */
function onZoomIn() {
  scale += 0.25;
  queueRenderPage(pageNum);
}

/**
 * Zoom out
 */
function onZoomOut() {
  if (scale <= 0.5) {
    return;
  }
  scale -= 0.25;
  queueRenderPage(pageNum);
}