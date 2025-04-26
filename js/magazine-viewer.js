/**
 * Enhanced Magazine Viewer (magazine-viewer.js)
 * A more elegant PDF viewer with magazine-style display
 */

// Configuration
const MAGAZINE_CONFIG = {
    doublePage: true,      // Show double pages for magazine spread effect
    coverAsSingle: true,   // Show cover and back cover as single pages
    usePageTransition: true, // Use page turn animation
    preloadPages: 3,       // Number of pages to preload ahead
    initialZoom: 1.0       // Initial zoom level
  };
  
  // PDF.js worker configuration
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
  
  // State variables
  let pdfDoc = null;
  let currentPageNum = 1;
  let pagesRendering = false;
  let pageNumPending = null;
  let scale = MAGAZINE_CONFIG.initialZoom;
  let magazineContainer = null;
  let pageCache = {};
  let magazineWrapper = null;
  
  /**
   * Initialize the Magazine Viewer with a specific PDF
   */
  function initMagazineViewer(pdfPath) {
    console.log('Initializing Magazine Viewer for:', pdfPath);
    
    // Show loading indicator
    document.getElementById('magazine-loading').style.display = 'flex';
    
    // Containers
    magazineContainer = document.getElementById('magazine-container');
    magazineWrapper = document.getElementById('magazine-wrapper');
    
    // Loading the PDF
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    loadingTask.promise.then(function(pdf) {
      console.log('PDF loaded successfully - ' + pdf.numPages + ' pages');
      
      pdfDoc = pdf;
      
      // Update page count in UI
      document.getElementById('total-pages').textContent = pdf.numPages;
      
      // Setup navigation
      setupNavigation();
      
      // Initial render
      renderCurrentSpread();
      
      // Preload next pages
      preloadPages(currentPageNum + 2, MAGAZINE_CONFIG.preloadPages);
      
      // Hide loading indicator on success
      document.getElementById('magazine-loading').style.display = 'none';
      
    }).catch(function(error) {
      console.error('Error loading PDF:', error);
      document.getElementById('magazine-error').textContent = 'Could not load magazine: ' + error.message;
      document.getElementById('magazine-error').style.display = 'block';
      document.getElementById('magazine-loading').style.display = 'none';
    });
  }
  
  /**
   * Render the current magazine spread (single or double page)
   */
  function renderCurrentSpread() {
    pagesRendering = true;
    
    // Clear current content
    magazineContainer.innerHTML = '';
    
    // Update page number display
    updatePageDisplay();
    
    // Determine if we should show a single page or a spread
    let isFirstPage = currentPageNum === 1;
    let isLastPage = currentPageNum === pdfDoc.numPages;
    let isSinglePage = isFirstPage || isLastPage || !MAGAZINE_CONFIG.doublePage;
    
    if (isSinglePage) {
      // Single page view (for cover page)
      renderPage(currentPageNum, true)
        .then(() => {
          pagesRendering = false;
          checkForPendingRender();
        });
    } else {
      // Double page view (magazine spread)
      // Make sure we're on an even page for the left side
      let leftPage = currentPageNum % 2 === 0 ? currentPageNum : currentPageNum - 1;
      let rightPage = leftPage + 1;
      
      // Only show right page if it exists
      if (rightPage <= pdfDoc.numPages) {
        Promise.all([
          renderPage(leftPage, false, 'left'),
          renderPage(rightPage, false, 'right')
        ]).then(() => {
          pagesRendering = false;
          checkForPendingRender();
        });
      } else {
        renderPage(leftPage, true)
          .then(() => {
            pagesRendering = false;
            checkForPendingRender();
          });
      }
    }
  }
  
  /**
   * Render a PDF page to canvas
   */
  function renderPage(pageNum, isSingle, position = 'center') {
    return new Promise((resolve, reject) => {
      // Check if we already have this page in cache
      if (pageCache[pageNum]) {
        addPageToContainer(pageCache[pageNum], isSingle, position);
        resolve();
        return;
      }
      
      pdfDoc.getPage(pageNum).then(page => {
        const viewport = page.getViewport({ scale });
        
        // Create page container
        const pageContainer = document.createElement('div');
        pageContainer.className = 'magazine-page ' + 
                                 (isSingle ? 'page-single' : 'page-double') + 
                                 (position ? ' page-' + position : '');
                                 
        // Create canvas for this page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Add canvas to page container
        pageContainer.appendChild(canvas);
        
        // Add page number
        const pageLabel = document.createElement('div');
        pageLabel.className = 'page-number';
        pageLabel.textContent = pageNum;
        pageContainer.appendChild(pageLabel);
        
        // Render PDF page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        page.render(renderContext).promise.then(() => {
          // Cache this page for later
          pageCache[pageNum] = pageContainer;
          
          // Add page to container
          addPageToContainer(pageContainer, isSingle, position);
          resolve();
        }).catch(error => {
          console.error('Error rendering page ' + pageNum + ':', error);
          reject(error);
        });
      }).catch(error => {
        console.error('Error getting page ' + pageNum + ':', error);
        reject(error);
      });
    });
  }
  
  /**
   * Add a rendered page to the magazine container
   */
  function addPageToContainer(pageElement, isSingle, position) {
    // Clone the element so we don't remove it from cache when clearing container
    const pageClone = pageElement.cloneNode(true);
    
    // Add to magazine container
    magazineContainer.appendChild(pageClone);
    
    // Apply single/double page styling to container
    magazineContainer.className = isSingle ? 'single-page-view' : 'double-page-view';
  }
  
  /**
   * Update the page display in UI
   */
  function updatePageDisplay() {
    document.getElementById('current-page').textContent = currentPageNum;
    
    // Update navigation buttons state
    document.getElementById('prev-page').disabled = currentPageNum <= 1;
    document.getElementById('next-page').disabled = currentPageNum >= pdfDoc.numPages;
    document.getElementById('first-page').disabled = currentPageNum <= 1;
    document.getElementById('last-page').disabled = currentPageNum >= pdfDoc.numPages;
  }
  
  /**
   * Queue a rendering if another render is in progress
   */
  function checkForPendingRender() {
    if (pageNumPending !== null) {
      currentPageNum = pageNumPending;
      pageNumPending = null;
      renderCurrentSpread();
    }
  }
  
  /**
   * Navigate to a specific page
   */
  function goToPage(pageNum) {
    if (pageNum < 1 || pageNum > pdfDoc.numPages) {
      return;
    }
    
    if (pagesRendering) {
      pageNumPending = pageNum;
    } else {
      currentPageNum = pageNum;
      renderCurrentSpread();
      
      // Preload next pages
      preloadPages(pageNum + 2, MAGAZINE_CONFIG.preloadPages);
    }
  }
  
  /**
   * Preload pages to improve performance
   */
  function preloadPages(startPage, count) {
    for (let i = 0; i < count; i++) {
      const pageToPreload = startPage + i;
      if (pageToPreload <= pdfDoc.numPages && !pageCache[pageToPreload]) {
        pdfDoc.getPage(pageToPreload).then(page => {
          const viewport = page.getViewport({ scale });
          
          const pageContainer = document.createElement('div');
          pageContainer.className = 'magazine-page'; 
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          pageContainer.appendChild(canvas);
          
          const pageLabel = document.createElement('div');
          pageLabel.className = 'page-number';
          pageLabel.textContent = pageToPreload;
          pageContainer.appendChild(pageLabel);
          
          page.render({
            canvasContext: context,
            viewport: viewport
          }).promise.then(() => {
            pageCache[pageToPreload] = pageContainer;
          });
        });
      }
    }
  }
  
  /**
   * Setup navigation controls
   */
  function setupNavigation() {
    // Page navigation
    document.getElementById('prev-page').addEventListener('click', () => {
      goToPage(currentPageNum - (MAGAZINE_CONFIG.doublePage ? 2 : 1));
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
      goToPage(currentPageNum + (MAGAZINE_CONFIG.doublePage ? 2 : 1));
    });
    
    document.getElementById('first-page').addEventListener('click', () => {
      goToPage(1);
    });
    
    document.getElementById('last-page').addEventListener('click', () => {
      goToPage(pdfDoc.numPages);
    });
    
    // Zoom controls
    document.getElementById('zoom-in').addEventListener('click', () => {
      scale += 0.2;
      pageCache = {}; // Clear cache when zooming
      renderCurrentSpread();
    });
    
    document.getElementById('zoom-out').addEventListener('click', () => {
      if (scale > 0.4) {
        scale -= 0.2;
        pageCache = {}; // Clear cache when zooming
        renderCurrentSpread();
      }
    });
    
    document.getElementById('zoom-reset').addEventListener('click', () => {
      scale = MAGAZINE_CONFIG.initialZoom;
      pageCache = {}; // Clear cache when zooming
      renderCurrentSpread();
    });
    
    // View mode toggle
    document.getElementById('view-toggle').addEventListener('click', () => {
      MAGAZINE_CONFIG.doublePage = !MAGAZINE_CONFIG.doublePage;
      document.getElementById('view-toggle').textContent = 
        MAGAZINE_CONFIG.doublePage ? 'Single Page' : 'Double Page';
      renderCurrentSpread();
    });
    
    // Keyboard navigation
    window.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        goToPage(currentPageNum - (MAGAZINE_CONFIG.doublePage ? 2 : 1));
        event.preventDefault();
      } else if (event.key === 'ArrowRight') {
        goToPage(currentPageNum + (MAGAZINE_CONFIG.doublePage ? 2 : 1));
        event.preventDefault();
      } else if (event.key === 'Home') {
        goToPage(1);
        event.preventDefault();
      } else if (event.key === 'End') {
        goToPage(pdfDoc.numPages);
        event.preventDefault();
      }
    });
  }
  
  /**
   * Opens a magazine in the modal using the enhanced viewer
   */
  function openMagazine(pdfPath) {
    console.log('Opening magazine:', pdfPath);
    
    const modal = document.getElementById('magazine-modal');
    const modalContent = document.querySelector('#magazine-modal .modal-content');
    
    if (!modal) {
      console.error('Magazine modal not found');
      return;
    }
    
    // Clear any existing content and set up the viewer structure
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
    
    // Display the modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
    
    // Initialize the magazine viewer with a slight delay to ensure DOM is ready
    setTimeout(() => {
      initMagazineViewer(pdfPath);
    }, 100);
  }
  
  /**
   * Closes the magazine modal
   */
  function closeModal() {
    const modal = document.getElementById('magazine-modal');
    
    if (!modal) {
      console.error('Modal not found');
      return;
    }
    
    // Hide the modal
    modal.style.display = 'none';
    
    // Re-enable page scrolling
    document.body.style.overflow = 'auto';
    
    // Clear PDF data and cache to free memory
    pdfDoc = null;
    pageCache = {};
  }
  
  // Close modal when clicking outside the content
  window.addEventListener('click', (event) => {
    const modal = document.getElementById('magazine-modal');
    if (event.target === modal) {
      closeModal();
    }
  });