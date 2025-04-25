/**
 * Transmission Magazine page JavaScript
 * Handles magazine viewing functionality with FlipHTML5 embeds
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize magazine covers click events
    initMagazineCovers();
    
    // Set up lightbox close functionality
    initLightbox();
});

/**
 * Initialize magazine covers click events
 */
function initMagazineCovers() {
    const magazineCovers = document.querySelectorAll('.magazine-cover');
    
    magazineCovers.forEach(cover => {
        cover.addEventListener('click', function() {
            // Get the parent magazine issue element
            const magazineIssue = this.closest('.magazine-issue');
            
            // Get the embed iframe from the magazine issue
            const embedIframe = magazineIssue.querySelector('.magazine-embed iframe');
            
            if (embedIframe) {
                // Get the src attribute of the iframe
                const embedSrc = embedIframe.getAttribute('src');
                
                // Open the magazine in the lightbox
                openMagazineLightbox(embedSrc);
            }
        });
    });
}

/**
 * Initialize lightbox functionality
 */
function initLightbox() {
    const lightbox = document.getElementById('magazine-lightbox');
    const closeBtn = document.querySelector('.close-lightbox');
    
    if (closeBtn && lightbox) {
        // Close button click
        closeBtn.addEventListener('click', function() {
            closeLightbox();
        });
        
        // Close lightbox when clicking outside content
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Keyboard navigation - ESC to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
}

/**
 * Opens the magazine lightbox with the specified embed URL
 * @param {string} embedSrc - The source URL for the embed iframe
 */
function openMagazineLightbox(embedSrc) {
    const lightbox = document.getElementById('magazine-lightbox');
    const embedContainer = document.getElementById('magazine-embed-container');
    
    if (!lightbox || !embedContainer) return;
    
    // Create iframe for the embed
    embedContainer.innerHTML = `
        <iframe 
            src="${embedSrc}" 
            style="width:100%; height:100%;" 
            seamless="seamless" 
            scrolling="no" 
            frameborder="0" 
            allowtransparency="true" 
            allowfullscreen="true">
        </iframe>
    `;
    
    // Show lightbox
    lightbox.classList.add('active');
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

/**
 * Closes the magazine lightbox
 */
function closeLightbox() {
    const lightbox = document.getElementById('magazine-lightbox');
    const embedContainer = document.getElementById('magazine-embed-container');
    
    if (!lightbox) return;
    
    // Hide lightbox
    lightbox.classList.remove('active');
    
    // Clear embed content (to stop any audio/video)
    if (embedContainer) {
        embedContainer.innerHTML = '';
    }
    
    // Allow body scrolling
    document.body.style.overflow = '';
}