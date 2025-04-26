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
 * Opens a magazine in a modal using PDF.js
 */
function openMagazine(magazinePath) {
    console.log('Opening magazine:', magazinePath);
    
    // Get the magazine name from the path (for FlipHTML5 URLs)
    let pdfName = '';
    
    // Handle different input types (FlipHTML5 URL vs direct PDF path)
    if (magazinePath.includes('fliphtml5.com')) {
        // Extract magazine name from FlipHTML5 URL
        const urlParts = magazinePath.split('/');
        const lastPart = urlParts[urlParts.length - 2] || 'magazine';
        
        // Map to corresponding PDF file based on naming convention in your folder
        // This mapping depends on your file organization
        if (lastPart === 'sztl') pdfName = 'pdfs/01 Issue 01 Transition.pdf';
        else if (lastPart === 'drjt') pdfName = 'pdfs/02 Issue 02 Transparency.pdf';
        else if (lastPart === 'eihk') pdfName = 'pdfs/03 FNT Photojournalism.pdf';
        else if (lastPart === 'ageg') pdfName = 'pdfs/04 Issue 03 Transform.pdf';
        else if (lastPart === 'gciq') pdfName = 'pdfs/05 Presents New Faces.pdf';
        else if (lastPart === 'inek') pdfName = 'pdfs/06 Presents Cote_Ciel Lookbook.pdf';
        else if (lastPart === 'wtcx') pdfName = 'pdfs/07 Presents Lindsey Wixson.pdf';
        else if (lastPart === 'jvpp') pdfName = 'pdfs/08 Showcase Le Cam Romain.pdf';
        else if (lastPart === 'bchq') pdfName = 'pdfs/09 Issue 03-04 Intermission.pdf';
    } else {
        // Direct PDF path
        pdfName = magazinePath;
    }
    
    const modal = document.getElementById('magazine-modal');
    const embedContainer = document.getElementById('embed-container');
    
    if (!modal || !embedContainer) {
        console.error('Magazine modal elements not found');
        return;
    }
    
    // Create PDF viewer UI
    embedContainer.innerHTML = `
        <div class="pdf-viewer-container">
            <div id="pdf-loading" class="pdf-loading">Loading...</div>
            <div id="pdf-error" class="pdf-error" style="display: none;"></div>
            
            <div class="pdf-controls">
                <button id="prev-page" class="pdf-nav-btn">&lt; Previous</button>
                <span class="pdf-page-info">Page <span id="current-page">1</span> of <span id="page-count">-</span></span>
                <button id="next-page" class="pdf-nav-btn">Next &gt;</button>
                
                <div class="pdf-zoom-controls">
                    <button id="zoom-out" class="pdf-zoom-btn">-</button>
                    <span>Zoom</span>
                    <button id="zoom-in" class="pdf-zoom-btn">+</button>
                </div>
            </div>
            
            <div class="pdf-canvas-container">
                <canvas id="pdf-canvas"></canvas>
            </div>
        </div>
    `;
    
    // Display the modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Initialize PDF viewer with the PDF path
    if (typeof initPdfViewer === 'function') {
        // Small delay to ensure the DOM is ready
        setTimeout(() => {
            initPdfViewer(pdfName);
        }, 100);
    } else {
        console.error('PDF viewer not initialized - make sure pdf-viewer.js is loaded');
        embedContainer.innerHTML = '<div class="pdf-error">PDF viewer not available</div>';
    }
    
    // Add keyboard navigation for closing the modal
    window.addEventListener('keydown', handleKeyNavigation);
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