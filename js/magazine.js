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
 * Opens a magazine in a modal with consistent styling
 */
function openMagazine(embedUrl) {
    console.log('Opening magazine:', embedUrl);
    
    const modal = document.getElementById('magazine-modal');
    const embedContainer = document.getElementById('embed-container');
    
    if (!modal || !embedContainer) {
        console.error('Magazine modal elements not found');
        return;
    }
    
    // Modify URL to use clean mode and hide toolbar
    let enhancedUrl = embedUrl;
    
    // Add parameters if they don't already exist
    if (!enhancedUrl.includes('?')) {
        enhancedUrl += '?';
    } else {
        enhancedUrl += '&';
    }
    
    // Add clean parameters to match the first screenshot
    enhancedUrl += 'view=simple&toolbar=0&navpane=0&embedded=true&ui=custom';
    
    // Create the iframe with customized settings
    embedContainer.innerHTML = `
        <iframe 
            src="${enhancedUrl}" 
            seamless="seamless" 
            scrolling="no" 
            frameborder="0" 
            allowtransparency="true" 
            allowfullscreen="true"
            webkitallowfullscreen="true"
            mozallowfullscreen="true"
            id="magazine-iframe">
        </iframe>
        <div class="navigation-overlay" id="nav-overlay">
            <div class="nav-instructions">
                Use FlipHTML5 controls or <a href="${embedUrl}" target="_blank" style="color: blue; text-decoration: underline;">open in a new window</a>
            </div>
        </div>
    `;
    
    // Display the modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
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